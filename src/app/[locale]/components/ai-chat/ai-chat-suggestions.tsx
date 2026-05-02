'use client';

import { FC, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/utils/cn';
import { PageContext } from '@/hooks/use-ai-context';

interface OwnProps {
  context: PageContext;
  onSelect: (text: string) => void;
  inline?: boolean;
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
  | 'Node count'
  | 'Most private validators'
  | 'Explain off-grid staking'
  | 'Help set up hardware'
  | 'Best bare-metal validators'
  | 'Compare ecosystems'
  | 'Decentralization leaders'
  | 'Validator infrastructure'
  | 'Staking security tips';

const SUGGESTION_MAP: Record<string, SuggestionKey[]> = {
  overview: [
    'Key metrics',
    'Top validators',
    'Recent proposals',
    'Token price',
    'Most private validators',
    'Compare ecosystems',
    'Decentralization leaders',
    'Network overview',
  ],
  validators: [
    'Top validators',
    'Most reliable',
    'Lowest commission',
    'Search validator',
    'Most private validators',
    'Best bare-metal validators',
    'Decentralization leaders',
    'Validator infrastructure',
  ],
  'validator-detail': [
    'Key metrics',
    'Compare with others',
    'Staking rewards',
    'Most reliable',
    'Best bare-metal validators',
    'Validator infrastructure',
    'Staking security tips',
    'Decentralization leaders',
  ],
  governance: [
    'Active proposals',
    'Voting stats',
    'Recent proposals',
    'Network overview',
    'Compare ecosystems',
    'Decentralization leaders',
    'Top validators',
    'Key metrics',
  ],
  'proposal-detail': [
    'Active proposals',
    'Voting stats',
    'Recent proposals',
    'Network overview',
    'Key metrics',
    'Compare ecosystems',
    'Decentralization leaders',
    'Top validators',
  ],
  tokenomics: [
    'Supply breakdown',
    'Inflation trend',
    'Token price',
    'APR comparison',
    'Staking rewards',
    'Compare ecosystems',
    'Staking security tips',
    'Network overview',
  ],
  blocks: [
    'Explain this block',
    'Key metrics',
    'Node count',
    'Network overview',
    'Top validators',
    'Validator infrastructure',
    'Most reliable',
    'Decentralization leaders',
  ],
  'block-detail': [
    'Explain this block',
    'What happened here',
    'Key metrics',
    'Node count',
    'Network overview',
    'Top validators',
    'Validator infrastructure',
    'Most reliable',
  ],
  transactions: [
    'What happened here',
    'Key metrics',
    'Network overview',
    'Top validators',
    'Node count',
    'Token price',
    'Search validator',
    'Recent proposals',
  ],
  'transaction-detail': [
    'What happened here',
    'Explain this block',
    'Key metrics',
    'Network overview',
    'Top validators',
    'Node count',
    'Token price',
    'Search validator',
  ],
  nodes: [
    'Node count',
    'Top validators',
    'Validator infrastructure',
    'Decentralization leaders',
    'Best bare-metal validators',
    'Most reliable',
    'Help set up hardware',
    'Network overview',
  ],
};

const DEFAULT_SUGGESTIONS: SuggestionKey[] = [
  'Network overview',
  'Top validators',
  'Search validator',
  'APR comparison',
  'Most private validators',
  'Explain off-grid staking',
  'Help set up hardware',
  'Compare ecosystems',
  'Staking security tips',
  'Key metrics',
  'Most reliable',
  'Lowest commission',
  'Recent proposals',
  'Token price',
  'Validator infrastructure',
  'Decentralization leaders',
  'Best bare-metal validators',
  'Staking rewards',
];

const AiChatSuggestions: FC<OwnProps> = ({ context, onSelect, inline = false }) => {
  const t = useTranslations('AiChat');
  const [suggestions, setSuggestions] = useState<SuggestionKey[]>(() =>
    (SUGGESTION_MAP[context.page] || DEFAULT_SUGGESTIONS).slice(0, 4),
  );

  useEffect(() => {
    const pool = [...(SUGGESTION_MAP[context.page] || DEFAULT_SUGGESTIONS)];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setSuggestions(pool.slice(0, 4));
  }, [context.page]);

  return (
    <div
      className={cn(
        'flex flex-wrap',
        inline
          ? 'gap-4 border-t border-bgSt px-6 py-5 sm:gap-3 sm:px-4 sm:py-3 md:gap-1.5 md:px-2.5 md:py-2'
          : 'gap-2 px-4 pb-3',
      )}
    >
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(t(suggestion))}
          className={cn(
            'border border-bgSt transition-colors',
            inline
              ? 'bg-table_row px-6 py-5 font-sfpro text-5xl font-light leading-none tracking-normal text-white/90 hover:bg-bgHover hover:text-highlight sm:px-4 sm:py-3 sm:text-3xl md:px-2 md:py-1.5 md:text-xs'
              : 'bg-bgHover px-3 py-1.5 text-xs text-white hover:border-highlight hover:text-highlight',
          )}
          aria-label={t(suggestion)}
        >
          {t(suggestion)}
        </button>
      ))}
    </div>
  );
};

export default AiChatSuggestions;
