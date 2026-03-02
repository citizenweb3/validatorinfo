'use client';

import { FC, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import parseMarkdown from '@/utils/parse-ai-markdown';
import SubTitle from '@/components/common/sub-title';
import { useProposalText } from '@/app/networks/[name]/proposal/[proposalId]/proposal-text-context';

const stripHtmlTags = (html: string): string =>
  html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const containsHtml = (text: string): boolean => /<[a-z][^>]*>/i.test(text);

const renderText = (text: string, errorFallback: string) => {
  try {
    const cleaned = containsHtml(text) ? stripHtmlTags(text) : text;
    return parseMarkdown(cleaned);
  } catch (error) {
    console.error('[proposal-full-text] Failed to render text:', error);
    return <div className="text-gray-400">{errorFallback}</div>;
  }
};

interface OwnProps {
  description: string | null;
  fullText: string | null;
}

const ProposalFullText: FC<OwnProps> = ({ description, fullText }) => {
  const t = useTranslations('ProposalPage');
  const { isExpanded } = useProposalText();
  const errorFallback = t('render error');

  const renderedDescription = useMemo(() => {
    if (!isExpanded || !description?.trim()) return null;
    return renderText(description, errorFallback);
  }, [description, isExpanded, errorFallback]);

  const renderedFullText = useMemo(() => {
    if (!isExpanded || !fullText?.trim()) return null;
    if (fullText.trim() === description?.trim()) return null;
    return renderText(fullText, errorFallback);
  }, [fullText, description, isExpanded, errorFallback]);

  if (!isExpanded || (!renderedDescription && !renderedFullText)) return null;

  return (
    <div className="mt-6 mb-4">
      {renderedDescription && (
        <>
          <SubTitle text={t('proposal description')} size="h3" />
          <div className="mt-4 rounded bg-table_row p-6 font-sfpro text-base break-words">{renderedDescription}</div>
        </>
      )}
      {renderedFullText && (
        <div className={renderedDescription ? 'mt-6' : ''}>
          <SubTitle text={t('proposal full text')} size="h3" />
          <div className="mt-4 rounded bg-table_row p-6 font-sfpro text-base break-words">{renderedFullText}</div>
        </div>
      )}
    </div>
  );
};

export default ProposalFullText;
