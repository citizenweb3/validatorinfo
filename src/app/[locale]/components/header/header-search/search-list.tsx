import { useTranslations } from 'next-intl';
import { FC } from 'react';

import { SearchResult } from '@/api/search/route';
import SearchItem from '@/components/header/header-search/search-item';
import icons from '@/components/icons';

interface OwnProps {
  results: SearchResult | null;
  activeIndex: number;
  onSelect: () => void;
}

const SearchList: FC<OwnProps> = ({ results, activeIndex, onSelect }) => {
  const t = useTranslations('Header');

  return (
    <div className="space-y-4 text-sm">
      {!!results?.validators.length && (
        <div>
          <div className="md:text-lg sm:text-2xl text-4xl text-highlight">{t('search.Validators')}</div>
          <div>
            {results?.validators.map((validator, index) => (
              <SearchItem
                key={validator.id}
                name={validator.moniker}
                link={`/validators/${validator.id}/networks`}
                icon={validator.url ?? icons.AvatarIcon}
                isSelected={activeIndex === index}
                onClick={onSelect}
              />
            ))}
          </div>
        </div>
      )}
      {!!results?.chains.length && (
        <div>
          <div className="md:text-lg sm:text-2xl text-4xl text-highlight">{t('search.Networks')}</div>
          <div>
            {results?.chains.map((chain, index) => (
              <SearchItem
                key={chain.id}
                name={chain.prettyName}
                link={`/networks/${chain.name}/overview`}
                icon={chain.logoUrl ?? icons.AvatarIcon}
                isSelected={activeIndex === (results.validators.length ?? 0) + index}
                onClick={onSelect}
              />
            ))}
          </div>
        </div>
      )}
      {!!results?.tokens.length && (
        <div>
          <div className="md:text-lg sm:text-2xl text-4xl text-highlight">{t('search.Tokens')}</div>
          <div>
            {results?.tokens.map((chain, index) => (
              <SearchItem
                key={chain.id}
                name={chain.params?.denom ?? ''}
                link={`/networks/${chain.name}/tokenomics`}
                icon={chain.logoUrl ?? icons.AvatarIcon}
                isSelected={activeIndex === (results.validators.length ?? 0) + (results.chains.length ?? 0) + index}
                onClick={onSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchList;
