'use server';

import { generateText } from 'ai';
import logger from '@/logger';
import AiService from '@/services/ai/ai-service';
import type { AskAgentResult } from '@/types/ai-chat';
import { CACHE_KEYS, checkRateLimit } from '@/services/redis-cache';
import { getClientIp, SAFE_LOCALE } from '@/utils/ai-actions';
import ProposalService from '@/services/proposal-service';

const { logDebug, logError, logWarn } = logger('ai-summary');

const FALLBACK_LENGTH = 50_000;
const MAX_OUTPUT_TOKENS = 512;
const LLM_TIMEOUT = 30_000;
const RATE_LIMIT = 5;
const RATE_WINDOW = 60;

const buildSummaryPrompt = (locale: string): string =>
  [
    'You are a concise summarizer for blockchain governance proposals.',
    '',
    `Respond in the language matching locale "${locale}".`,
    'Provide a 2-3 sentence summary of the proposal text below.',
    'Focus on: what the proposal does, why it matters, and what changes if it passes.',
    'Do NOT use markdown headers or bullet points. Just plain sentences.',
  ].join('\n');

const callLLM = async (text: string, systemPrompt: string): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LLM_TIMEOUT);

  try {
    const { text: result } = await generateText({
      model: AiService.model,
      system: systemPrompt,
      messages: [{ role: 'user', content: text }],
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      abortSignal: controller.signal,
    });
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const callWithRetry = async (fullText: string, systemPrompt: string): Promise<string> => {
  try {
    return await callLLM(fullText, systemPrompt);
  } catch (error) {
    if (fullText.length > FALLBACK_LENGTH) {
      logWarn(`LLM failed with ${fullText.length} chars, retrying with ${FALLBACK_LENGTH} chars`);
      return await callLLM(fullText.slice(0, FALLBACK_LENGTH), systemPrompt);
    }
    throw error;
  }
};

export const generateProposalSummary = async (
  chainId: number,
  proposalId: string,
  locale: string,
): Promise<AskAgentResult> => {
  try {
    const ip = await getClientIp();
    const rateLimitKey = CACHE_KEYS.ai.summaryRateLimit(ip);
    const isLimited = await checkRateLimit(rateLimitKey, RATE_LIMIT, RATE_WINDOW);

    if (isLimited) {
      logWarn(`Summary rate limit exceeded for IP: ${ip}`);
      return { ok: false, error: 'rate_limited', code: 'RATE_LIMITED' };
    }

    if (!AiService.isAvailable) {
      logWarn('AI is disabled — GOOGLE_GENERATIVE_AI_API_KEY not set');
      return { ok: false, error: 'ai_disabled', code: 'AI_DISABLED' };
    }

    const proposal = await ProposalService.getProposalById(chainId, proposalId);

    if (!proposal?.fullText?.trim()) {
      logWarn(`Summary requested for proposal ${proposalId} without fullText`);
      return { ok: false, error: 'invalid_request', code: 'INVALID_REQUEST' };
    }

    const safeLocale = SAFE_LOCALE.test(locale) ? locale : 'en';
    const systemPrompt = buildSummaryPrompt(safeLocale);
    const fullText = proposal.fullText;

    logDebug(`Generating summary, locale: ${safeLocale}, text length: ${fullText.length}`);

    const text = await callWithRetry(fullText, systemPrompt);

    if (!text?.trim()) {
      logWarn('LLM returned empty summary');
      return { ok: false, error: 'empty_response', code: 'EMPTY_RESPONSE' };
    }

    logDebug(`Summary generated, length: ${text.length}`);
    return { ok: true, text };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logError('Summary request timed out');
      return { ok: false, error: 'timeout', code: 'TIMEOUT' };
    }
    logError(`Summary error: ${error instanceof Error ? error.message : String(error)}`, error);
    return { ok: false, error: 'service_error', code: 'SERVICE_ERROR' };
  }
};
