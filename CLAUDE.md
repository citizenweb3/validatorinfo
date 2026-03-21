# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Rule: Module Documentation

**When analyzing or researching any directory in this project, ALWAYS check for `AGENTS.md` file first.**

If an `AGENTS.md` file exists in the target directory:
1. Read the `AGENTS.md` file FIRST before exploring any code
2. Use it to understand the module's purpose, structure, and patterns
3. Then continue with your research/analysis

## Code Search & Documentation

### Finding Code & Understanding Architecture (GitNexus)

**MANDATORY:** Use GitNexus MCP tools for code understanding. GitNexus provides a knowledge graph with execution flows, impact analysis, and functional clustering.

**Tools (7):**
- `query` — search for execution flows by concept (e.g. "delegation staking")
- `context` — 360° view of a symbol (callers, callees, processes, community)
- `impact` — blast radius analysis before changing code (WILL BREAK / LIKELY AFFECTED / MAY NEED TESTING)
- `detect_changes` — map git diff to affected execution flows
- `rename` — coordinated multi-file rename with confidence scoring
- `cypher` — raw Cypher queries against the code graph
- `list_repos` — list indexed repositories

**Rules:**
1. Before modifying any function/class: run `impact` to check blast radius
2. Before creating a PR: run `detect_changes` to assess risk
3. After implementing changes: reindex with `gitnexus analyze` in terminal
4. Prefer `query` over grep for conceptual searches (returns execution flows, not just files)

**Reindex after:** adding new files, renaming functions, refactoring modules, or any structural change.

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
| Find code / execution flows | GitNexus (`query`, `context`)     |
| Impact before changes | GitNexus (`impact`, `detect_changes`) |
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
| AI Chat | `src/app/services/ai/AGENTS.md` | AI assistant: LLM config, tools, prompt builder, RAG knowledge base |

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
| `src/app/services/ai/` | AI chat: LLM config, tools, prompt | `AGENTS.md` available |
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

### AI Chat

- AI assistant powered by Google Gemini via Vercel AI SDK (`generateText`)
- LLM has tools that query real-time data from ValidatorInfo services (chains, validators, governance, transactions, blocks)
- Server action in `src/actions/ai-chat.ts` handles rate limiting, validation, and LLM orchestration
- AI service config and tools in `src/app/services/ai/`
- UI components in `src/app/[locale]/components/ai-chat/`
- Requires `GOOGLE_GENERATIVE_AI_API_KEY` env var
- **See `src/app/services/ai/AGENTS.md` for full architecture and tool patterns**

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
- `GOOGLE_GENERATIVE_AI_API_KEY`: For AI chat assistant (Gemini)
- `GITHUB_API_TOKEN`: For fetching GitHub data
- `SKIP_API_KEY`: For Skip Protocol integration
- `RAG_API_TOKEN`: Shared secret for internal RAG search API (agent access)

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

## Code Style

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
- Avoid code duplication (DRY principle)
- Develop modules, functions, classes, and components in accordance with the SOLID principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
- Don't use BIGINT for PK autoincrement IDs in Prisma schema: use INT or STRING as ciud

---

## Decision Guide

Before starting work, determine what you're doing and follow the right path:

- **Touching UI text?** → Update ALL 3 locale files (en.json, pt.json, ru.json). Use `useTranslations()` for CSR, `getTranslations()` for SSR.
- **Adding a new chain?** → Read `server/tools/chains/AGENTS.md` first. Register in `params.ts`, add to `chainMethods` in `methods.ts`, create `{chain}/methods.ts`.
- **Changing DB schema?** → `npx prisma migrate dev` to create migration, then `npx prisma generate` to regenerate client.
- **Adding a new indexer job?** → Read `server/jobs/AGENTS.md`. Follow existing job structure (worker thread + cron schedule).
- **Debugging indexer or chain data?** → Use the `validatorinfo-testing` skill.
- **Build fails?** → See "When Things Break" table below.
- **Not sure where something lives?** → Use DeepContext `search_codebase`, not grep.

---

## How To: Add a New Chain

✅ **Correct approach:**
1. Read `server/tools/chains/AGENTS.md` for the full pattern
2. Create `server/tools/chains/mychain/methods.ts` implementing `ChainMethods` interface
3. Register chain in `server/tools/chains/params.ts` (ecosystem params + chain config)
4. Add to `chainMethods` record in `server/tools/chains/methods.ts`
5. Add indexer jobs if needed (see `server/jobs/AGENTS.md`)
6. Test with `validatorinfo-testing` skill

❌ **Common failures:**
- Creating the chain folder but forgetting `params.ts` → indexer doesn't know the chain exists
- Creating the chain folder but forgetting `methods.ts` record → chain has no methods to call
- Copying another chain's methods without adapting API endpoints → silently returns wrong data
- Not checking if the chain's ecosystem already exists in `ecosystemParams` → duplicate ecosystem entry

---

## How To: Add Localized UI Text

✅ **Correct approach:**
```tsx
// 1. Use translation hook
const t = useTranslations('MyFeature');
return <span>{t('myLabel')}</span>;

// 2. Add to ALL THREE files:
// messages/en.json: { "MyFeature": { "myLabel": "My Label" } }
// messages/pt.json: { "MyFeature": { "myLabel": "Minha Etiqueta" } }
// messages/ru.json: { "MyFeature": { "myLabel": "Моя метка" } }
```

❌ **Common failures:**
- Hardcoding `<span>My Label</span>` → breaks i18n
- Adding to en.json only → app crashes for pt/ru users
- Using wrong namespace → key not found at runtime
- Using `useTranslations()` in a Server Component → use `getTranslations()` for SSR

---

## Common Mistakes

- ❌ Working without `git fetch origin` first → always fetch to see current remote state
- ❌ Hardcoding user-facing strings → always use `useTranslations()` (CSR) / `getTranslations()` (SSR)
- ❌ Updating only one locale file → ALL THREE (en.json, pt.json, ru.json) must match
- ❌ `npm install` → always `yarn`
- ❌ Adding a chain without registering in `server/tools/chains/params.ts` → add to params
- ❌ Adding a chain without populating `chainMethods` in `server/tools/chains/methods.ts` → must fill methods
- ❌ Inline CSS or `<style>` tags → Tailwind classes only
- ❌ `function` declarations for components → use `const` arrow functions
- ❌ Forgetting `npx prisma generate` after schema changes → always regenerate client

---

## When Things Break

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `yarn build` fails with type errors | Prisma client outdated | `npx prisma generate` then rebuild |
| Docker compose won't start | Port 3000/5432 already in use | `docker compose down`, check `lsof -i :3000` |
| Indexer job hangs | Worker thread OOM or API timeout | Check job logs, see `server/jobs/AGENTS.md` |
| AI chat returns 500 | Missing `GOOGLE_GENERATIVE_AI_API_KEY` | Check `.env` against `.env.example` |
| Redis connection refused | Redis container not running | `docker compose up -d redis` |

For debugging indexer jobs, chain data, and database issues — use the `validatorinfo-testing` skill.

---

## Git Workflow

- `main` — production, protected
- `dev` — development branch
- `updates/dev-update` — working branch for all code changes (manual and agent)
- `workforce` — agent-factory configuration only (agent prompts, settings)
- Agent branches: `agent/issue-<N>` — created by agent-factory per issue, PRs into `updates/dev-update`
- Flow: `agent/issue-<N>` → PR → `updates/dev-update` → manual merge → `dev` → `main`
- Always checkout from `dev`
- Run `yarn lint` before committing
- Run `yarn build` before pushing

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **validatorinfo** (3542 symbols, 9796 relationships, 223 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/validatorinfo/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/validatorinfo/context` | Codebase overview, check index freshness |
| `gitnexus://repo/validatorinfo/clusters` | All functional areas |
| `gitnexus://repo/validatorinfo/processes` | All execution flows |
| `gitnexus://repo/validatorinfo/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## CLI

- Re-index: `npx gitnexus analyze`
- Check freshness: `npx gitnexus status`
- Generate docs: `npx gitnexus wiki`

<!-- gitnexus:end -->
- Run `yarn build` before pushing
