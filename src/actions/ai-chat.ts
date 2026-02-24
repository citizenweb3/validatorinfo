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

const LLM_TIMEOUT = 60_000; // 60 seconds

export const askAgent = async (
  messages: ChatMessage[],
  context: PageContext,
): Promise<AskAgentResult> => {
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

    const trimmedMessages = validatedMessages.slice(-MAX_MESSAGES);
    const safeContext = sanitizeContext(context);
    const systemPrompt = AiService.buildSystemPrompt(safeContext);

    logDebug(`Calling LLM with ${trimmedMessages.length} messages, page: ${safeContext.page}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), LLM_TIMEOUT);

    try {
      const { text } = await generateText({
        model: AiService.model,
        system: systemPrompt,
        messages: trimmedMessages,
        tools: aiTools,
        maxOutputTokens: AiService.maxTokens,
        stopWhen: stepCountIs(MAX_STEPS),
        abortSignal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!text || text.trim().length === 0) {
        logWarn('LLM returned empty response');
        return { ok: false, error: 'empty_response', code: 'EMPTY_RESPONSE' };
      }

      logDebug(`LLM response received, length: ${text.length}`);

      return { ok: true, text };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        logError('LLM request timed out');
        return { ok: false, error: 'timeout', code: 'TIMEOUT' };
      }
      throw error; // re-throw non-timeout errors to be caught by outer try/catch
    }
  } catch (error) {
    logError(`AI chat error: ${error instanceof Error ? error.message : String(error)}`);
    return { ok: false, error: 'service_error', code: 'SERVICE_ERROR' };
  }
};
