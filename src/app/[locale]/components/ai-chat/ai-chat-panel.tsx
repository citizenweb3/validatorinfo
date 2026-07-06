'use client';

import { FC } from 'react';
import { useTranslations } from 'next-intl';

import RoundedButton from '@/components/common/rounded-button';
import { ChatMessage } from '@/hooks/use-ai-chat';
import { PageContext } from '@/hooks/use-ai-context';

import AiChatInput from './ai-chat-input';
import AiChatMessages from './ai-chat-messages';
import AiChatSuggestions from './ai-chat-suggestions';

interface OwnProps {
  context: PageContext;
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  onClose?: () => void;
  autoFocus?: boolean;
}

const AiChatPanel: FC<OwnProps> = ({
  context,
  messages,
  isLoading,
  sendMessage,
  clearMessages,
  onClose,
  autoFocus = false,
}) => {
  const t = useTranslations('AiChat');

  const handleSendMessage = (text: string) => {
    void sendMessage(text);
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-bgSt px-3 py-2.5 md:px-4 md:py-3">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-highlight">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
            <path d="M18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
          </svg>
          <span className="font-handjet text-xl text-highlight md:text-lg">{t('AI Assistant')}</span>
        </div>
        <div className="flex items-center gap-2.5 md:gap-3">
          {messages.length > 0 && (
            <RoundedButton onClick={clearMessages} contentClassName="!px-4 !py-1 text-sm">
              {t('New chat')}
            </RoundedButton>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 bg-close bg-contain hover:bg-close_h active:bg-close_a md:h-9 md:w-9"
              aria-label="Close"
              tabIndex={0}
            />
          )}
        </div>
      </div>

      <AiChatMessages messages={messages} isLoading={isLoading} context={context} onLinkClick={onClose} />

      {messages.length === 0 && !isLoading && (
        <AiChatSuggestions context={context} onSelect={handleSendMessage} />
      )}

      <AiChatInput onSend={handleSendMessage} isLoading={isLoading} autoFocus={autoFocus} />
    </>
  );
};

export default AiChatPanel;
