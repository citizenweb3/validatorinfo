'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { askAgent } from '@/actions/ai-chat';
import type { AskAgentResult, ChatMessage, PageContext } from '@/types/ai-chat';
import { MAX_MESSAGES, MAX_MESSAGE_LENGTH } from '@/types/ai-chat';

export type { ChatMessage };

export interface UseAiChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
}

const getErrorMessage = (result: AskAgentResult, t: ReturnType<typeof useTranslations>): string => {
  if (result.ok) return '';

  switch (result.code) {
    case 'RATE_LIMITED':
      return t('Rate limited');
    case 'EMPTY_RESPONSE':
      return t('Empty response');
    case 'INVALID_REQUEST':
      return t('Invalid request');
    case 'AI_DISABLED':
      return t('AI not configured');
    case 'TIMEOUT':
      return t('Request timed out');
    case 'SERVICE_ERROR':
    default:
      return t('AI unavailable');
  }
};

export const useAiChat = (context: PageContext): UseAiChatReturn => {
  const t = useTranslations('AiChat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoadingRef.current) return;

      isLoadingRef.current = true;
      setIsLoading(true);

      const userMessage: ChatMessage = { role: 'user', content: text.trim().slice(0, MAX_MESSAGE_LENGTH) };
      const updatedMessages = [...messagesRef.current, userMessage].slice(-MAX_MESSAGES);

      messagesRef.current = updatedMessages;
      setMessages(updatedMessages);

      try {
        const result = await askAgent(updatedMessages, context);

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: result.ok ? result.text : getErrorMessage(result, t),
        };
        const withResponse = [...messagesRef.current, assistantMessage].slice(-MAX_MESSAGES);

        messagesRef.current = withResponse;
        setMessages(withResponse);
      } catch (error) {
        console.error('[ai-chat] Failed to send message:', error);

        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: t('AI unavailable'),
        };
        const withError = [...messagesRef.current, errorMessage].slice(-MAX_MESSAGES);

        messagesRef.current = withError;
        setMessages(withError);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [context, t],
  );

  const clearMessages = useCallback(() => {
    messagesRef.current = [];
    setMessages([]);
  }, []);

  return { messages, isLoading, sendMessage, clearMessages };
};
