'use client';

import { FC, useMemo } from 'react';

import parseMarkdown from '@/utils/parse-ai-markdown';
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

interface OwnProps {
  fullText: string | null;
}

const ProposalFullText: FC<OwnProps> = ({ fullText }) => {
  const { isExpanded } = useProposalText();
  const renderedContent = useMemo(() => {
    if (!isExpanded || !fullText) return null;
    try {
      const text = containsHtml(fullText) ? stripHtmlTags(fullText) : fullText;
      return parseMarkdown(text);
    } catch {
      return <div className="text-gray-400">Unable to render proposal text</div>;
    }
  }, [fullText, isExpanded]);

  if (!renderedContent) return null;

  return (
    <div className="mt-6 mb-4">
      <div className="mt-4 rounded bg-table_row p-6 font-sfpro text-base break-words">{renderedContent}</div>
    </div>
  );
};

export default ProposalFullText;
