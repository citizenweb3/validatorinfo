# Smart PR Fix — Design Document

**Date:** 2026-03-19
**Status:** Approved
**Branch:** workforce (then sync to dev + main)
**File:** `.github/workflows/pr-fix.yml`
**Tasks:** #29 (self-healing), #30 (decision loop)

---

## Problem

Current pr-fix has three issues:

1. **Blind fixes.** Agent receives only current review comments. Does not see its own previous commits or previous review iterations. Each iteration starts from zero context.
2. **Dumb limit.** After 2 failed iterations for bot reviews, agent writes "manual fix required" and stops. No explanation why, no alternative proposal.
3. **No escalation.** If the same comment appears 3 times, agent tries the same approach again. No decision logic to change strategy or give up intelligently.

## Solution

Three changes to pr-fix.yml, all within the existing workflow structure. No new tables, files, or services.

### Change 1: Collect PR History

Before building the prompt, collect two additional data sources:

```bash
# Previous fix commits on this branch
FIX_COMMITS=$(git log --oneline --grep="auto-fix iteration" \
  origin/dev..HEAD 2>/dev/null || echo "No previous fix commits")

# All PR comments (not just reviews — includes agent's own explanations)
PR_COMMENTS=$(gh pr view "$PR_NUMBER" \
  --json comments \
  -q '[.comments[]] | map(.body) | join("\n---\n")')
```

Add to prompt file as a new section:

```
## PR FIX HISTORY (your previous attempts):
{FIX_COMMITS}

## PR COMMENTS (conversation history):
{PR_COMMENTS}
```

This goes BEFORE the review sections so the agent reads context first.

### Change 2: Use StackAgent Persona + Smart Fix Instructions

Replace the current inline prompt with agent persona loading. Instead of
building a custom prompt from scratch, load `.claude/agents/fullstack.md`
as the agent persona and append review context as the task.

The agent then operates as StackAgent: reads CLAUDE.md, uses
team-feature-development skill, delegates to Agent Teams, reviews output,
commits. The review feedback becomes the "issue" that StackAgent works on.

The prompt file structure becomes:

```
## TASK: Fix review feedback on PR #{N}

ITERATION: {N} of 3

## PR FIX HISTORY (your previous attempts):
{FIX_COMMITS}

## PR COMMENTS (conversation history):
{PR_COMMENTS}

## HUMAN REVIEW (HIGHEST PRIORITY):
{HUMAN_COMMENTS}

## AUTOMATED REVIEW (lower priority):
{BOT_COMMENTS}

BEFORE fixing anything:
1. Read the PR FIX HISTORY above. These are your previous fix commits.
2. Read ALL review comments (human + bot), not just the latest.
3. Identify which review comments are NEW (first time) vs REPEATED
   (appeared in a previous review iteration).
4. For REPEATED comments: your previous approach did not work.
   Analyze WHY by reading your fix commit and the repeated comment.
   Try a DIFFERENT approach this time.
5. For NEW comments: fix normally.

CONFLICT RULE: If human and automated reviews contradict each other,
ALWAYS follow the human review.

If this is iteration 3 (final) and you cannot resolve a comment:
- Write a PR comment for EACH unresolved issue:
  "Could not fix: [issue summary]
   Reason: [why your attempts failed]
   Alternative: [proposed different approach]"
- Do NOT force a fix you are not confident about.

Commit message: fix: address review feedback (auto-fix iteration {N})
Do NOT add any Co-Authored-By trailer to commit messages.
```

The `claude -p` call adds `--append-system-prompt` to load fullstack.md:

```bash
claude -p "$(cat "$PROMPT_FILE")" \
  --model claude-opus-4-6 \
  --append-system-prompt "$(cat .claude/agents/fullstack.md)" \
  --dangerously-skip-permissions \
  --output-format text
```

### Change 3: Increase Limit to 3

In the "Check iteration limit" step, change:

```bash
# Was:
if [ "$IS_HUMAN" = "false" ] && [ "$COUNT" -ge "2" ]; then
# Now:
if [ "$IS_HUMAN" = "false" ] && [ "$COUNT" -ge "3" ]; then
```

Update the comment message accordingly:
```
"Auto-fix limit (3) reached for automated reviews. Agent provided explanations for unresolved issues above."
```

---

## Changes Summary

| What | Where | Type |
|------|-------|------|
| Collect FIX_COMMITS | Fix step, before prompt build | New bash variable |
| Collect PR_COMMENTS | Fix step, before prompt build | New bash variable |
| Load fullstack.md as persona | claude -p call, --append-system-prompt | New flag |
| Restructure prompt file | Prompt file | Rewritten (task + history + instructions) |
| Add iteration-aware instructions | Prompt file | New prompt section |
| Change limit 2 → 3 | Check iteration limit step | One line change |
| Update limit message | Check iteration limit step | Text change |

## What Does NOT Change

- Workflow triggers (pull_request_review + issue_comment)
- Concurrency settings
- Human vs bot detection logic
- Monitoring/logging to SQLite
- Git push mechanism
- Rebase on dev step
- Dependencies install step

## Testing

1. Create a test PR with an intentional bug
2. Let pr-review flag it
3. pr-fix iteration 1: agent fixes wrong (or partially)
4. pr-review flags again (same comment)
5. pr-fix iteration 2: agent should identify repeated comment and try different approach
6. If still fails, iteration 3: agent writes explanation + alternative in PR comment

## Risk

Low. Changes are prompt-only (no code logic changes except the limit number). If the new prompt performs worse, reverting is one line change back to the old prompt text.
