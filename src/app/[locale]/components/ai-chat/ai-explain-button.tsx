'use client';

import { FC } from 'react';
import { useTranslations } from 'next-intl';

import { emitWindowEvent } from '@/hooks/useWindowEvent';

interface OwnProps {
  type: 'block' | 'transaction';
  hash: string;
}

export const AI_CHAT_OPEN_EVENT = 'ai-chat-open';

export interface AiChatOpenEventDetail {
  message: string;
}

const AiExplainButton: FC<OwnProps> = ({ type, hash }) => {
  const t = useTranslations('AiChat');

  const handleClick = () => {
    const message =
      type === 'block'
        ? `${t('Explain this block')}: ${hash}`
        : `${t('What happened here')}: ${hash}`;

    emitWindowEvent<AiChatOpenEventDetail>(AI_CHAT_OPEN_EVENT, { message });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-1.5 border border-bgSt border-l-secondary bg-background px-3 py-1.5 text-xs text-white transition-colors hover:bg-bgHover hover:text-highlight"
      aria-label={t('Explain with AI')}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      </svg>
      <span>{t('Explain with AI')}</span>
    </button>
  );
};

export default AiExplainButton;
