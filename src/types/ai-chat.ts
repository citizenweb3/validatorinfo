export interface PageContext {
  locale: string;
  chainName?: string;
  validatorId?: string;
  validatorAddress?: string;
  proposalId?: string;
  blockHash?: string;
  txHash?: string;
  page: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type AskAgentResult =
  | { ok: true; text: string }
  | { ok: false; error: string; code: 'RATE_LIMITED' | 'INVALID_REQUEST' | 'EMPTY_RESPONSE' | 'SERVICE_ERROR' | 'AI_DISABLED' | 'TIMEOUT' };

// Validation patterns
export const SAFE_NAME = /^[a-zA-Z0-9_-]{1,64}$/;
export const SAFE_HASH = /^[a-zA-Z0-9_-]{1,128}$/;

// Message limits
export const MAX_MESSAGES = 10;
export const MAX_MESSAGE_LENGTH = 2000;
