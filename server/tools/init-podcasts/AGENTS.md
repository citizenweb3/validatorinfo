# Init Podcasts Module (RAG Data Pipeline)

**Purpose:** Initialization pipeline for the Knowledge Base RAG system. Processes podcast transcripts and CW3 project documentation into embeddings stored in PostgreSQL (pgvector) for semantic search by the AI chatbot.

## Architecture

```
init-podcasts.ts (orchestrator)
  │
  ├── shared.ts              ← Constants, interfaces, utilities, AI model config
  ├── podcast-processor.ts   ← Podcast transcript → chunks → embeddings → DB
  ├── cw3-doc-processor.ts   ← CW3 docs (GitHub/web) → chunks → embeddings → DB
  └── host-meta-generator.ts ← Aggregate host opinions → 7-topic meta-summary
```

## Key Files

| File | Description |
|------|-------------|
| `shared.ts` | Shared constants (embedding model, chunk sizes, paths), interfaces (IndexEntry, Segment, Chunk, DocChunk), utilities (wordCount, splitWithOverlap), re-exports (db, Prisma, logger) |
| `podcast-processor.ts` | Parses podcast transcripts by speaker labels, chunks by speaker reply, generates LLM summaries + metadata, embeds and stores in podcast_episodes + podcast_chunks |
| `cw3-doc-processor.ts` | Fetches CW3 docs from GitHub API / websites with local fallback, chunks markdown by sections, embeds and stores as HOST episodes. 6 sources: infrastructure, manifesto, validator, CDI, community, BVC |
| `host-meta-generator.ts` | Aggregates all HOST podcast chunks into 7-topic summary (Technologies, Validating, Consensus, Blockchain networks, AI, Privacy, Decentralization) via LLM, then embeds and stores as `__host_meta__` episode |

## Entry Point

`server/tools/init-podcasts.ts` — called by docker-compose: `npx tsx server/tools/init-podcasts.ts`

Execution order:
1. Enable pgvector extension
2. Process new podcast episodes (skip already-in-DB)
3. Process CW3 documents (always re-process — content may change)
4. Generate host meta-summary (if new episodes were processed)

## Data Flow

```
Podcast transcripts (server/data/podcasts/transcripts/*.txt)
  → parseTranscript → chunkSegments → embedMany → podcast_episodes + podcast_chunks

CW3 docs (GitHub API / citizenweb3.com → server/data/cw3-docs/*.md fallback)
  → chunkMarkdown → embedMany → podcast_episodes + podcast_chunks (as __cw3_* slugs)

Host meta (aggregation of all HOST chunks in DB)
  → generateText per topic → embedMany → podcast_episodes + podcast_chunks (as __host_meta__)
```

## Special Episode Slugs

| Slug | Purpose |
|------|---------|
| `__host_meta__` | Aggregated host (Citizen Web3) opinions across all podcasts |
| `__cw3_infrastructure__` | staking repo README — bare-metal, Horcrux, solar, security |
| `__cw3_manifesto__` | citizenweb3.com manifesto — philosophy, mission |
| `__cw3_validator__` | citizenweb3.com/validator — networks, services |
| `__cw3_cdi__` | chain-data-indexer README — multi-network indexer |
| `__cw3_community__` | web3-society README — anti-tribalism, community |
| `__cw3_bvc__` | BVC getting-started — baremetal validator handbook |

## Dependencies

- `@/db` — Prisma client (PostgreSQL with pgvector)
- `ai` (Vercel AI SDK) — `embedMany`, `generateText`
- `@ai-sdk/google` — Google Gemini models (embedding + text generation)
- `server/data/podcasts/index.json` — podcast episode metadata
- `server/data/podcasts/transcripts/` — podcast transcript files
- `server/data/cw3-docs/` — local fallback markdown files

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Google AI API key for embeddings + text generation |
| `GITHUB_API_TOKEN` | No | GitHub token for higher API rate limits when fetching CW3 docs |
