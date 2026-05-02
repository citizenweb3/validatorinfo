'use client';

import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { MAX_MESSAGE_LENGTH } from '@/types/ai-chat';
import { cn } from '@/utils/cn';

interface OwnProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  autoFocus?: boolean;
}

const AiChatInput: FC<OwnProps> = ({ onSend, isLoading, autoFocus = false }) => {
  const t = useTranslations('AiChat');
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Refocus input after AI response arrives
  useEffect(() => {
    if (autoFocus && !isLoading) {
      textareaRef.current?.focus({ preventScroll: true });
    }
  }, [autoFocus, isLoading]);

  const handleSend = () => {
    if (!value.trim() || isLoading) return;
    onSend(value);
    setValue('');
    textareaRef.current?.focus({ preventScroll: true });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-5 border-t border-bgSt p-6 sm:gap-3 sm:p-4 md:gap-2 md:p-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder={t('Type your question')}
        disabled={isLoading}
        maxLength={MAX_MESSAGE_LENGTH}
        rows={1}
        autoFocus={autoFocus}
        className={cn(
          'min-h-20 flex-1 resize-none bg-transparent px-4 py-3 text-6xl leading-tight text-white outline-none placeholder:text-gray-500 sm:min-h-14 sm:text-3xl md:min-h-0 md:px-2 md:py-1.5 md:text-sm',
          isLoading && 'opacity-50',
        )}
        aria-label={t('Type your question')}
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={!value.trim() || isLoading}
        className={cn(
          'flex h-20 w-20 shrink-0 items-center justify-center border border-bgSt transition-colors sm:h-14 sm:w-14 md:h-8 md:w-8',
          value.trim() && !isLoading
            ? 'bg-highlight/20 text-highlight hover:bg-highlight/30'
            : 'cursor-not-allowed text-gray-600',
        )}
        aria-label={t('Send')}
      >
        <svg className="h-10 w-10 sm:h-7 sm:w-7 md:h-4 md:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
    </div>
  );
};

export default AiChatInput;
