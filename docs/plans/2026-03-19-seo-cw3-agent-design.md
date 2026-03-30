# SEO-CW3 Agent Design

## Goal

Create `seo-cw3.md` agent prompt for Citizen Web3 content agent — separate from seo-vi (ValidatorInfo).

## Decisions Made

1. **Separate container** — `agent-content-cw3` with own runner label `content-cw3`, own env vars (Twitter/Telegram/Discord keys for @citizen_web3). No shared state with seo-vi container.

2. **RAG access** — via `/api/rag/search` endpoint with token auth. Agent calls `node agents-tools/search-rag.js` to search 190+ podcast transcripts and CW3 docs semantically. If `agents-infrastructure` runs as a separate docker-compose project from `validatorinfo`, point `CW3_RAG_API_URL` to `http://host.docker.internal:3000` instead of `http://frontend:3000`, because the `frontend` DNS alias only exists inside the `validatorinfo` docker network.

3. **Data sources** — ValidatorInfo DB (SQL via Prisma) + RAG knowledge base + CW3 docs (server/data/cw3-docs/*) + WebSearch

4. **Autonomy** — same 3-level system as seo-vi:
   - Level 1: facts (governance votes, uptime, podcast drops) → auto-post
   - Level 2: responding to external content with CW3 data → auto-post
   - Level 3: opinions, predictions, governance commentary → review

5. **Brand voice** — cypherpunk, privacy-maximalist, anti-tribalism, zero hype. Anti-slop rules enforced in Step 2.

6. **Channels** — X (@citizen_web3), Telegram (citizenweb3 + web_3_society), Discord, chain forums

7. **Priority** — revenue-generating chains first, privacy networks second

## Infrastructure TODO (separate task)

- Add `agent-content-cw3` service to `agents-infrastructure/docker-compose.yml`
- Add `content-cw3` runner label
- Update `task-execute-content.yml` to route `agent:seo-cw3` to `content-cw3` runner
- Add CW3-specific env vars (CW3 Twitter/Telegram/Discord keys, RAG_API_TOKEN)
- Posting scripts: parametrize `TWITTER_HANDLE` via env var (currently hardcoded `therealvalinfo`)

## Files

- Agent prompt: `.claude/agents/seo-cw3.md`
- Context files: `server/data/cw3-docs/` (manifesto, validator, infrastructure, bvc, community)
- RAG script: `agents-tools/search-rag.js`
