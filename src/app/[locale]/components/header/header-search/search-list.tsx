import { useTranslations } from 'next-intl';
import { FC } from 'react';

import { SearchResult } from '@/api/search/route';
import SearchItem from '@/components/header/header-search/search-item';

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
          <div className="text-lg text-highlight">{t('search.Validators')}</div>
          <div>
            {results?.validators.map((validator, index) => (
              <SearchItem
                name={validator.moniker}
                link={`/validators/${validator.id}/networks`}
                icon={validator.url?.indexOf('http') === 0 ? validator.url : `https://${validator.url}`}
                isSelected={activeIndex === index}
                onClick={onSelect}
              />
            ))}
          </div>
        </div>
      )}
      {!!results?.chains.length && (
        <div>
          <div className="text-lg text-highlight">{t('search.Networks')}</div>
          <div>
            {results?.chains.map((chain, index) => (
              <SearchItem
                name={chain.prettyName}
                link={`/networks/${chain.id}/overview`}
                icon={chain.logoUrl?.indexOf('http') === 0 ? chain.logoUrl : `https://${chain.logoUrl}`}
                isSelected={activeIndex === (results.validators.length ?? 0) + index}
                onClick={onSelect}
              />
            ))}
          </div>
        </div>
      )}
      {!!results?.tokens.length && (
        <div>
          <div className="text-lg text-highlight">{t('search.Tokens')}</div>
          <div>
            {results?.tokens.map((chain, index) => (
              <SearchItem
                name={chain.denom}
                link={`/networks/${chain.name}`}
                icon={chain.logoUrl?.indexOf('http') === 0 ? chain.logoUrl : `https://${chain.logoUrl}`}
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
