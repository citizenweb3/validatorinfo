'use client';

import { FC, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useOnClickOutside } from 'usehooks-ts';

import { useAiChat } from '@/hooks/use-ai-chat';
import { useAiContext } from '@/hooks/use-ai-context';

import RoundedButton from '@/components/common/rounded-button';

import AiChatMessages from './ai-chat-messages';
import AiChatInput from './ai-chat-input';
import AiChatSuggestions from './ai-chat-suggestions';

interface OwnProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
}

const AiChatModal: FC<OwnProps> = ({ isOpen, onClose, initialMessage }) => {
  const t = useTranslations('AiChat');
  const context = useAiContext();
  const { messages, isLoading, sendMessage, clearMessages } = useAiChat(context);
  const modalRef = useRef<HTMLDivElement>(null);
  const initialMessageSentRef = useRef(false);

  useOnClickOutside(modalRef as React.RefObject<HTMLElement>, () => {
    if (isOpen) onClose();
  });

  useEffect(() => {
    if (!isOpen) {
      initialMessageSentRef.current = false;
      return;
    }

    if (initialMessage && !initialMessageSentRef.current) {
      initialMessageSentRef.current = true;
      sendMessage(initialMessage);
    }
  }, [isOpen, initialMessage, sendMessage]);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', isOpen);

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-overlay flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm md:p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('AI Assistant')}
        className="flex h-3/4 max-h-ai-chat-modal w-full max-w-ai-chat-modal flex-col border border-bgSt bg-background shadow-3xl"
      >
        {/* Header */}
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
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 bg-close bg-contain hover:bg-close_h active:bg-close_a md:h-9 md:w-9"
              aria-label="Close"
              tabIndex={0}
            />
          </div>
        </div>

        {/* Messages */}
        <AiChatMessages messages={messages} isLoading={isLoading} context={context} onLinkClick={onClose} />

        {/* Suggestions (shown when no messages) */}
        {messages.length === 0 && !isLoading && (
          <AiChatSuggestions context={context} onSelect={sendMessage} />
        )}

        {/* Input */}
        <AiChatInput onSend={sendMessage} isLoading={isLoading} autoFocus />
      </div>
    </div>
  );
};

export default AiChatModal;
