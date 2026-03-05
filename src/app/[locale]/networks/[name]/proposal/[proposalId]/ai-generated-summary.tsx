'use client';

import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale, useTranslations } from 'next-intl';

import { generateProposalSummary } from '@/actions/ai-summary';
import RoundedButton from '@/components/common/rounded-button';
import SubTitle from '@/components/common/sub-title';
import parseMarkdown from '@/utils/parse-ai-markdown';

interface OwnProps {
  hasText: boolean;
  chainId: number | null;
  proposalId: string;
}

const getErrorMessageKey = (code: string) => {
  switch (code) {
    case 'RATE_LIMITED': return 'ai summary rate limited' as const;
    case 'TIMEOUT': return 'ai summary timeout' as const;
    case 'AI_DISABLED': return 'ai summary disabled' as const;
    default: return 'ai summary error' as const;
  }
};

const AiGeneratedSummary: FC<OwnProps> = ({ hasText, chainId, proposalId }) => {
  const t = useTranslations('ProposalPage');
  const locale = useLocale();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buttonSlot, setButtonSlot] = useState<HTMLElement | null>(null);
  const prevExpandedRef = useRef(false);

  useEffect(() => {
    setButtonSlot(document.getElementById('ai-summary-button-slot'));
  }, []);

  const fetchSummary = useCallback(async () => {
    if (isLoadingRef.current || summary || !chainId) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateProposalSummary(chainId, proposalId, locale);

      if (result.ok) {
        setSummary(result.text);
      } else {
        setError(t(getErrorMessageKey(result.code)));
      }
    } catch {
      setError(t('ai summary error'));
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [summary, chainId, proposalId, locale, t]);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isExpanded && !prevExpandedRef.current) {
      fetchSummary();
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
    prevExpandedRef.current = isExpanded;
  }, [isExpanded, fetchSummary]);

  const renderedSummary = useMemo(() => {
    if (!summary) return null;
    try {
      return parseMarkdown(summary);
    } catch {
      return <span>{summary}</span>;
    }
  }, [summary]);

  if (!hasText || !chainId) return null;

  return (
    <>
      {buttonSlot && createPortal(
        <RoundedButton onClick={handleToggle} className="font-handjet text-lg">
          {isExpanded ? t('hide ai summary') : t('show ai summary')}
        </RoundedButton>,
        buttonSlot,
      )}

      {(isExpanded || isLoading) && (
        <div ref={sectionRef} className="mt-4 mb-6">
          <SubTitle text={t('ai generated summary')} />

          {isLoading && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="inline-flex items-end gap-[3px]">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className="w-[2px] h-4 rounded-sm bg-highlight origin-bottom"
                    style={{ animation: `ai-bar-pulse 1.2s ease-in-out ${i * 0.12}s infinite` }}
                  />
                ))}
              </span>
              <span
                className="font-handjet text-lg text-highlight"
                style={{ animation: 'ai-text-glow 2s ease-in-out infinite' }}
              >
                {t('ai is thinking')}
              </span>
            </div>
          )}

          {error && !isLoading && (
            <div className="mt-4 ml-4 font-sfpro text-sm text-red-400">
              {error}
            </div>
          )}

          {isExpanded && renderedSummary && (
            <div className="mt-4 ml-4 font-sfpro text-base">
              {renderedSummary}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AiGeneratedSummary;
