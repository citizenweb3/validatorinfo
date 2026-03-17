# Execution + Review Pipeline Design

**Date:** 2026-02-16
**Status:** Approved
**Scope:** Layer 2 of Personal Corporation -- fully autonomous execution and review pipeline on self-hosted GNU server

---

## Overview

Claude Code + adaptive subagent team on self-hosted GNU server. Full autonomous cycle:

```
Phone: assign task → Server: execute + PR → Server: auto-review →
User: approve/reject from phone → If rejected: auto-fix (max 2 iterations)
```

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    HOME SERVER (GNU/Linux)                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              GitHub Self-Hosted Runner (24/7)               │  │
│  │  systemd service: always listening for GitHub events        │  │
│  └──────────┬────────────────┬────────────────┬───────────────┘  │
│             │                │                │                   │
│    ┌────────▼───────┐ ┌──────▼──────┐ ┌───────▼──────┐          │
│    │ task-execute   │ │ pr-review   │ │ pr-fix       │          │
│    │ issue labeled  │ │ PR created  │ │ changes_req  │          │
│    │ "agent:claude" │ │             │ │              │          │
│    └────────┬───────┘ └──────┬──────┘ └───────┬──────┘          │
│             │                │                │                   │
│    ┌────────▼────────────────▼────────────────▼──────┐           │
│    │              Claude Code (local install)         │           │
│    │  Full MCP access:                                │           │
│    │  • Figma MCP → design extraction                 │           │
│    │  • Playwright MCP → headless visual testing      │           │
│    │  • DeepContext → codebase search                 │           │
│    │  • Context7 → library docs                       │           │
│    └─────────────────────┬──────────────────────────┘           │
│                          │                                       │
│  ┌───────────────────────▼──────────────────────────────────┐   │
│  │  GitHub Project Board                                     │   │
│  │  ┌──────┐ ┌──────┐ ┌───────────┐ ┌────────┐ ┌──────┐    │   │
│  │  │Backlog│→│ Todo │→│In Progress│→│ Review │→│ Done │    │   │
│  │  └──────┘ └──────┘ └───────────┘ └────────┘ └──────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
         │                              ▲
         │ PR + screenshots             │ Assign task (add label)
         ▼                              │
  ┌──────────────┐              ┌───────┴──────┐
  │   GitHub     │              │  Phone:      │
  │   (cloud)    │◄─────────────│  GitHub App  │
  └──────────────┘              └──────────────┘
```

### Full Phone-to-Merge Cycle

```
📱 Phone                          🖥️ Server (GNU)
──────                           ──────────────
1. Open GitHub App
2. Go to issue
3. Add label "agent:claude"        → runner receives event
                                    → Claude Code starts
                                    → reads issue + Figma (if frontend)
                                    → writes code
                                    → Playwright tests (headless)
                                    → creates PR with artifacts
4. Push notification:
   "PR #42 created"
                                    → auto-review starts
                                    → adaptive review team checks
5. Read review summary
6. Approve → merge                 → issue → Done
   or
   Request Changes                  → auto-fix (max 2x)
                                    → new review
7. Approve → merge
```

---

## Component 1: GitHub Actions Workflows

### 1.1 Auto-Review (`pr-review.yml`)

**Trigger:** PR created or updated (push to PR branch)

```yaml
name: AI Code Review
on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  review:
    # Skip if PR was created by the review bot itself (prevent loops)
    if: github.actor != 'github-actions[bot]'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: AI Review
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          model: claude-opus-4-6
          prompt: |
            You are the Lead Review Agent for the ValidatorInfo project.

            Review this PR using the adaptive review strategy:
            1. ALWAYS: Check code quality, bugs, security, project conventions
            2. IF error handling present: Check for silent failures
            3. IF new types/interfaces: Analyze type design quality
            4. IF PR > 200 lines with refactoring: Check for simplification opportunities
            5. IF test files present: Analyze test coverage
            6. IF JSDoc/comments > 20 lines: Check comment accuracy

            Format your review as:
            ## AI Review Summary
            ### Reviewers engaged: [list]
            ### Overall: APPROVE or REQUEST CHANGES

            Then for each reviewer, list findings with severity:
            - [HIGH] Blocking issues
            - [MED] Suggestions
            - [LOW] Nice to have

            Only HIGH severity findings should result in REQUEST CHANGES.

            Read the project's CLAUDE.md for conventions before reviewing.
          direct_prompt: true
```

### 1.2 Auto-Fix (`pr-fix.yml`)

**Trigger:** User submits review with "changes_requested"

```yaml
name: AI Auto-Fix
on:
  pull_request_review:
    types: [submitted]

permissions:
  contents: write
  pull-requests: write

jobs:
  auto-fix:
    # Only trigger on changes_requested from repo owner (not from bot)
    if: >
      github.event.review.state == 'changes_requested' &&
      github.event.review.user.login != 'github-actions[bot]'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.ref }}
          fetch-depth: 0

      - name: Check iteration count
        id: check-iterations
        run: |
          LABELS=$(gh pr view ${{ github.event.pull_request.number }} --json labels -q '.labels[].name')
          ITERATION=$(echo "$LABELS" | grep -oP 'auto-fix-iteration-\K\d+' || echo "0")
          echo "iteration=$ITERATION" >> $GITHUB_OUTPUT
          if [ "$ITERATION" -ge "2" ]; then
            gh pr comment ${{ github.event.pull_request.number }} \
              --body "Auto-fix limit reached (2 iterations). Manual fix required."
            echo "limit_reached=true" >> $GITHUB_OUTPUT
          else
            echo "limit_reached=false" >> $GITHUB_OUTPUT
          fi
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: AI Fix
        if: steps.check-iterations.outputs.limit_reached == 'false'
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          model: claude-opus-4-6
          prompt: |
            The PR reviewer requested changes. Read ALL review comments on this PR
            and fix the issues mentioned.

            Rules:
            - Only fix what was explicitly requested
            - Do not refactor unrelated code
            - Follow project conventions from CLAUDE.md
            - Commit with message: "fix: address review feedback (auto-fix iteration N)"
          direct_prompt: true

      - name: Update iteration label
        if: steps.check-iterations.outputs.limit_reached == 'false'
        run: |
          CURRENT=${{ steps.check-iterations.outputs.iteration }}
          NEXT=$((CURRENT + 1))
          # Remove old label if exists
          gh pr edit ${{ github.event.pull_request.number }} \
            --remove-label "auto-fix-iteration-$CURRENT" 2>/dev/null || true
          # Add new label
          gh label create "auto-fix-iteration-$NEXT" --force 2>/dev/null || true
          gh pr edit ${{ github.event.pull_request.number }} \
            --add-label "auto-fix-iteration-$NEXT"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Component 2: Lead Review Agent

**File:** `.claude/agents/pr-review-lead.md`

Custom agent prompt for adaptive review. Used both from CLI (`/review-pr`) and from GitHub Actions.

### Adaptive Selection Matrix

| Condition | Reviewer | Why |
|-----------|----------|-----|
| Always | code-reviewer | Core quality gate |
| try/catch, error handling | silent-failure-hunter | Catch swallowed errors |
| New types/interfaces | type-design-analyzer | Ensure type quality |
| PR > 200 lines + refactor | code-simplifier | Prevent complexity creep |
| Test files in diff | pr-test-analyzer | Verify coverage |
| JSDoc > 20 lines | comment-analyzer | Prevent comment rot |

### Output Format

```markdown
## AI Review Summary

### Reviewers engaged: code-reviewer, silent-failure-hunter
### Overall: REQUEST CHANGES

#### Code Quality (code-reviewer)
- [HIGH] SQL injection risk in line 42 of api/users.ts
- [MED] Consider extracting duplicate logic in lines 20-35

#### Error Handling (silent-failure-hunter)
- [HIGH] Empty catch block in fetchData() silently swallows errors

### Verdict: REQUEST CHANGES
### Blocking issues: 2
```

---

## Component 3: GitHub Project Adaptation

### New Custom Fields

| Field | Type | Values | Purpose |
|-------|------|--------|---------|
| `Agent` | Single Select | `claude`, `devin`, `jules`, `manual` | Task executor |
| `Priority` | Single Select | `P0-critical`, `P1-high`, `P2-medium`, `P3-low` | Priority |
| `Effort` | Single Select | `XS`, `S`, `M`, `L`, `XL` | Effort estimate |
| `Type` | Single Select | `feature`, `bug`, `refactor`, `research`, `infra` | Task type |
| `Review Status` | Single Select | `pending`, `reviewing`, `approved`, `changes-requested`, `merged` | Review tracking |

### Board Columns

```
Backlog → Todo → In Progress → Review → Done
```

### Built-in Project Automations

- Issue closed → moves to Done
- PR merged + linked to issue → issue moves to Done
- New issue → goes to Backlog

---

## Component 4: Issue Template for Agent Tasks

**File:** `.github/ISSUE_TEMPLATE/agent-task.md`

```markdown
---
name: Agent Task
about: Task for AI agent execution
labels: agent-task
---

### Task
[Clear description of what needs to be done]

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

### Context
- Related files:
- Dependencies:
- Branch:

### Agent Notes
<!-- Agent writes progress notes here during execution -->
```

---

## Implementation Plan

### Phase 1: Prerequisites
1. Install `gh` CLI
2. Authenticate with GitHub
3. Add `ANTHROPIC_API_KEY` to repo secrets

### Phase 2: GitHub Project Setup
1. Add custom fields to existing Project
2. Configure board columns
3. Set up built-in automations

### Phase 3: Agent & Workflow Files
1. Create `.claude/agents/pr-review-lead.md`
2. Create `.github/workflows/pr-review.yml`
3. Create `.github/workflows/pr-fix.yml`
4. Create `.github/ISSUE_TEMPLATE/agent-task.md`

### Phase 4: Testing
1. Create test PR
2. Verify review workflow triggers
3. Test request-changes → auto-fix cycle
4. Verify iteration limit works

---

## Component 5: Frontend Pipeline -- Figma → Code → Test

### Overview

Frontend tasks follow an extended pipeline: Figma design extraction → code generation → visual testing → PR with artifacts. This runs from **local CLI only** (Figma MCP and Playwright MCP require local execution).

### Flow

```
Issue on board: label "frontend" + Figma URL
         │
         ▼
  ┌──────────────────────┐
  │ CLI: /implement-figma │  ← run locally (MacBook)
  └──────┬───────────────┘
         │
         ▼
  ┌──────────────────────┐
  │ 1. Figma MCP:        │
  │    get_design_context │  → extract design, variables, code
  │    get_screenshot     │  → reference screenshot
  └──────┬───────────────┘
         │
         ▼
  ┌──────────────────────┐
  │ 2. Code Generation:  │
  │    figma:implement-   │  → React components
  │    design skill       │  → TailwindCSS, ARIA, i18n
  └──────┬───────────────┘
         │
         ▼
  ┌──────────────────────┐
  │ 3. Playwright MCP:   │
  │    Start dev server   │
  │    Navigate to page   │
  │    Take screenshot    │
  │    Compare with Figma │
  └──────┬───────────────┘
         │
         ▼
  ┌──────────────────────┐
  │ 4. PR with artifacts: │
  │    - Code             │
  │    - Figma screenshot │
  │    - Impl screenshot  │
  │    - Visual diff      │
  └──────────────────────┘
         │
         ▼
  GitHub Actions: auto-review (Component 1)
```

### Issue Template Extension

Frontend tasks use the same agent-task template with an additional Figma field:

```markdown
### Figma
<!-- Paste Figma frame URL -->
URL: https://figma.com/design/xxx/yyy?node-id=1-2
```

### MCP Requirements

Both MCP servers must be configured in Claude Code settings:
- **Playwright MCP** (`mcp__plugin_playwright_playwright__*`) -- browser automation for visual testing
- **Figma MCP** (`mcp__claude_ai_Figma__*`) -- design extraction and screenshot comparison

### Server Advantage

With self-hosted runner on GNU server, frontend pipeline runs **autonomously 24/7**. No need to wait for CLI session. Playwright runs headless, Figma MCP uses API (no GUI needed).

---

## Component 6: Task Execution Workflow

**File:** `.github/workflows/task-execute.yml`

Triggers when an issue receives the `agent:claude` label. Self-hosted runner picks up the task and executes it.

```yaml
name: AI Task Execution
on:
  issues:
    types: [labeled]

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  execute:
    if: github.event.label.name == 'agent:claude'
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Create branch
        run: |
          BRANCH="agent/issue-${{ github.event.issue.number }}-$(echo '${{ github.event.issue.title }}' | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | head -c 40)"
          git checkout -b "$BRANCH"
          echo "branch=$BRANCH" >> $GITHUB_OUTPUT
        id: branch

      - name: Execute task
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          model: claude-opus-4-6
          prompt: |
            You are an AI agent executing a task from the project board.

            ISSUE #${{ github.event.issue.number }}: ${{ github.event.issue.title }}
            BODY: ${{ github.event.issue.body }}

            Instructions:
            1. Read CLAUDE.md for project conventions
            2. If issue contains a Figma URL, use Figma MCP to extract design
            3. Implement the task following acceptance criteria
            4. If frontend work, use Playwright to verify the implementation visually
            5. Commit changes with message: "feat: [issue title] (#${{ github.event.issue.number }})"
            6. Create PR linking to this issue

            Rules:
            - Follow all project conventions from CLAUDE.md
            - Use TailwindCSS, proper i18n (all 3 locales), accessibility
            - No TODOs or placeholders
            - Keep changes focused on the issue scope
          direct_prompt: true

      - name: Create PR
        run: |
          gh pr create \
            --title "feat: ${{ github.event.issue.title }}" \
            --body "Closes #${{ github.event.issue.number }}

            ## Auto-generated by AI Agent

            Task: ${{ github.event.issue.title }}
            Issue: #${{ github.event.issue.number }}

            ---
            *This PR was automatically created by Claude Code agent.*" \
            --head "${{ steps.branch.outputs.branch }}"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Component 7: Self-Hosted Runner Setup

### Server Requirements

- GNU/Linux (Ubuntu 22.04+ recommended) or macOS
- Node.js 20+
- Git 2.40+
- Chromium (for Playwright headless)
- 4GB+ RAM, 20GB+ disk

### Installation

```bash
# 1. GitHub Actions Runner
mkdir ~/actions-runner && cd ~/actions-runner
curl -o actions-runner-linux-x64.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.XXX/actions-runner-linux-x64-2.XXX.tar.gz
tar xzf actions-runner-linux-x64.tar.gz
./config.sh --url https://github.com/citizenweb3/validatorinfo \
  --token YOUR_TOKEN --labels self-hosted,validatorinfo

# 2. Claude Code CLI
npm install -g @anthropic-ai/claude-code

# 3. Playwright dependencies (headless Chromium)
npx playwright install --with-deps chromium

# 4. Environment variables
echo 'export ANTHROPIC_API_KEY=sk-ant-xxx' >> ~/.bashrc
echo 'export FIGMA_ACCESS_TOKEN=xxx' >> ~/.bashrc

# 5. systemd service (auto-start on boot)
sudo cat > /etc/systemd/system/github-runner.service << 'EOF'
[Unit]
Description=GitHub Actions Self-Hosted Runner
After=network.target

[Service]
ExecStart=/home/runner/actions-runner/run.sh
User=runner
WorkingDirectory=/home/runner/actions-runner
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable github-runner
sudo systemctl start github-runner
```

### Labels for Phone Control

| Label | Action | Workflow |
|-------|--------|----------|
| `agent:claude` | Claude Code executes task | task-execute.yml |
| `agent:devin` | Reserved for Devin (if connected) | - |
| `type:frontend` | Agent uses Figma + Playwright | task-execute.yml |
| `type:backend` | Agent without frontend tools | task-execute.yml |
| `priority:p0` | Urgent execution | task-execute.yml |

---

## Implementation Plan

### Phase 1: Prerequisites (local machine)
1. Install `gh` CLI on MacBook
2. Authenticate with GitHub
3. Add `ANTHROPIC_API_KEY` to repo secrets (Settings → Secrets)
4. Create labels: `agent:claude`, `type:frontend`, `type:backend`, `priority:p0-p3`

### Phase 2: GitHub Project Adaptation
1. Add custom fields to existing Project (Agent, Priority, Effort, Type, Review Status)
2. Verify board columns (Backlog → Todo → In Progress → Review → Done)
3. Set up built-in automations (issue closed → Done, new issue → Backlog)

### Phase 3: Workflow & Agent Files (can start before server)
1. Create `.claude/agents/pr-review-lead.md` -- adaptive review lead agent
2. Create `.github/workflows/pr-review.yml` -- auto-review on PR
3. Create `.github/workflows/pr-fix.yml` -- auto-fix on changes_requested
4. Create `.github/workflows/task-execute.yml` -- task execution on label
5. Create `.github/ISSUE_TEMPLATE/agent-task.md` -- task template for agents

### Phase 4: Server Setup (GNU machine)
1. Install GitHub Actions self-hosted runner
2. Install Claude Code CLI + authenticate
3. Install Playwright + headless Chromium
4. Configure Figma MCP access (API token)
5. Set up systemd service for runner (auto-start, auto-restart)
6. Configure MCP servers in Claude Code settings on server

### Phase 5: SMM Agent Setup
1. Create `.claude/agents/smm-manager.md` -- SMM agent with brand voice, platform formats
2. Create `.github/workflows/smm-release.yml` -- auto-publish on PR merged
3. Create `.github/workflows/smm-scheduled.yml` -- daily content generation (cron)
4. Create `.github/workflows/smm-publish.yml` -- publish after approval (label trigger)
5. Add repo secrets: `TWITTER_BEARER_TOKEN`, `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`, `DISCORD_WEBHOOK_URL`
6. Create labels: `content:create`, `content:review`, `content:approved`

### Phase 6: Testing
1. Create test issue → add `agent:claude` label → verify execution
2. Verify PR auto-created with correct branch/title/body
3. Verify auto-review triggers on PR
4. Test request-changes → auto-fix cycle
5. Verify iteration limit (max 2 auto-fixes)
6. Test frontend pipeline: issue with Figma URL → verify Figma extraction + Playwright screenshots in PR
7. Test SMM release: merge test PR → verify auto-post to all platforms
8. Test SMM scheduled: manually trigger cron workflow → verify issue created with content draft
9. Test SMM approval: add `content:approved` label → verify publish + links in issue

---

## Component 8: SMM Manager Agent

### Overview

Full-cycle social media management agent. Publishes to Twitter/X, Telegram, and Discord. Hybrid publishing model: routine content auto-publishes, creative content requires approval.

### Agent File

**File:** `.claude/agents/smm-manager.md`

Contains: brand voice guidelines, platform-specific formatting rules, content templates, ValidatorInfo product context.

### Workflows

#### 8.1 Release Announcements (`smm-release.yml`)

**Trigger:** PR merged to main
**Mode:** AUTO-PUBLISH (no approval needed)

```yaml
name: SMM Release Announcement
on:
  pull_request:
    types: [closed]
    branches: [main]

jobs:
  announce:
    if: github.event.pull_request.merged == true
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4

      - name: Generate and publish
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          model: claude-opus-4-6
          prompt: |
            You are the SMM Manager for ValidatorInfo.
            A PR was just merged: "${{ github.event.pull_request.title }}"
            Body: ${{ github.event.pull_request.body }}

            Generate release announcements for:
            1. Twitter/X (max 280 chars, engaging, with relevant emoji)
            2. Telegram (markdown, more detail, preview-friendly)
            3. Discord (embed-style, channel #announcements)

            Then publish using the platform APIs.
          direct_prompt: true
        env:
          TWITTER_BEARER_TOKEN: ${{ secrets.TWITTER_BEARER_TOKEN }}
          TWITTER_API_KEY: ${{ secrets.TWITTER_API_KEY }}
          TWITTER_API_SECRET: ${{ secrets.TWITTER_API_SECRET }}
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHANNEL_ID: ${{ secrets.TELEGRAM_CHANNEL_ID }}
          DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
```

#### 8.2 Scheduled Content (`smm-scheduled.yml`)

**Trigger:** Cron, daily at 10:00 UTC
**Mode:** APPROVAL REQUIRED (creates issue for review)

```yaml
name: SMM Daily Content
on:
  schedule:
    - cron: '0 10 * * *'
  workflow_dispatch:

jobs:
  generate:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4

      - name: Generate content
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          model: claude-opus-4-6
          prompt: |
            You are the SMM Manager for ValidatorInfo.

            Research and generate 1-2 content pieces for today:

            Data sources:
            1. Web: trending crypto/staking/validator topics
            2. Competitors: StakingRewards, Mintscan, Cosmostation activity
            3. ValidatorInfo DB: interesting data (top APR, TVL changes, new validators)

            Content types (pick most relevant):
            - Educational thread about staking/validators
            - Data-driven post (top validators, APR comparison)
            - Trend analysis (web3 developments)
            - Community engagement (question, poll)

            Format as GitHub issue body with [TWITTER], [TELEGRAM], [DISCORD] sections.
            Create issue with title "Content: [topic] - [date]" and label "content:review".
          direct_prompt: true
```

#### 8.3 Publish Approved Content (`smm-publish.yml`)

**Trigger:** Issue labeled `content:approved`
**Mode:** Executes publish after user approval

```yaml
name: SMM Publish Approved
on:
  issues:
    types: [labeled]

jobs:
  publish:
    if: github.event.label.name == 'content:approved'
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4

      - name: Publish content
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          model: claude-opus-4-6
          prompt: |
            Read issue #${{ github.event.issue.number }} body.
            Parse [TWITTER], [TELEGRAM], [DISCORD] sections.
            Publish each to corresponding platform via API.
            Comment on issue with links to published posts.
            Close the issue.
          direct_prompt: true
        env:
          TWITTER_BEARER_TOKEN: ${{ secrets.TWITTER_BEARER_TOKEN }}
          TWITTER_API_KEY: ${{ secrets.TWITTER_API_KEY }}
          TWITTER_API_SECRET: ${{ secrets.TWITTER_API_SECRET }}
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHANNEL_ID: ${{ secrets.TELEGRAM_CHANNEL_ID }}
          DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
```

### Content Categories

| Type | Auto/Approval | Trigger | Example |
|------|---------------|---------|---------|
| Release announcement | AUTO | PR merged | "New: Aztec transactions page is live!" |
| Repost/share | AUTO | Detected trend | Retweet relevant web3 content |
| Data post | AUTO | Cron + DB query | "Top 5 validators by APR this week" |
| Educational thread | APPROVAL | Cron + research | "How staking works on Cosmos: a thread" |
| Opinion/take | APPROVAL | Cron + research | "Why liquid staking will dominate 2026" |
| Community response | APPROVAL | Manual trigger | Response to mentions, questions |

### Labels

| Label | Purpose |
|-------|---------|
| `content:create` | Manual request to create content on specific topic |
| `content:review` | Draft ready for user review |
| `content:approved` | User approved, ready to publish |

### Required Secrets

| Secret | Platform |
|--------|----------|
| `TWITTER_BEARER_TOKEN` | Twitter/X |
| `TWITTER_API_KEY` | Twitter/X |
| `TWITTER_API_SECRET` | Twitter/X |
| `TELEGRAM_BOT_TOKEN` | Telegram |
| `TELEGRAM_CHANNEL_ID` | Telegram |
| `DISCORD_WEBHOOK_URL` | Discord |

---

## Future: Layer 1 (AI Council) + Heartbeat

Not in scope for this design, but next steps:
- **AI Council:** Custom agents for CMO, CPO, Growth on server
- **Heartbeat:** Cron job researching trends/competitors, auto-creating issues
- **Full automation:** Heartbeat → issues → agents → review → merge → SMM announce
