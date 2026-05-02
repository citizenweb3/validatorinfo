'use client';

import { useTranslations } from 'next-intl';

const suggestionKeys = [
  'bestValidator',
  'maxYield',
  'explainProposal',
  'offGridHelp',
] as const;

interface HomeAiSuggestionsProps {
  onSelect: (text: string) => void;
}

const HomeAiSuggestions = ({ onSelect }: HomeAiSuggestionsProps) => {
  const t = useTranslations('HomePage.quickTools');

  return (
    <div className="flex flex-wrap gap-4 border-t border-bgSt px-6 py-5 sm:gap-3 sm:px-4 sm:py-3 md:gap-2.5 md:px-2.5 md:py-2.5">
      {suggestionKeys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(t(key))}
          className="border border-bgSt bg-table_row px-6 py-5 font-sfpro text-5xl font-light leading-none tracking-normal text-white/90 transition-colors hover:bg-bgHover hover:text-highlight sm:px-4 sm:py-3 sm:text-3xl md:px-3 md:py-2 md:text-base"
          aria-label={t(key)}
        >
          {t(key)}
        </button>
      ))}
    </div>
  );
};

export default HomeAiSuggestions;
