'use client';

import { FC, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useOnClickOutside } from 'usehooks-ts';

import { useAiChat } from '@/hooks/use-ai-chat';
import { useAiContext } from '@/hooks/use-ai-context';

import AiChatPanel from './ai-chat-panel';

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
        <AiChatPanel
          context={context}
          messages={messages}
          isLoading={isLoading}
          sendMessage={sendMessage}
          clearMessages={clearMessages}
          onClose={onClose}
          autoFocus
        />
      </div>
    </div>
  );
};

export default AiChatModal;
