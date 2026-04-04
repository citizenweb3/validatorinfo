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
const MAX_OUTPUT_TOKENS = 4096;
const LLM_TIMEOUT = 60_000;
const RATE_LIMIT = 5;
const RATE_WINDOW = 60;
const SENTENCE_END = /[.!?。！？]$/;

const buildSummaryPrompt = (locale: string): string =>
  [
    'You are a concise summarizer for blockchain governance proposals.',
    '',
    `Respond in the language matching locale "${locale}".`,
    'Provide a 2-3 sentence summary of the proposal text below.',
    'Focus on: what the proposal does, why it matters, and what changes if it passes.',
    'Write in simple, plain language that anyone can understand — avoid technical jargon.',
    'Do NOT use markdown headers or bullet points. Just plain sentences ending with a period.',
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
    const safeLocale = SAFE_LOCALE.test(locale) ? locale : 'en';

    const proposal = await ProposalService.getProposalById(chainId, proposalId);

    if (!proposal) {
      logWarn(`Proposal ${proposalId} not found for chain ${chainId}`);
      return { ok: false, error: 'invalid_request', code: 'INVALID_REQUEST' };
    }

    const description = proposal.description?.trim();
    const hasUsableDescription = description && !description.startsWith('Payload');
    const proposalText = (hasUsableDescription ? description : proposal.fullText?.trim()) || '';

    if (!proposalText) {
      logWarn(`Summary requested for proposal ${proposalId} without text`);
      return { ok: false, error: 'invalid_request', code: 'INVALID_REQUEST' };
    }

    const saved = (proposal.aiSummary as Record<string, string> | null)?.[safeLocale];
    if (saved) {
      logDebug(`Returning saved summary for proposal ${proposalId}, locale: ${safeLocale}`);
      return { ok: true, text: saved };
    }

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

    logDebug(`Generating summary, locale: ${safeLocale}, source: ${description ? 'description' : 'fullText'}, text length: ${proposalText.length}`);

    const systemPrompt = buildSummaryPrompt(safeLocale);
    let text = await callWithRetry(proposalText, systemPrompt);

    if (!text?.trim()) {
      logWarn('LLM returned empty summary');
      return { ok: false, error: 'empty_response', code: 'EMPTY_RESPONSE' };
    }

    const isComplete = SENTENCE_END.test(text.trim());

    if (!isComplete) {
      logWarn(`Summary truncated, retrying. Text: "${text.slice(-50)}"`);
      const retryText = await callWithRetry(proposalText, systemPrompt);

      if (retryText?.trim()) {
        const isRetryComplete = SENTENCE_END.test(retryText.trim());
        if (isRetryComplete || retryText.trim().length >= text.trim().length) {
          text = retryText;
        }
      }
    }

    const finalText = text.trim();
    const isFinalComplete = SENTENCE_END.test(finalText);

    logDebug(`Summary generated, length: ${finalText.length}, complete: ${isFinalComplete}`);

    if (isFinalComplete) {
      // Fire-and-forget: save to DB without blocking the response to the user
      ProposalService.saveAiSummary(chainId, proposalId, safeLocale, finalText)
        .catch(err => logError(`Failed to save summary for proposal ${proposalId}: ${err instanceof Error ? err.message : String(err)}`, err));
    } else {
      logWarn(`Summary still truncated after retry, returning without saving to DB`);
    }

    return { ok: true, text: finalText };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logError('Summary request timed out');
      return { ok: false, error: 'timeout', code: 'TIMEOUT' };
    }
    logError(`Summary error: ${error instanceof Error ? error.message : String(error)}`, error);
    return { ok: false, error: 'service_error', code: 'SERVICE_ERROR' };
  }
};
