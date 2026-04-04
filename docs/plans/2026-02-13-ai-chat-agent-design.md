# AI Chat Agent for ValidatorInfo

**Date:** 2026-02-13
**Status:** Approved

## Summary

Add an AI-powered chat agent to ValidatorInfo that helps users understand blockchain metrics, explains transactions and blocks, compares networks, and answers questions about validators and governance — all from a floating chat modal accessible on every page.

## Requirements

- **Universal assistant**: analytics, advice, explanations, cross-chain queries
- **Floating button + modal window**: accessible on all pages, auto-detects page context
- **LLM provider**: Gemini (initial), self-hosted later (Ollama/vLLM)
- **Data access**: hybrid — page context in system prompt + tool calling for additional data
- **No authentication** for now, rate limiting to be added later
- **Full response** (no streaming), with loading indicator
- **Conversation history** within session (while modal is open)
- **Language**: responds in the language of the question
- **Explain feature**: "Explain with AI" button on block/transaction pages
- **Transactions**: currently only Aztec (blocks still empty), but architecture supports all chains

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Frontend (React)                                │
│                                                  │
│  ┌──────────┐    ┌───────────────────────────┐  │
│  │ AI Button │───>│  AI Chat Modal            │  │
│  │ (float)   │    │  - message list            │  │
│  └──────────┘    │  - input field             │  │
│                   │  - loading indicator       │  │
│                   │  - page context (auto)     │  │
│                   └──────────┬────────────────┘  │
│                              │ Server Action      │
└──────────────────────────────┼───────────────────┘
                               │
┌──────────────────────────────┼───────────────────┐
│  Server Action: askAgent()   │                    │
│                              v                    │
│  ┌─────────────┐   ┌──────────────────────────┐ │
│  │ LLM Provider │   │  Tools (function calling) │ │
│  │ (Gemini)     │<->│  - getChainMetrics()     │ │
│  │              │   │  - getValidators()        │ │
│  │  Vercel AI   │   │  - getTokenomics()       │ │
│  │  SDK         │   │  - getProposals()         │ │
│  └─────────────┘   │  - compareChains()        │ │
│                      │  - getHistoricalData()   │ │
│                      │  - explainTransaction()  │ │
│                      │  - explainBlock()        │ │
│                      └──────────┬───────────────┘ │
└─────────────────────────────────┼─────────────────┘
                                  │
                    ┌─────────────v────────────┐
                    │  Existing Services        │
                    │  (chain-service,          │
                    │   validator-service,      │
                    │   price-service, etc.)    │
                    └──────────┬───────────────┘
                               │
                    ┌──────────v───────────────┐
                    │  PostgreSQL + Redis       │
                    └──────────────────────────┘
```

### Data Flow

1. User clicks button — modal opens
2. Frontend auto-detects context (chain name, page type) from URL
3. Message + context + history sent to `askAgent()` server action
4. Server action sends to Gemini via Vercel AI SDK with tool definitions
5. Gemini decides which tools to call based on the question
6. SDK executes tool functions locally (services -> DB), returns results to Gemini
7. Gemini formulates human-readable response
8. Response returned to frontend

### Tool Calling Flow (Vercel AI SDK)

SDK does NOT preload all data. Gemini receives only tool descriptions (schemas). The model decides which tools to invoke. SDK executes the call locally (services -> PostgreSQL), sends results back to Gemini. Only requested data enters the context — saves tokens.

```
User: "What is the APR of Cosmos Hub?"
  -> Gemini sees tool descriptions, decides: call getChainMetrics(chainName: 'cosmoshub')
  -> SDK executes: ChainService.getChainParams('cosmoshub') -> { apr: 15.2, ... }
  -> SDK sends result back to Gemini
  -> Gemini: "The APR of Cosmos Hub is currently 15.2%..."
```

## Backend Design

### Server Action: `src/actions/ai-chat.ts`

```typescript
'use server'

interface PageContext {
  chainName?: string;
  validatorAddress?: string;
  proposalId?: string;
  blockHash?: string;
  page: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const askAgent = async (messages: Message[], context: PageContext): Promise<string> => {
  const { text } = await generateText({
    model: google('gemini-2.0-flash'),
    system: buildSystemPrompt(context),
    messages,
    tools,
    maxSteps: 5,
  });
  return text;
};
```

Benefits over API route:
- Type-safe: types flow directly from server to client
- No manual fetch/JSON parsing
- Consistent with existing `src/actions/` pattern
- Note: if streaming is needed later, migrate to API route (minimal refactor)

### Tools

Wrappers over existing services, read-only:

| Tool | Purpose | Service |
|------|---------|---------|
| `getChainMetrics` | APR, TVL, price, chain params | ChainService, PriceService |
| `getValidators` | Validator list with filtering | ValidatorService, NodeService |
| `getTokenomics` | Supply, inflation, bonded ratio | TokenomicsService |
| `getProposals` | Governance proposals | ProposalService |
| `getHistoricalData` | Historical APR, TVL, prices | PriceService, ChainService |
| `compareChains` | Compare metrics across chains | ChainService, PriceService |
| `getValidatorDetails` | Specific validator details | NodeService, VoteService |
| `searchChains` | Search chains by name/ecosystem | SearchService |
| `explainTransaction` | Parse and explain a transaction | AztecDbService |
| `explainBlock` | Parse and explain a block | AztecDbService |

### System Prompt

Includes:
- Role: "You are ValidatorInfo AI assistant, helping users understand blockchain metrics"
- Current page context (from `context` field)
- Instruction to respond in the language of the question
- Constraints: no financial advice, reference data sources, no internal DB structure exposure

### LLM Provider Abstraction

```typescript
// Current (Gemini):
import { google } from '@ai-sdk/google';
const model = google('gemini-2.0-flash');

// Future (self-hosted via Ollama):
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
const model = createOpenAICompatible({ baseURL: 'http://localhost:11434/v1' });
```

Switching provider = changing one import. All tools, prompts, frontend remain unchanged.

## Frontend Design

### Components

**`AiChatButton`** — floating button (bottom-right corner):
- Fixed position, always visible
- Robot/sparkle icon + "Ask AI" text
- Opens modal on click
- Rendered in `layout.tsx` — available on all pages

**`AiChatModal`** — modal window with chat:
- Header with title and close button
- Message list (scrollable, auto-scroll to bottom)
- Loading indicator (dot animation)
- Input field with send button
- Suggestion buttons (context-dependent)
- Welcome message based on current page context

**`AiExplainButton`** — "Explain with AI" button:
- Placed on block and transaction pages
- Opens modal with pre-filled question ("Explain this block/transaction")

### Context Detection — `useAiContext()` hook

Parses current URL to extract:
- `chainName` from `/networks/{name}/`
- `page` type (overview, validators, governance, etc.)
- `validatorAddress` from validator detail pages
- `proposalId` from proposal pages
- `blockHash` from block pages

### Chat State — `useAiChat()` hook

- `messages[]` — conversation history (React state, resets on modal close)
- `isLoading` — loading indicator
- `sendMessage(text)` — calls `askAgent()` server action directly
- Welcome message generated based on context

### Contextual Suggestions

| Page | Suggestions |
|------|------------|
| Overview | "Key metrics", "Compare with others" |
| Validators | "Top validators", "Most reliable?" |
| Governance | "Active proposals", "Voting stats" |
| Tokenomics | "Supply breakdown", "Inflation trend" |
| Block | "Explain this block" |
| Transaction | "What happened here?" |

## File Structure

```
src/
├── actions/
│   └── ai-chat.ts                        # Server action (askAgent)
│
├── app/
│   ├── [locale]/
│   │   └── components/
│   │       └── ai-chat/
│   │           ├── ai-chat-button.tsx     # Floating button
│   │           ├── ai-chat-modal.tsx      # Modal window
│   │           ├── ai-chat-messages.tsx   # Message list
│   │           ├── ai-chat-input.tsx      # Input field
│   │           ├── ai-chat-suggestions.tsx # Quick action buttons
│   │           └── ai-explain-button.tsx  # "Explain" button for tx/blocks
│   │
│   └── services/
│       └── ai-service.ts                 # LLM config + system prompt
│
├── hooks/
│   ├── use-ai-chat.ts                    # Chat state, message sending
│   └── use-ai-context.ts                # Page context detection
│
server/
└── tools/
    └── ai/
        ├── tools.ts                      # All tool definitions (registry)
        ├── chain-tools.ts                # getChainMetrics, compareChains
        ├── validator-tools.ts            # getValidators, getValidatorDetails
        ├── governance-tools.ts           # getProposals
        ├── market-tools.ts              # getHistoricalData, prices
        └── explain-tools.ts             # explainTransaction, explainBlock
```

## Security

- Server action validates input with zod schema (messages, context)
- Gemini API key in `.env` only (`GEMINI_API_KEY`), never exposed to frontend (server actions run server-side)
- Tools are read-only — no database mutations
- System prompt prohibits exposing SQL, DB structure, financial recommendations
- Message history capped at 20 messages (trim oldest)

## Error Handling

- Gemini API unavailable: frontend shows "AI temporarily unavailable, try later"
- Tool returns empty data: agent responds "Data for this network is not yet available"
- Too long history: trim to last 20 messages, keep system prompt intact

## Localization

- UI strings (button, modal chrome): `useTranslations('AiChat')` in all 3 files (en.json, pt.json, ru.json)
- Agent responses: in the language of the user's question (instruction in system prompt)

## Future Enhancements (not in scope now)

- **Rate limiting**: Redis counter per IP, check inside server action or middleware
- **Streaming responses**: migrate server action to API route, switch from `generateText` to `streamText`
- **Self-hosted LLM**: change provider import in `ai-service.ts`
- **MCP server**: expose ValidatorInfo data for Claude Desktop / Cursor users
- **Persistent chat history**: save to DB per user session

## Dependencies to Add

```
ai                        # Vercel AI SDK core
@ai-sdk/google            # Gemini provider
zod                       # Request validation (may already exist)
```

## Environment Variables

```
GEMINI_API_KEY=           # Google AI API key (required)
```
