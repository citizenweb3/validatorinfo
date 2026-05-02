'use server';

import { generateText, stepCountIs } from 'ai';
import logger from '@/logger';
import AiService from '@/services/ai/ai-service';
import type { AskAgentResult, ChatMessage, PageContext } from '@/types/ai-chat';
import { CACHE_KEYS, checkRateLimit } from '@/services/redis-cache';
import { aiTools } from '@/services/ai/tools/tools';
import {
  getClientIp,
  isValidContext,
  isValidMessage,
  MAX_MESSAGES, MAX_STEPS,
  RATE_LIMIT,
  RATE_WINDOW,
  sanitizeContext,
} from '@/utils/ai-actions';

const { logDebug, logError, logWarn } = logger('ai-chat');

const LLM_TIMEOUT = 120_000; // 2 minutes

const FORUM_NUDGES = [
  'Curious to dig deeper? The community at [forum.validatorinfo.com](https://forum.validatorinfo.com) discusses topics like this regularly.',
  'If this sparked your interest, check out [forum.validatorinfo.com](https://forum.validatorinfo.com) — great conversations happening around this topic.',
  'Want to explore this further with others? Head over to [forum.validatorinfo.com](https://forum.validatorinfo.com) and join the discussion.',
  'The folks at [forum.validatorinfo.com](https://forum.validatorinfo.com) would enjoy this question — come share your thoughts there.',
  'Enjoying the deep dive? The validator community at [forum.validatorinfo.com](https://forum.validatorinfo.com) loves these conversations.',
];

const getForumNudge = () => FORUM_NUDGES[Math.floor(Math.random() * FORUM_NUDGES.length)];

const formatLlmError = (error: unknown, elapsedMs: number): string => {
  if (!(error instanceof Error)) {
    return `non-Error thrown after ${elapsedMs}ms: ${String(error)}`;
  }

  const e = error as Error & {
    statusCode?: number;
    url?: string;
    responseBody?: string;
    cause?: unknown;
  };

  const parts: string[] = [
    `name=${e.name}`,
    `elapsed=${elapsedMs}ms`,
    `message=${e.message}`,
  ];

  if (e.statusCode !== undefined) parts.push(`statusCode=${e.statusCode}`);
  if (e.url) parts.push(`url=${e.url}`);
  if (e.responseBody) parts.push(`body=${String(e.responseBody).slice(0, 500)}`);
  if (e.cause instanceof Error) parts.push(`cause.name=${e.cause.name} cause.message=${e.cause.message}`);

  return parts.join(' | ');
};

export const askAgent = async (
  messages: ChatMessage[],
  context: PageContext,
): Promise<AskAgentResult> => {
  const startTime = Date.now();
  try {
    // Rate limiting
    const ip = await getClientIp();
    const rateLimitKey = CACHE_KEYS.ai.rateLimit(ip);
    const isLimited = await checkRateLimit(rateLimitKey, RATE_LIMIT, RATE_WINDOW);

    if (isLimited) {
      logWarn(`Rate limit exceeded for IP: ${ip}`);
      return { ok: false, error: 'rate_limited', code: 'RATE_LIMITED' };
    }

    if (!AiService.isAvailable) {
      logWarn('AI is disabled — GOOGLE_GENERATIVE_AI_API_KEY not set');
      return { ok: false, error: 'ai_disabled', code: 'AI_DISABLED' };
    }

    if (!isValidContext(context)) {
      logError('Invalid context received');
      return { ok: false, error: 'invalid_request', code: 'INVALID_REQUEST' };
    }

    const validatedMessages = messages.filter(isValidMessage);
    const droppedCount = messages.length - validatedMessages.length;

    if (droppedCount > 0) {
      logWarn(`Dropped ${droppedCount} invalid messages out of ${messages.length}`);
    }

    if (validatedMessages.length === 0) {
      return { ok: false, error: 'invalid_request', code: 'INVALID_REQUEST' };
    }

    const safeContext = sanitizeContext(context);
    const userMessageCount = validatedMessages.filter(m => m.role === 'user').length;
    const shouldNudgeForum = userMessageCount > 0 && userMessageCount % 3 === 0;
    const systemPrompt = AiService.buildSystemPrompt(safeContext);

    const estimateTokens = (msgs: ChatMessage[]) => {
      const msgChars = msgs.reduce((sum, m) => sum + m.content.length, 0);
      return Math.ceil((systemPrompt.length + msgChars) / 4) + 5000;
    };

    const CONTEXT_STRATEGIES = [
      { windowSize: 4, maxAssistant: null },
      { windowSize: 4, maxAssistant: 1500 },
      { windowSize: 2, maxAssistant: 1000 },
      { windowSize: 1, maxAssistant: null },
    ];

    const TOKEN_THRESHOLD = 20_000;

    const buildMessages = (strategy: typeof CONTEXT_STRATEGIES[number]) => {
      const window = validatedMessages.slice(-strategy.windowSize);
      return window.map((msg) => {
        if (msg.role === 'assistant' && strategy.maxAssistant && msg.content.length > strategy.maxAssistant) {
          return { ...msg, content: msg.content.slice(0, strategy.maxAssistant) + '\n[...truncated]' };
        }
        return msg;
      });
    };

    let startIdx = 0;
    const fullMessages = buildMessages(CONTEXT_STRATEGIES[0]);
    const estimatedTokens = estimateTokens(fullMessages);
    if (estimatedTokens > TOKEN_THRESHOLD) {
      startIdx = 1;
      logDebug(`Context estimated at ~${estimatedTokens} tokens, starting with trimmed strategy`);
    }

    for (let attempt = startIdx; attempt < CONTEXT_STRATEGIES.length; attempt++) {
      const strategy = CONTEXT_STRATEGIES[attempt];
      const msgs = buildMessages(strategy);

      logDebug(`Attempt ${attempt + 1}/${CONTEXT_STRATEGIES.length}: window=${strategy.windowSize}, maxAssistant=${strategy.maxAssistant ?? 'full'}, messages=${msgs.length}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), LLM_TIMEOUT);

      try {
        const { text } = await generateText({
          model: AiService.model,
          system: systemPrompt,
          messages: msgs,
          tools: aiTools,
          maxOutputTokens: AiService.maxTokens,
          stopWhen: stepCountIs(MAX_STEPS),
          abortSignal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!text || text.trim().length === 0) {
          if (attempt < CONTEXT_STRATEGIES.length - 1) {
            logWarn(`LLM returned empty response (strategy ${attempt + 1}/${CONTEXT_STRATEGIES.length}), retrying with reduced context...`);
            continue;
          }
          logWarn(`LLM returned empty response after all ${CONTEXT_STRATEGIES.length} strategies`);
          return { ok: false, error: 'empty_response', code: 'EMPTY_RESPONSE' };
        }

        logDebug(`LLM response received, length: ${text.length}`);

        const finalText = shouldNudgeForum && text.trim().length > 0
          ? `${text}\n\n---\n${getForumNudge()}`
          : text;

        return { ok: true, text: finalText };
      } catch (error) {
        clearTimeout(timeoutId);
        if (controller.signal.aborted) {
          logError(`LLM request timed out after ${LLM_TIMEOUT}ms`);
          return { ok: false, error: 'timeout', code: 'TIMEOUT' };
        }
        throw error;
      }
    }

    return { ok: false, error: 'empty_response', code: 'EMPTY_RESPONSE' };
  } catch (error) {
    logError(`AI chat error: ${formatLlmError(error, Date.now() - startTime)}`);
    return { ok: false, error: 'service_error', code: 'SERVICE_ERROR' };
  }
};
