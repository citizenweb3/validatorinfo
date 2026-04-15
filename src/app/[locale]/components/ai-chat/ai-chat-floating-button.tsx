'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { usePathname } from '@/i18n';
import { emitWindowEvent } from '@/hooks/useWindowEvent';

import { AI_CHAT_OPEN_EVENT, AiChatOpenEventDetail } from './ai-explain-button';

const HIDDEN_PATHS = ['/', '/help'];

const AiChatFloatingButton = () => {
  const t = useTranslations('Navbar');
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(!!document.querySelector('[data-no-explain]'));
  }, [pathname]);

  if (HIDDEN_PATHS.includes(pathname) || hidden) {
    return null;
  }

  const handleClick = () => {
    emitWindowEvent<AiChatOpenEventDetail>(AI_CHAT_OPEN_EVENT, { message: '' });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 border border-bgSt bg-background px-3 py-2 text-white shadow-button transition-colors hover:bg-bgHover hover:text-highlight md:bottom-6 md:right-14"
      aria-label={t('Explain')}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
        <path d="M18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
      </svg>
      <span className="font-handjet text-lg tracking-wide">{t('Explain')}</span>
    </button>
  );
};

export default AiChatFloatingButton;
