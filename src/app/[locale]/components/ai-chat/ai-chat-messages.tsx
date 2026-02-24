'use client';

import { FC, MouseEvent, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/utils/cn';
import parseMarkdown from '@/utils/parse-ai-markdown';
import { ChatMessage } from '@/hooks/use-ai-chat';
import { PageContext } from '@/hooks/use-ai-context';

interface OwnProps {
  messages: ChatMessage[];
  isLoading: boolean;
  context: PageContext;
  onLinkClick?: () => void;
}

const AiChatMessages: FC<OwnProps> = ({ messages, isLoading, context, onLinkClick }) => {
  const t = useTranslations('AiChat');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-chat-link]')) {
        onLinkClick?.();
      }
    },
    [onLinkClick],
  );

  const welcomeText = context.chainName
    ? t('Welcome Chain', { chainName: context.chainName })
    : t('Welcome');

  return (
    <div className="flex-1 overflow-y-auto p-4" onClick={handleClick}>
      {messages.length === 0 && (
        <div className="mb-4 whitespace-pre-wrap rounded border border-bgSt bg-bgHover p-3 text-sm text-gray-400">
          {welcomeText}
        </div>
      )}

      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            'mb-3 flex',
            message.role === 'user' && 'justify-end',
            message.role === 'assistant' && 'justify-start',
          )}
        >
          <div
            className={cn(
              'max-w-[85%] break-words px-3 py-2 text-sm',
              message.role === 'user' && 'whitespace-pre-wrap bg-highlight/20 text-white',
              message.role === 'assistant' && 'border border-bgSt bg-bgHover text-gray-300',
            )}
          >
            {message.role === 'assistant' ? parseMarkdown(message.content) : message.content}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="mb-3 flex justify-start">
          <div className="border border-bgSt bg-bgHover px-3 py-2 text-sm text-gray-400">
            <span className="inline-flex items-center gap-1">
              {t('AI is thinking')}
              <span className="inline-flex gap-0.5">
                <span className="h-1 w-1 animate-bounce rounded-full bg-gray-400" />
                <span className="h-1 w-1 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <span className="h-1 w-1 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
              </span>
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default AiChatMessages;
