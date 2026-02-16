# Ralph Loop -- Autonomous Agent Design

**Date:** 2026-02-16
**Status:** Approved
**Scope:** Mission-driven autonomous agent daemon on self-hosted GNU server

---

## Overview

Ralph is an autonomous AI agent that runs 24/7 on a self-hosted GNU server. Unlike task-driven agents that wait for assignments, Ralph **proactively observes, discovers, and drives missions to completion** -- acting as an always-on CTO/CMO/CPO for ValidatorInfo.

```
Observe → Discover mission → Execute → Review → Iterate until done → Next mission
```

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│            RALPH LOOP (Mission-driven Autonomous Agent)       │
│            Self-hosted GNU server, 24/7                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  1. CHECK ACTIVE MISSIONS                             │    │
│  │     Есть незавершённые миссии?                        │    │
│  │     ├─ YES → Continue work:                           │    │
│  │     │   • PR on review → check status                 │    │
│  │     │   • Changes requested → fix and push            │    │
│  │     │   • Merged → write post, close mission          │    │
│  │     │   • Stuck → escalate (notify owner)             │    │
│  │     │                                                 │    │
│  │     └─ NO (or < 3 active) → OBSERVE for new           │    │
│  └───────────────────────┬───────────────────────────────┘    │
│                          ▼                                    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  2. OBSERVE (only if free mission slots)               │    │
│  │                                                        │    │
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌───────────┐  │    │
│  │  │ Codebase │ │ Database │ │  Web   │ │  GitHub   │  │    │
│  │  │          │ │          │ │        │ │           │  │    │
│  │  │ git diff │ │ APR/TVL  │ │ Trends │ │ PR status │  │    │
│  │  │ TODOs    │ │ New vals │ │ Compet.│ │ Issues    │  │    │
│  │  │ ts-ignore│ │ Anomalies│ │ News   │ │ Reviews   │  │    │
│  │  │ deps     │ │ Votes    │ │ Chains │ │ Stars     │  │    │
│  │  └──────────┘ └──────────┘ └────────┘ └───────────┘  │    │
│  └───────────────────────┬───────────────────────────────┘    │
│                          ▼                                    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  3. THINK (analyze + prioritize)                       │    │
│  │                                                        │    │
│  │  Read memory (.claude/memory/ralph-log.md)             │    │
│  │  → Filter already known observations                   │    │
│  │  → Rank findings by impact                             │    │
│  │  → Create MISSION for top finding                      │    │
│  └───────────────────────┬────────────────────────────────┘    │
│                          ▼                                    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  4. ACT (execute with risk awareness)                  │    │
│  │                                                        │    │
│  │  LOW RISK → Auto-execute:                              │    │
│  │    • Fix typo/lint → PR (< 50 lines)                   │    │
│  │    • Data post → SMM auto-publish                      │    │
│  │    • Update dep (patch) → PR                           │    │
│  │    • Create monitoring issue                           │    │
│  │                                                        │    │
│  │  HIGH RISK → Create issue for approval:                │    │
│  │    • Feature idea → issue + research                   │    │
│  │    • Architecture change → issue + design              │    │
│  │    • Creative content → issue (content:review)         │    │
│  │    • New chain integration → issue + feasibility       │    │
│  └───────────────────────┬────────────────────────────────┘    │
│                          ▼                                    │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  5. REFLECT + SLEEP                                    │    │
│  │                                                        │    │
│  │  • Check results of previous actions                   │    │
│  │  • What was accepted/rejected and why                  │    │
│  │  • Update .claude/memory/ralph-log.md                  │    │
│  │  • Adjust priorities for next cycle                    │    │
│  │                                                        │    │
│  │  Adaptive pause:                                       │    │
│  │  • Nothing found → 6 hours (default cron)              │    │
│  │  • Found bug/anomaly → 1 hour (repository_dispatch)    │    │
│  │  • Critical error → 15 minutes                         │    │
│  └────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## Mission Lifecycle

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│DISCOVERED│───>│ PLANNED  │───>│EXECUTING │───>│IN REVIEW │
└──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                      │
                                    ┌─────────────────┤
                                    ▼                 ▼
                              ┌──────────┐    ┌──────────┐
                              │  FIXING  │    │COMPLETED │
                              │(changes  │    │(merged/  │
                              │requested)│    │published)│
                              └────┬─────┘    └──────────┘
                                   │
                                   └──→ back to IN REVIEW
```

### Mission constraints

- **Max 3 active missions** simultaneously
- New missions only created when slots are free
- Missions persist across cycles until completed
- Each mission tracked as GitHub issue with label `ralph:mission`

---

## Data Sources

### Infrastructure

```
┌──────────────┐     SSH tunnel (autossh)   ┌──────────────┐
│ Ralph Server │ ◄────────────────────────► │  DB Server   │
│ (GNU)        │     port 5432 forwarded    │  (Docker)    │
│              │                            │              │
│ Prisma Client│───────────────────────────►│  PostgreSQL  │
│ (generated   │     DATABASE_URL via       │  (validatorinfo)
│  from schema)│     SSH tunnel             │              │
└──────────────┘                            └──────────────┘
```

### Source Details

| Source | Access Method | What it provides | Frequency |
|--------|--------------|------------------|-----------|
| **Git repo** | Checkout (local) | Code changes, TODOs, @ts-ignore, dead code, deps | Every cycle |
| **PostgreSQL** | Prisma Client via SSH tunnel | APR/TVL anomalies, new validators, vote trends, chain data | Every cycle |
| **Web** | Claude Code WebSearch/WebFetch | Crypto trends, competitor analysis, ecosystem news | Every cycle |
| **GitHub API** | `gh` CLI | PR/issue status, reviews, merged PRs, activity | Every cycle |
| **Twitter API** | Bearer token | Engagement metrics, trending topics | Daily |
| **Telegram API** | Bot token | Channel stats, user questions | Daily |
| **Discord API** | Webhook/Bot | Community activity, questions | Daily |

### Database Access Setup

Ralph server has the full repo checkout including Prisma schema. Database access via:

```bash
# 1. Persistent SSH tunnel (systemd service)
# /etc/systemd/system/ssh-tunnel-db.service
[Unit]
Description=SSH Tunnel to DB Server
After=network.target

[Service]
ExecStart=/usr/bin/autossh -M 0 -N -L 5432:localhost:5432 user@db-server
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# 2. DATABASE_URL in Ralph's environment
DATABASE_URL=postgresql://user:pass@localhost:5432/validatorinfo

# 3. Generate Prisma client
npx prisma generate
```

### Codebase Analysis Queries

```bash
# Recent changes (since last cycle)
git log --since="6 hours ago" --oneline

# Code quality issues
grep -rn "TODO\|FIXME\|HACK\|@ts-ignore\|: any" src/ server/

# Outdated dependencies
yarn outdated --json

# TypeScript errors
npx tsc --noEmit 2>&1 | head -50

# Dead exports (unused)
# Via DeepContext MCP semantic search
```

### Database Analysis Queries (via Prisma)

```typescript
// APR anomalies (>30% change in 24h)
const anomalies = await prisma.apr.findMany({
  where: {
    createdAt: { gte: yesterday },
    // compare with previous value
  },
  include: { chain: true },
});

// New validators
const newValidators = await prisma.validator.findMany({
  where: { createdAt: { gte: lastCycle } },
  include: { chain: true },
});

// Top metrics for content
const topAPR = await prisma.chainParams.findMany({
  orderBy: { apr: 'desc' },
  take: 5,
  include: { chain: true },
});

// Active governance
const activeProposals = await prisma.proposal.findMany({
  where: { status: 'VOTING_PERIOD' },
  include: { chain: true, votes: true },
});
```

---

## Implementation

### Workflow: `ralph-loop.yml`

```yaml
name: Ralph Loop - Autonomous Agent
on:
  schedule:
    - cron: '0 */6 * * *'    # Every 6 hours (baseline)
  workflow_dispatch:           # Manual trigger for testing
  repository_dispatch:         # Programmatic trigger (adaptive interval)
    types: [ralph-loop-trigger]

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  ralph:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node & Prisma
        run: |
          npm install
          npx prisma generate

      - name: Ralph Loop Cycle
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          model: claude-opus-4-6
          prompt: |
            You are Ralph, an autonomous AI agent for the ValidatorInfo project.
            You run in a continuous loop, discovering and driving missions to completion.

            ## Your cycle:

            ### 1. CHECK ACTIVE MISSIONS
            Read .claude/memory/ralph-log.md for active missions.
            For each active mission:
            - Check its GitHub issue status
            - If PR is in review: check review status (approved/changes requested)
            - If changes requested: read feedback, fix, push
            - If approved: merge, close issue, update memory
            - If merged: create SMM post about it (if relevant), mark COMPLETED

            ### 2. OBSERVE (if < 3 active missions)
            Scan all data sources:
            - Git: recent changes, code quality issues, outdated deps
            - Database: APR anomalies, new validators, TVL changes, active governance
            - Web: crypto trends, competitor activity, ecosystem news
            - GitHub: unresolved issues, PR backlog, community questions

            ### 3. THINK
            Read memory to avoid repeating observations.
            Rank findings by impact. Select top finding for new mission.

            ### 4. ACT
            LOW RISK (auto-execute):
            - Code fix < 50 lines → create branch + PR
            - Data-driven post → publish to Twitter/TG/Discord
            - Monitoring issue → create on GitHub

            HIGH RISK (create issue for approval):
            - Feature idea → issue with research + feasibility
            - Architecture change → issue with design proposal
            - Creative content → issue with label content:review
            - New chain → issue with integration analysis

            ### 5. REFLECT
            Update .claude/memory/ralph-log.md:
            - What you observed
            - What actions you took
            - Results of previous actions
            - Learnings (what owner accepts/rejects)
            - Set urgency for next cycle timing

            ## Rules:
            - Max 3 active missions at a time
            - Max 1 auto-PR per cycle (< 50 lines only)
            - Max 3 actions per cycle total
            - Never force push or modify main directly
            - Always read memory before acting
            - Log every action to memory
            - If urgency is high, trigger next cycle early via:
              gh api repos/$REPO/dispatches -f event_type=ralph-loop-trigger

            Read CLAUDE.md for project conventions before any code changes.
          direct_prompt: true
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          TWITTER_BEARER_TOKEN: ${{ secrets.TWITTER_BEARER_TOKEN }}
          TWITTER_API_KEY: ${{ secrets.TWITTER_API_KEY }}
          TWITTER_API_SECRET: ${{ secrets.TWITTER_API_SECRET }}
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHANNEL_ID: ${{ secrets.TELEGRAM_CHANNEL_ID }}
          DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}

      - name: Commit memory updates
        run: |
          git add .claude/memory/ralph-log.md
          git diff --cached --quiet || \
            git commit -m "ralph: update memory log [skip ci]" && \
            git push origin HEAD:ralph-memory
```

### Memory File: `.claude/memory/ralph-log.md`

```markdown
# Ralph Loop Memory

## Active Missions

### Mission #1: [title]
- **Status:** EXECUTING / IN_REVIEW / FIXING
- **Issue:** #N
- **PR:** #N (if created)
- **Started:** cycle #X
- **Last action:** [what was done]
- **Next step:** [what needs to happen]

### Mission #2: ...

## Completed Missions (last 10)

### [date] Mission: [title]
- Cycles to complete: N
- Outcome: merged/published/rejected
- Learning: [what was learned]

## Observations Log (last 5 cycles)

### Cycle #N (YYYY-MM-DDTHH:MM)
- **Observed:** [list of findings]
- **Actions:** [what was done]
- **Urgency:** low/medium/high
- **Next cycle:** 6h / 1h / 15min

## Learnings

- [Pattern: what gets accepted vs rejected]
- [Content: what type of posts get engagement]
- [Code: owner preferences for code style/approach]

## Do Not Repeat

- [List of already-known issues/observations to skip]
```

---

## Safety Guardrails

| Rule | Purpose |
|------|---------|
| Max 3 active missions | Prevent scope creep |
| Max 1 auto-PR per cycle | Prevent review fatigue |
| Max 3 total actions per cycle | Prevent token waste |
| Auto-PRs only for changes < 50 lines | Bigger changes need human review |
| Never force push or touch main | Protect main branch |
| Read memory before acting | Don't repeat observations |
| `[skip ci]` on memory commits | Don't trigger CI for memory updates |
| Log every action | Full audit trail |
| Owner rejection → learning | Adapt behavior over time |

---

## Integration with Pipeline

Ralph integrates with the existing execution + review pipeline:

```
Ralph discovers opportunity
  │
  ├─ LOW RISK (auto):
  │   └─ Creates PR → triggers pr-review.yml → auto-review → user approves
  │
  ├─ HIGH RISK (feature/idea):
  │   └─ Creates issue → user adds label "agent:claude" →
  │      task-execute.yml → PR → pr-review.yml → user approves
  │
  └─ CONTENT:
      └─ Creates issue with "content:review" → user adds "content:approved" →
         smm-publish.yml → published
```

Ralph is the **brain** that generates work. The existing pipeline workflows are the **hands** that execute and review.

---

## Adaptive Timing

| Urgency | Next cycle | Trigger |
|---------|-----------|---------|
| Low (nothing interesting) | 6 hours | Default cron |
| Medium (found opportunity) | 1 hour | `repository_dispatch` |
| High (found bug/error) | 15 minutes | `repository_dispatch` |

Adaptive trigger:
```bash
# Ralph triggers early next cycle
gh api repos/{owner}/{repo}/dispatches \
  -f event_type=ralph-loop-trigger
```

---

## Labels

| Label | Purpose |
|-------|---------|
| `ralph:mission` | Issue is a Ralph mission (auto-tracked) |
| `ralph:auto-fix` | PR created by Ralph automatically |
| `ralph:research` | Research/analysis finding |
| `ralph:content` | Content opportunity discovered |

---

## Required Secrets (on Ralph server)

| Secret | Purpose |
|--------|---------|
| `ANTHROPIC_API_KEY` | Claude Code |
| `DATABASE_URL` | PostgreSQL via SSH tunnel |
| `TWITTER_BEARER_TOKEN` | Twitter API |
| `TWITTER_API_KEY` | Twitter API |
| `TWITTER_API_SECRET` | Twitter API |
| `TELEGRAM_BOT_TOKEN` | Telegram |
| `TELEGRAM_CHANNEL_ID` | Telegram |
| `DISCORD_WEBHOOK_URL` | Discord |

---

## Server Setup

### Ralph Server (GNU)

```bash
# 1. GitHub Actions self-hosted runner (see pipeline design doc)

# 2. SSH tunnel to DB server (persistent)
sudo apt install autossh
# Configure ssh-tunnel-db.service (see above)
sudo systemctl enable ssh-tunnel-db
sudo systemctl start ssh-tunnel-db

# 3. Claude Code + Prisma
npm install -g @anthropic-ai/claude-code
cd /path/to/validatorinfo
npm install
npx prisma generate

# 4. Test DB connection
npx prisma db pull  # should show schema
```

---

## Example Cycle

```
Cycle #47 (2026-02-16T16:00Z)

=== CHECK ACTIVE MISSIONS ===
Mission #1: "Fix APR anomaly on Cosmos Hub" (IN_REVIEW)
  → PR #48 review status: approved
  → ACTION: merge PR, close issue
  → Created data post: "Cosmos Hub APR normalized after 24h spike"
  → Published to Twitter/TG
  → STATUS → COMPLETED (2 cycles)

Mission #2: "Add Aztec governance voting page" (EXECUTING)
  → 60% done, continuing from last cycle
  → ACTION: implement remaining components, push to PR
  → STATUS → IN_REVIEW

=== OBSERVE (1 slot free, 2/3 active) ===
Codebase: 2 new @ts-ignore in merged PR #50
Database: Osmosis TVL +45% this week (interesting for content)
Web: Competitor Mintscan added "validator risk score" feature
GitHub: Issue #30 open for 2 weeks, no assignee

=== THINK ===
Rank: Mintscan risk score > TVL content > @ts-ignore fix > old issue
Already known: @ts-ignore tracked, will fix in next cycle

=== ACT ===
Action 1: Create Mission #3 "Research validator risk scoring"
  → Issue #51 with competitor analysis + feasibility
  → Label: ralph:research
  → STATUS: DISCOVERED

Action 2: Auto-publish TVL data post (low risk)
  → "Osmosis TVL surges 45% this week. Full metrics at validatorinfo.com"
  → Published to Twitter/TG/Discord

=== REFLECT ===
Updated ralph-log.md:
  - Mission #1 completed in 2 cycles (good pace)
  - Mission #2 still in progress (large feature)
  - New mission #3 created
  - Learning: data posts with percentages get higher engagement
  - Urgency: low (no critical findings)

Next cycle: 6 hours (default cron)
```

---

## Implementation Plan

### Phase 1: Memory Setup
1. Create `.claude/memory/ralph-log.md` with initial structure
2. Create `ralph-memory` branch for memory commits

### Phase 2: Workflow
1. Create `.github/workflows/ralph-loop.yml`
2. Add all required secrets to repo
3. Configure self-hosted runner labels

### Phase 3: Server Connectivity
1. Set up SSH tunnel from Ralph server to DB server (autossh + systemd)
2. Test Prisma connection to remote DB
3. Verify `npx prisma generate` works on Ralph server

### Phase 4: Testing
1. Manual trigger (`workflow_dispatch`) → verify full cycle
2. Verify mission creation (issue with ralph:mission label)
3. Verify auto-PR creation (< 50 lines)
4. Verify memory file updates
5. Verify adaptive timing (repository_dispatch trigger)
6. Verify SMM integration (auto-publish data post)
