'use client';

import { FC, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { PageContext } from '@/hooks/use-ai-context';

interface OwnProps {
  context: PageContext;
  onSelect: (text: string) => void;
}

type SuggestionKey =
  | 'Key metrics'
  | 'Compare with others'
  | 'Top validators'
  | 'Most reliable'
  | 'Active proposals'
  | 'Voting stats'
  | 'Supply breakdown'
  | 'Inflation trend'
  | 'Explain this block'
  | 'What happened here'
  | 'Network overview'
  | 'Staking rewards'
  | 'Lowest commission'
  | 'Recent proposals'
  | 'Token price'
  | 'Search validator'
  | 'APR comparison'
  | 'Node count';

const SUGGESTION_MAP: Record<string, SuggestionKey[]> = {
  overview: ['Key metrics', 'Top validators', 'Recent proposals', 'Token price'],
  validators: ['Top validators', 'Most reliable', 'Lowest commission', 'Search validator'],
  'validator-detail': ['Key metrics', 'Compare with others', 'Staking rewards'],
  governance: ['Active proposals', 'Voting stats', 'Recent proposals'],
  'proposal-detail': ['Active proposals', 'Voting stats'],
  tokenomics: ['Supply breakdown', 'Inflation trend', 'Token price', 'APR comparison'],
  blocks: ['Explain this block', 'Key metrics', 'Node count'],
  'block-detail': ['Explain this block', 'What happened here'],
  transactions: ['What happened here', 'Key metrics'],
  'transaction-detail': ['What happened here', 'Explain this block'],
  nodes: ['Node count', 'Top validators', 'Key metrics'],
};

const DEFAULT_SUGGESTIONS: SuggestionKey[] = ['Network overview', 'Top validators', 'Search validator', 'APR comparison'];

const AiChatSuggestions: FC<OwnProps> = ({ context, onSelect }) => {
  const t = useTranslations('AiChat');

  const suggestions = useMemo(() => {
    return SUGGESTION_MAP[context.page] || DEFAULT_SUGGESTIONS;
  }, [context.page]);

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-3">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(t(suggestion))}
          className="border border-bgSt bg-bgHover px-3 py-1.5 text-xs text-white transition-colors hover:border-highlight hover:text-highlight"
          aria-label={t(suggestion)}
        >
          {t(suggestion)}
        </button>
      ))}
    </div>
  );
};

export default AiChatSuggestions;
