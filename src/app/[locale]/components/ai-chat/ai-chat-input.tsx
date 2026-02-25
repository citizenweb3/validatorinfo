'use client';

import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { MAX_MESSAGE_LENGTH } from '@/types/ai-chat';
import { cn } from '@/utils/cn';

interface OwnProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

const AiChatInput: FC<OwnProps> = ({ onSend, isLoading }) => {
  const t = useTranslations('AiChat');
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Refocus input after AI response arrives
  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  const handleSend = () => {
    if (!value.trim() || isLoading) return;
    onSend(value);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  return (
    <div className="flex items-end gap-2 border-t border-bgSt p-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          handleInput();
        }}
        onKeyDown={handleKeyDown}
        placeholder={t('Type your question')}
        disabled={isLoading}
        maxLength={MAX_MESSAGE_LENGTH}
        rows={1}
        autoFocus
        className={cn(
          'flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white outline-none placeholder:text-gray-500',
          isLoading && 'opacity-50',
        )}
        aria-label={t('Type your question')}
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={!value.trim() || isLoading}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center border border-bgSt transition-colors',
          value.trim() && !isLoading
            ? 'bg-highlight/20 text-highlight hover:bg-highlight/30'
            : 'cursor-not-allowed text-gray-600',
        )}
        aria-label={t('Send')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
    </div>
  );
};

export default AiChatInput;
