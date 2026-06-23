# Validator Info Project - Comprehensive Overview

## Critical Rule: Module Documentation

**When analyzing or researching any directory in this project, ALWAYS check for `AGENTS.md` file first.**

If an `AGENTS.md` file exists in the target directory:
1. Read the `AGENTS.md` file FIRST before exploring any code
2. Use it to understand the module's purpose, structure, and patterns
3. Then continue with your research/analysis

## Code Search & Documentation

### Semantic Search (clawmem)

When you need to find code by meaning — use clawmem MCP tools:

- Use `find_similar` for semantic search queries
- Use `intent_search` for concept-based discovery

Examples:
- "authentication logic" → find_similar
- "where is JWT validated" → find_similar
- "find all API endpoints" → intent_search

Use clawmem when you don't know exact names and need to discover relevant code.

### Code Relationships & Impact (Graphify)

When you need to understand how code connects — use the Graphify CLI:

- `graphify query "concept"` — find code/flows by concept
- `graphify explain "symbolName"` — 360° view: neighbors, callers, file:line
- `graphify affected "functionName"` — blast radius before editing
- `graphify update .` — incremental graph re-extraction after edits

Use Graphify when you need to understand relationships, what will break, or trace execution flows.

### Library Documentation (Context7)

When you need current API docs, usage examples, or library-specific
patterns — use Context7 MCP tools:

1. `resolve-library-id` — find library ID by name
2. `get-library-docs` — fetch documentation

Use Context7 for:
- Correct syntax for library APIs
- Up-to-date code examples
- Version-specific features
- Setup and configuration

### When to Use What

| Need | Tool                               |
|------|------------------------------------|
| Semantic search by meaning | clawmem (`find_similar`)           |
| Code relationships / execution flows | Graphify (`query`, `explain`, `path`) |
| Impact before changes | Graphify (`affected`) |
| Library docs / examples | Context7                           |
| Exact string match | grep                               |
| Project architecture | Read CLAUDE.md and AGENTS.md files |

### Available Module Documentation

| Module | Location | Description |
|--------|----------|-------------|
| Jobs (Indexer) | `server/jobs/AGENTS.md` | Background cron jobs for blockchain data indexing |
| Chains | `server/tools/chains/AGENTS.md` | Chain-specific implementations (Cosmos, Aztec, etc.) |
| Aztec Chain | `server/tools/chains/aztec/AGENTS.md` | Aztec L2 implementation (L1 contracts, events, governance) |
| Services | `src/app/services/AGENTS.md` | Data access layer for frontend and actions |

---

## Cross-Agent Reviews

This repository uses the global `agent-review` CLI for Codex <-> Claude review handoffs.
The CLI is installed outside the repo; review state is local in `.agent-reviews/`.

Use from the repository root:

```bash
agent-review handoff \
  --assignee codex \
  --title "Short review title" \
  --summary "What changed and why" \
  --files path/a.ts,path/b.ts \
  --basis docs/design.md,commit-or-review-id \
  --review-focus "correctness, regressions, missing tests" \
  --tests "yarn test ..." \
  --risks "known risks or none"

agent-review next --assignee codex
agent-review respond <review-id> --finding F1 --status fixed --summary "What changed"
agent-review verify <review-id> --status passed --summary "Verification result"
agent-review close <review-id>
agent-review validate
```

Protocol:
- `.agent-reviews/open/` contains active reviews; `.agent-reviews/closed/` contains closed reviews.
- Claude creates structured handoffs with `agent-review handoff --assignee codex`.
- Codex adds findings under `## Findings` and only closes after satisfactory verification.
- Assignees must respond to every stable finding ID under `# Assignee Response`.
- Do not delete or rewrite reviewer findings; append responses and verification instead.
- Keep the tool global. Do not add repo-local review scripts unless the protocol itself changes.

---

## Project Overview

ValidatorInfo is a Web3 blockchain explorer providing real-time metrics for validators, mining pools, tokens, and networks across multiple blockchain ecosystems (Cosmos, Polkadot, Ethereum, Namada, Aztec, etc.). The application provides interactive dashboards, validator comparisons, staking information, and governance proposals tracking.

## Architecture

### Three-Tier System

1. **Frontend (Next.js Application)**
   - Port: 3000 (configured via SERVER_PORT)
   - Custom server with Socket.IO for real-time chat/updates (server.ts)
   - Internationalized with next-intl (supports multiple locales)
   - Server Components with dynamic rendering (`force-dynamic`, `revalidate: 0`)

2. **Indexer Service (Background Jobs)**
   - Port: 3001 (configured via INDEXER_PORT)
   - Runs scheduled cron jobs to fetch blockchain data from various chains
   - Uses worker threads for parallel task execution (server/indexer.ts)
   - Jobs in server/jobs/ update chain params, APRs, proposals, validator info, etc.
   - **See `server/jobs/AGENTS.md` for detailed documentation**

3. **Data Layer**
   - PostgreSQL database managed via Prisma ORM
   - Redis for caching and session management
   - Chain-specific implementations in server/tools/chains/
   - **See `server/tools/chains/AGENTS.md` for chain implementations**

### Key Directories

| Directory | Purpose | Documentation |
|-----------|---------|---------------|
| `src/app/[locale]/` | Next.js App Router with i18n | - |
| `src/app/services/` | Data access services | `AGENTS.md` available |
| `src/actions/` | Server actions for data fetching/mutations | - |
| `server/jobs/` | Cron jobs for blockchain data updates | `AGENTS.md` available |
| `server/tools/chains/` | Chain-specific implementations | `AGENTS.md` available |
| `prisma/` | Database schema and migrations | - |

### Path Aliases (tsconfig.json)

- `@/components/*` → `src/app/[locale]/components/*`
- `@/services/*` → `src/app/services/*`
- `@/actions/*` → `src/actions/*`
- `@/utils/*` → `src/utils/*`
- `@/server/*` → `server/*`
- `@/api/*` → `src/app/api/*`
- `@/public/*` → `public/*`

---

## Development Commands

### Running the Project (Docker Compose)

```bash
# Copy environment file
cp .env.example .env

# Start all services (PostgreSQL, Redis, Frontend, Indexer)
docker compose -f docker-compose.dev.yml up -d --build

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Stop services
docker compose -f docker-compose.dev.yml down

# Development (Local - for testing)
yarn dev                    # Start Next.js dev server (port 3000)
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Migrations service (automatic database setup)
- Frontend application (port 3000)
- Indexer service (port 3001)

### Database Operations

```bash
# Run inside container or with database access
npx prisma generate         # Regenerate Prisma client after schema changes
npx prisma migrate deploy   # Deploy pending migrations
npx prisma migrate dev      # Create new migration (development only)
```

### Linting & Building

```bash
yarn lint                   # Run ESLint
yarn build                  # Production build (type-checks everything)
```

---

## Code Style & Conventions

- **Early returns**: Prefer early returns for readability
- **Styling**: Use TailwindCSS classes exclusively, avoid inline CSS or `<style>` tags
- **Naming**: Use descriptive names; prefix event handlers with "handle" (handleClick, handleKeyDown)
- **Components**: Use `const` arrow functions instead of function declarations
- **Accessibility**: Implement proper ARIA labels, tabindex, keyboard handlers
- **DRY principle**: Avoid code duplication
- **SOLID principle**: Develop modules, functions, classes, and components in accordance with the SOLID principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.

---

## Important Implementation Details

### Multi-Chain Support

- Each blockchain has custom implementations in `server/tools/chains/{chain-name}/`
- Methods include: get-nodes.ts, get-proposals.ts, get-apr.ts, get-staking-params.ts, etc.
- Chains array defined in server/tools/chains/chains.ts
- **See `server/tools/chains/AGENTS.md` for patterns and adding new chains**

### Indexer Job System

- Jobs run on cron schedules (every5mins, everyHour, everyDay, etc.)
- Each job spawns a worker thread to prevent blocking
- Tasks include: prices, validators, chain-tvls, chain-aprs, proposals, etc.
- Located in server/jobs/, executed by server/indexer.ts
- **See `server/jobs/AGENTS.md` for job structure and patterns**

### Service Layer Pattern

- Services in src/app/services/ handle data fetching/caching logic
- Examples: chain-service.ts, validator-service.ts, proposal-service.ts
- Services interact with Prisma models and Redis cache
- **See `src/app/services/AGENTS.md` for service patterns**

### Internationalization

- Uses next-intl for locale-based routing
- Locale configuration in src/i18n.ts, localization files in messages/ folder

#### Critical Rule: Localization

**When adding or modifying any user-facing text, you MUST update ALL 3 localization files:**

| File | Language |
|------|----------|
| `messages/en.json` | English |
| `messages/pt.json` | Portuguese |
| `messages/ru.json` | Russian |

**Requirements:**
1. NEVER hardcode user-facing strings in components - always use `useTranslations()` hook for CSR and `getTranslations()` for SSR
2. When adding new text, add translations to ALL 3 files simultaneously
3. Use the same key structure across all files
4. For new features, create appropriate namespace (e.g., `Header`, `Navbar`, `HomePage`)

**Example:**
```tsx
// Component
const t = useTranslations('Header');
<span>{t('Co-Create & Support')}</span>

// messages/en.json
{ "Header": { "Co-Create & Support": "Co-Create & Support" } }

// messages/pt.json
{ "Header": { "Co-Create & Support": "Co-Criar e Apoiar" } }

// messages/ru.json
{ "Header": { "Co-Create & Support": "Сотрудничество и поддержка" } }
```

### Database Schema

- Prisma models: Account, Chain, ChainParams, Apr, Validator, Proposal, Vote, InfrastructureProvider, etc.
- Relationships between chains, validators, proposals, votes
- Migrations in prisma/migrations/

### Environment Variables

Required in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `SERVER_PORT`: Frontend port (default 3000)
- `INDEXER_PORT`: Indexer service port (default 3001)
- `PUBLIC_URL`: Public hostname
- `VALIDATORS_APP_TOKEN`: API authentication token
- `REDIS_HOST`: Redis connection (use `redis` in Docker)

Optional:
- `GITHUB_API_TOKEN`: For fetching GitHub data
- `SKIP_API_KEY`: For Skip Protocol integration

---

## Testing Strategy

When making changes:
1. Test with `yarn lint` to ensure code style compliance
2. Check for TypeScript errors with `yarn build`
3. Test multi-chain functionality if touching chain-specific code
4. Verify database migrations work correctly

---

## Main Rules

- Start by describing your plan of action and explaining in detail why you made this decision to change
- Do not give high-level answers; your task is to provide a specific solution applicable to the project
- Focus on specific solutions, not abstract solutions
- Describe why you are making each change
- Before making changes, describe the general implementation plan point by point, then proceed with implementation
- Consider the linters and format and project style when forming the code
- If solving a complex, large-scale task, break down the solution into stages to implement together
- Keep solutions as simple as possible, focused only on what is actually needed
- Before writing and changing something, check environment, codebase and related code and functions

---

## Agent Role

You are a Senior Fullstack Developer/Engineer and an Expert in ReactJS, NextJS, Node.js, JavaScript, TypeScript, HTML, CSS and modern UI/UX frameworks (e.g., TailwindCSS, Shadcn, Radix). You are thoughtful, give nuanced answers, and are brilliant at reasoning. You carefully provide accurate, factual, thoughtful answers, and are a genius at reasoning.

- Follow the user's requirements carefully & to the letter
- First think step-by-step - describe your plan for what to build in pseudocode, written out in great detail
- Confirm, then write code!
- Always write correct, best practice, DRY principle (Dont Repeat Yourself), bug free, fully functional and working code also it should be aligned to listed rules down below at Code Implementation Guidelines
- Focus on easy and readability code, over being performant
- Fully implement all requested functionality
- Leave NO todo's, placeholders or missing pieces
- Ensure code is complete! Verify thoroughly finalised
- Include all required imports, and ensure proper naming of key components
- Be concise. Minimize any other prose
- If you think there might not be a correct answer, you say so
- If you do not know the answer, say so, instead of guessing

### Coding Environment

The user asks questions about the following coding languages:
- ReactJS
- NextJS
- JavaScript
- TypeScript
- TailwindCSS
- HTML
- CSS

---

## Code Implementation Guidelines

Follow these rules when you write code:
- Always use vercel-react-best-practices skill

- Use early returns whenever possible to make the code more readable
- Always use Tailwind classes for styling HTML elements; avoid using CSS or style tags
- For conditional stylization try to use `cn()` helper: `className={cn('text-sm', { 'bg-blue-500': isActive })}` where it is possible.
- Use descriptive variable and function/const names
- Event functions should be named with a "handle" prefix (handleClick, handleKeyDown)
- Implement accessibility features on elements (tabindex, aria-label, keyboard handlers)
- Use consts instead of functions: `const toggle = () => {}`
- Define types whenever possible
- Fully implement all requested functionality - leave NO TODOs, placeholders or missing pieces
- Include all required imports and ensure proper naming of key components
- Use Next.js Image component instead of img tag where it is possible.
- Use Next.js Links component instead of a tag where it is possible.
- Develop modules, functions, classes, and components in accordance with the SOLID principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
- Don't use BIGINT for PK autoincrement IDs in Prisma schema: use INT or STRING as ciud

<!-- graphify:start -->
# Graphify — Code Intelligence

This project is indexed by Graphify as **validatorinfo** (5360 nodes, 10373 edges). The graph is a local, deterministic Tree-sitter AST graph in `graphify-out/graph.json` (zero tokens, no API key). Use the `graphify` CLI to understand code, assess impact, and navigate safely.

> If results look stale after edits, run `graphify update .` in terminal to re-extract (incremental, no LLM).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `graphify affected "symbolName"` and report the blast radius (direct callers/importers, transitive deps, depth) to the user.
- **MUST re-check scope before committing**: run `graphify update .`, then `graphify affected` on each changed symbol to verify only expected symbols are touched.
- **MUST warn the user** if `affected` shows a wide blast radius (many d=1 dependents) before proceeding with edits.
- When exploring unfamiliar code, use `graphify query "concept"` (BFS traversal) to find execution flows instead of grepping.
- When you need full context on a specific symbol — neighbors, callers, file:line — use `graphify explain "symbolName"`.

## When Debugging

1. `graphify query "<error or symptom>"` — find flows related to the issue
2. `graphify explain "<suspect function>"` — see neighbors, callers, file:line
3. `graphify path "A" "B"` — trace how two symbols connect
4. For regressions: `graphify affected "<changed symbol>"` — see what your change reaches

## When Refactoring

- **Renaming**: Graphify has no coordinated rename. First run `graphify affected "old"` to enumerate every caller/importer, edit each explicitly, then `graphify update .`. NEVER blind find-and-replace.
- **Extracting/Splitting**: run `graphify explain "target"` for incoming/outgoing refs, then `graphify affected "target"` to find all external callers before moving code.
- After any refactor: run `graphify update .` and re-check `affected` on the touched symbols.

## Never Do

- NEVER edit a function, class, or method without first running `graphify affected` on it.
- NEVER ignore a wide blast radius (many direct dependents) without telling the user.
- NEVER rename symbols with find-and-replace — enumerate callers via `graphify affected` first.
- NEVER commit without re-running `graphify update .` + `affected` to check scope.

## Tools Quick Reference

| Command | When to use |
|---------|-------------|
| `graphify query "<q>"` | Find code by concept (BFS) |
| `graphify explain "X"` | 360-degree view of one symbol |
| `graphify affected "X"` | Blast radius before editing (reverse impact) |
| `graphify path "A" "B"` | Shortest path between two symbols |
| `graphify update .` | Incremental re-extract after edits (no LLM) |

## Impact Depth (`graphify affected "X" --depth N`)

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `graphify affected` was run for all modified symbols
2. No wide blast radius was left unreported
3. `graphify update .` ran and the graph reflects the edits
4. All d=1 (WILL BREAK) dependents were updated

## CLI

- Re-index (incremental): `graphify update .`
- Check freshness: `graphify check-update .`
- Architecture/call-flow HTML: `graphify export callflow-html`

<!-- graphify:end -->

---

# Implementation Protocol

Applies when a task is a **feature or touches 3+ files**. For smaller changes
(1-2 files, typo, question, research-only), skip this protocol and work normally.

## Preconditions (first step)
- **git**: if the repo is under git, the commit rule is active. If not, skip
  commits and note `Commit: N/A (no git)` in the diary.
- **clawmem**: check the index (`index_stats` / `status`). If not indexed, index
  it first (`reindex`; add the project to `~/.config/clawmem/index.yml` if
  needed), then continue. If indexing is impossible, mirror the durable summary
  into the diary with `clawmem: N/A`.

## 1. Prior-art search (before planning)
Search whether this was built or researched before:
- **clawmem**: `search` / `intent_search` / `find_similar` on the feature topic
- **git**: `git log --grep` and `git log -S`
- **tasks**: grep past diaries in `.tasks/`

Record findings in the diary. Reuse what exists, or state why you build anew.

## 2. Diary (`.tasks/`, gitignored)
Create `.tasks/YYYY-MM-DD-<slug>.md` first. One file per task. The agent only
creates and appends — it never deletes (the human cleans manually).

Structure:
- **Plan**: checklist of tickets (T1, T2, …)
- **Prior art**: clawmem / git / tasks findings + conclusion
- **Per ticket on close**: what done, how, deviations from plan + why, research,
  commit hash (if git), clawmem id

## 3. Stages & commits
A **stage = an atomic, revertable unit** that can be described as one change.
Group tickets into a stage by this criterion, not by ticket count.

On closing a stage → commit. The message is detailed and natural, the way a
person writes it:
- **what** changed (files / modules)
- **why** (the problem it solves)
- **how** (approach, key decisions)
- **deviations** from plan, and research if it shaped the decision

The commit message MUST stay sterile: no task slug, no clawmem id, no mention of
`.tasks/`, clawmem, or this protocol, and no `Co-Authored-By` / "Generated with"
trailer. The commit is the only artifact that leaves the machine.

## 4. clawmem (per stage + final)
- **Per stage**: a durable entry mirroring the commit content (what / how /
  deviations / research) plus the commit hash.
- **On task completion**: pin a final summary (`memory_pin`) — outcome, key
  decisions, pitfalls. This survives diary cleanup and is what the next task's
  prior-art search finds.

## 5. The linked graph (wiring lives on the private side only)
Join key = **commit hash** (a hash reveals nothing about the system).
- diary ticket stores: commit hash + clawmem id
- clawmem entry stores: commit hash + task slug
- commit stores: nothing pointing back

From any node, reach the other two via the hash. The commit stays clean; the
working artifacts (slug, ids, diaries) never leave the machine.
