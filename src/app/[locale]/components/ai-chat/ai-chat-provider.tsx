'use client';

import { useCallback, useState } from 'react';

import { useWindowEvent } from '@/hooks/useWindowEvent';

import AiChatModal from './ai-chat-modal';
import { AI_CHAT_OPEN_EVENT, AiChatOpenEventDetail } from './ai-explain-button';

const AiChatProvider = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | undefined>();

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setInitialMessage(undefined);
  }, []);

  const handleChatEvent = useCallback((detail: AiChatOpenEventDetail) => {
    if (detail?.message) {
      setInitialMessage(detail.message);
    } else {
      setInitialMessage(undefined);
    }
    setIsOpen(true);
  }, []);

  useWindowEvent<AiChatOpenEventDetail>(AI_CHAT_OPEN_EVENT, handleChatEvent);

  return (
    <AiChatModal isOpen={isOpen} onClose={handleClose} initialMessage={initialMessage} />
  );
};

export default AiChatProvider;
