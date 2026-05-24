# AI Chat Module

**Purpose:** AI-powered chat assistant integrated into the ValidatorInfo frontend. Uses Google Gemini via **Vertex AI** (Vercel AI SDK) to answer user questions about blockchain networks, validators, governance, transactions, and blocks. The LLM has access to tools that query real-time data from the ValidatorInfo database.

## Architecture Overview

```
User (browser)
  │
  ▼
AiChatModal (React)                    ← src/app/[locale]/components/ai-chat/
  │  useAiChat hook                    ← src/hooks/use-ai-chat.ts
  │  useAiContext hook                 ← src/hooks/use-ai-context.ts
  │
  ▼
askAgent server action                 ← src/actions/ai-chat.ts
  │  rate limiting (Redis)
  │  input validation & sanitization
  │
  ▼
Vercel AI SDK generateText()
  │  model: Gemini 3 Flash (preview)   ← ai-service.ts
  │  system prompt with page context   ← ai-service.ts buildSystemPrompt()
  │  tools: aiTools                    ← tools/tools.ts
  │
  ▼
AI Tool calls → ValidatorInfo services
  │  ChainService, ValidatorService, ProposalService, etc.
  │
  ▼
Response → parseMarkdown → rendered in chat
                                       ← src/utils/parse-ai-markdown.tsx
```

## Key Files

| File | Description |
|------|-------------|
| `vertex-provider.ts` | Vertex AI provider factory: cached `createVertex()`; exposes `chatModel()` (gemini-3-flash-preview), `summaryModel()` (gemini-2.5-flash, for podcast/proposal summarization), `embeddingModel()` (gemini-embedding-001), `hasVertexConfig()` |
| `ai-service.ts` | Chat LLM model wiring (delegates to `vertex-provider`), system prompt builder, availability check |
| `tools/tools.ts` | Aggregates all tool groups into single `aiTools` export |
| `tools/chain-tools.ts` | Tools: `getChainMetrics`, `compareChains`, `searchChains`, `getEcosystemChains` |
| `tools/validator-tools.ts` | Tools: `getValidators`, `searchValidators`, `getValidatorById`, `getValidatorDetails` |
| `tools/governance-tools.ts` | Tools: `getProposals`, `getProposalDetails` |
| `tools/market-tools.ts` | Tools: `getHistoricalData`, `getTokenomics` |
| `tools/explain-tools.ts` | Tools: `getRecentTransactions`, `getTransactionByHash`, `getRecentBlocks`, `getBlockDetails` (Aztec-only) |
| `tools/podcast-tools.ts` | Tool: `searchKnowledgeBase` — semantic vector search over podcast transcripts AND CW3 project documentation (manifesto, infrastructure, validator info, etc.) |
| `tools/utils.ts` | Shared helpers: `toHumanTokens`, `ZERO_HASH`, `resolveChain` |

## Related Files (outside this directory)

| File | Description |
|------|-------------|
| `src/actions/ai-chat.ts` | Server action: rate limiting, validation, LLM call orchestration |
| `src/hooks/use-ai-chat.ts` | React hook: message state, send/clear, error handling |
| `src/hooks/use-ai-context.ts` | React hook: extracts page context (chain, validator, tx, block) from URL |
| `src/utils/ai-actions.ts` | Server-side validation/sanitization helpers for the action |
| `src/utils/parse-ai-markdown.tsx` | Markdown-to-React parser for LLM responses (links, tables, lists, bold) |
| `src/types/ai-chat.ts` | Shared types (`PageContext`, `ChatMessage`, `AskAgentResult`) and constants |
| `src/app/[locale]/components/ai-chat/` | UI components: modal, messages, input, suggestions, explain button |

## Structure

```
src/app/services/ai/
├── ai-service.ts             # LLM config, system prompt builder
├── AGENTS.md                 # This file
└── tools/
    ├── tools.ts              # Aggregates all tool groups
    ├── chain-tools.ts        # Chain/network query tools
    ├── validator-tools.ts    # Validator query tools
    ├── governance-tools.ts   # Governance proposal tools
    ├── market-tools.ts       # Price history & tokenomics tools
    ├── explain-tools.ts      # Transaction & block tools (Aztec)
    ├── podcast-tools.ts      # Knowledge base RAG tool (podcasts + CW3 docs)
    └── utils.ts              # Shared helpers (toHumanTokens, resolveChain, ZERO_HASH)
```

## Tool Pattern

Each tool file exports an object of Vercel AI SDK `tool()` definitions:

```typescript
import { tool } from 'ai';
import { z } from 'zod';
import logger from '@/logger';
import { resolveChain } from './utils';

const { logError } = logger('ai-tools:domain');

export const domainTools = {
  toolName: tool({
    description: 'What this tool does — the LLM reads this to decide when to call it.',
    inputSchema: z.object({
      chainName: z.string().describe('The chain name identifier'),
    }),
    execute: async ({ chainName }) => {
      try {
        const chain = await resolveChain(chainName);
        if (!chain) return { error: `Chain "${chainName}" not found` };

        // ... fetch data using services ...

        return { /* structured data for LLM */ };
      } catch (error) {
        logError(`toolName failed: ${error instanceof Error ? error.message : String(error)}`);
        return { error: 'Failed to ...' };
      }
    },
  }),
};
```

Key conventions:
- Tools return plain objects (not throw) — errors are `{ error: string }`
- Use `resolveChain()` from utils for the common chain lookup + null check
- Use `toHumanTokens()` from utils to convert raw token amounts
- Each file has its own logger namespace (`ai-tools:chain`, `ai-tools:validator`, etc.)
- Tool descriptions are critical — the LLM uses them to decide which tool to call

## Security

- **Rate limiting:** Redis-based, per-IP, configured in `src/actions/ai-chat.ts` (10 req/60s)
- **Input validation:** Messages validated for role, content length (max 2000 chars), and count (max 10)
- **Context sanitization:** URL-derived context fields are regex-validated against injection patterns
- **Prompt protection:** System prompt instructs LLM to never reveal instructions or tool names
- **Fail-closed:** If Redis is unavailable, rate limiter blocks requests (protects paid LLM API)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLOUD_PROJECT` | Yes | GCP project ID for Vertex AI (chat + embeddings). AI chat disables itself if unset. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Yes | Absolute path to Vertex AI service account JSON inside the container. docker-compose mounts `./secrets/vertex-sa.json:/secrets/vertex-sa.json:ro` for both `frontend` and `init-podcasts` services. |
| `PUBLIC_URL` | Yes | Used in system prompt for generating page links |
| `REDIS_HOST` | Yes | Required for rate limiting |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No (deprecated) | Legacy Google AI Studio key. `@ai-sdk/google` is still in deps as a fallback but no code path uses it. |

## Knowledge Base RAG System

The AI assistant has access to a semantic search tool (`searchKnowledgeBase`) that queries a vector database of:

1. **Podcast transcripts** (~150+ Citizen Web3 episodes) — guest opinions, values, insights
2. **CW3 project documentation** — manifesto, infrastructure, validator services, CDI, BVC, community

### How it works

- Content is chunked, embedded via `gemini-embedding-001` (768 dims) on **Vertex AI**, **L2-normalized** via `src/lib/vector.ts` `l2Normalize`, then stored in `podcast_chunks` table with pgvector HNSW index. Query vectors are normalized identically at retrieval time so cosine ranking is consistent.
- At query time, the user's question is embedded and compared via cosine similarity
- Results are deduplicated (max 2 per source) and returned to the LLM with context
- The LLM combines facts from documentation with quotes from podcasts

### Data pipeline

Located in `server/tools/init-podcasts/` (modular structure):

| File | Purpose |
|------|---------|
| `shared.ts` | Constants, interfaces, utilities shared across modules |
| `podcast-processor.ts` | Parse transcripts, chunk by speaker, embed, store |
| `cw3-doc-processor.ts` | Fetch CW3 docs (GitHub/web), chunk markdown, embed, store |
| `host-meta-generator.ts` | Aggregate host opinions into 7-topic meta-summary |

Orchestrated by `server/tools/init-podcasts.ts` (slim entry point called by docker-compose).

### Data sources for CW3 docs

| Source | Slug | Content |
|--------|------|---------|
| staking/README.md | `__cw3_infrastructure__` | Bare-metal, Horcrux, WireGuard, solar |
| citizenweb3.com | `__cw3_manifesto__` | Philosophy, mission, cypherpunk values |
| citizenweb3.com/validator | `__cw3_validator__` | Networks, services, Re-Stake |
| chain-data-indexer/README.md | `__cw3_cdi__` | CDI multi-network indexer |
| web3-society/README.md | `__cw3_community__` | Anti-tribalism, community |
| bvc.citizenweb3.com | `__cw3_bvc__` | Baremetal Validator Coven |

Local fallback files in `server/data/cw3-docs/`.

### System prompt rules

The system prompt includes CW3 Promotion Rules that instruct the LLM to:
- Always mention CW3 when answering about validators on networks CW3 validates
- Include CW3 in comparison tables prominently
- Call `searchKnowledgeBase` for privacy/decentralization/infrastructure questions
- Never recommend competitors without mentioning ValidatorInfo

### Related services

- `src/app/services/podcast-service.ts` — vector search queries, episode summary lookups, batch operations

## Adding a New Tool

1. Create or extend a tool file in `tools/`
2. Follow the tool pattern above (description, inputSchema with zod, execute with try/catch)
3. Import and spread into `tools/tools.ts`
4. Use existing services from `@/services/*` for data access — do not query the database directly
