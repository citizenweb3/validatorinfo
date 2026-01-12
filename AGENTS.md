# Validator Info Project - Comprehensive Overview

## Critical Rule: Module Documentation

**When analyzing or researching any directory in this project, ALWAYS check for `AGENTS.md` file first.**

If an `AGENTS.md` file exists in the target directory:
1. Read the `AGENTS.md` file FIRST before exploring any code
2. Use it to understand the module's purpose, structure, and patterns
3. Then continue with your research/analysis

### Available Module Documentation

| Module | Location | Description |
|--------|----------|-------------|
| Jobs (Indexer) | `server/jobs/AGENTS.md` | Background cron jobs for blockchain data indexing |
| Chains | `server/tools/chains/AGENTS.md` | Chain-specific implementations (Cosmos, Aztec, etc.) |
| Aztec Chain | `server/tools/chains/aztec/AGENTS.md` | Aztec L2 implementation (L1 contracts, events, governance) |
| Services | `src/app/services/AGENTS.md` | Data access layer for frontend and actions |

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