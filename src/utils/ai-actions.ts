import type { ChatMessage, PageContext } from '@/types/ai-chat';
import { MAX_MESSAGES, MAX_MESSAGE_LENGTH, SAFE_NAME, SAFE_HASH } from '@/types/ai-chat';
import logger from '@/logger';
import { headers } from 'next/headers';

const { logWarn } = logger('ai-chat');

export { MAX_MESSAGES };
export const MAX_STEPS = 5;
export const RATE_LIMIT = 10;
export const RATE_WINDOW = 60;

const SAFE_LOCALE = /^[a-z]{2}$/;
const SAFE_PAGE = /^[a-zA-Z0-9_\-/]{1,128}$/;

const isValidRole = (role: string): role is 'user' | 'assistant' =>
  role === 'user' || role === 'assistant';

export const isValidMessage = (msg: unknown): msg is ChatMessage => {
  if (!msg || typeof msg !== 'object') return false;
  const m = msg as Record<string, unknown>;
  return (
    typeof m.role === 'string' &&
    isValidRole(m.role) &&
    typeof m.content === 'string' &&
    m.content.length > 0 &&
    m.content.length <= MAX_MESSAGE_LENGTH
  );
};

export const getClientIp = async (): Promise<string> => {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
    || headersList.get('x-real-ip')?.trim()
    || 'unknown';

  if (ip === 'unknown') {
    logWarn('Could not determine client IP for rate limiting — requests share a common bucket');
  }

  return ip;
};

export const isValidContext = (ctx: unknown): ctx is PageContext => {
  if (!ctx || typeof ctx !== 'object') return false;
  const c = ctx as Record<string, unknown>;
  return typeof c.locale === 'string' && typeof c.page === 'string';
};

export const sanitizeField = (value: string | undefined, pattern: RegExp, fieldName: string): string | undefined => {
  if (!value) return undefined;
  if (pattern.test(value)) return value;
  logWarn(`Sanitized suspicious ${fieldName}: "${value.slice(0, 50)}"`);
  return undefined;
};

export const sanitizeContext = (ctx: PageContext): PageContext => ({
  locale: SAFE_LOCALE.test(ctx.locale) ? ctx.locale : 'en',
  page: SAFE_PAGE.test(ctx.page) ? ctx.page : 'home',
  chainName: sanitizeField(ctx.chainName, SAFE_NAME, 'chainName'),
  validatorId: sanitizeField(ctx.validatorId, SAFE_NAME, 'validatorId'),
  validatorAddress: sanitizeField(ctx.validatorAddress, SAFE_HASH, 'validatorAddress'),
  proposalId: sanitizeField(ctx.proposalId, SAFE_NAME, 'proposalId'),
  blockHash: sanitizeField(ctx.blockHash, SAFE_HASH, 'blockHash'),
  txHash: sanitizeField(ctx.txHash, SAFE_HASH, 'txHash'),
});