'use client';

import { Chain, Validator } from '@prisma/client';
import debounce from 'lodash.debounce';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { usePopper } from 'react-popper';

import { SearchResult } from '@/api/search/route';
import BaseModal from '@/components/common/modal/base-modal';
import Tooltip from '@/components/common/tooltip';
import SearchList from '@/components/header/header-search/search-list';
import SearchSkeleton from '@/components/header/header-search/search-skeleton';
import useIsMobile from '@/hooks/useIsMobile';

interface OwnProps {}

function isItemIsValidator(item: Validator | Chain): item is Validator {
  return (item as Validator).identity !== undefined;
}

const HeaderSearch: FC<OwnProps> = () => {
  const t = useTranslations('Header');
  const router = useRouter();
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const { styles, attributes, update } = usePopper(referenceElement, popperElement, { placement: 'bottom' });
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const isMobile = useIsMobile();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    const coef = isMobile ? 3 : 0.7;
    e.target.style.width = ((value.length || 1) * coef) + 'rem';
    update && update();
  };

  const fetchResults = async (query: string) => {
    if (query.length < 3) {
      setIsOpened(false);
      setResults(null);
      return;
    }

    setIsOpened(true);
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${query}`);
      const data = (await response.json()) as SearchResult;
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchResults = debounce((searchTerm: string) => {
    fetchResults(searchTerm);
  }, 500);

  const onSelect = () => {
    setResults(null);
    setIsOpened(false);
    setSearch('');
    setLoading(false);
    if (referenceElement) {
      referenceElement.style.width = '0.7rem';
      referenceElement.blur();
    }
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (!results) return;

      const allItems: (Chain | Validator)[] = [
        ...(results.validators || []),
        ...(results.chains || []),
        ...(results.tokens || []),
      ];

      switch (event.key) {
        case 'ArrowDown':
          return setActiveIndex((prevIndex) => (prevIndex < allItems.length - 1 ? prevIndex + 1 : 0));
        case 'ArrowUp':
          return setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : allItems.length - 1));
        case 'Enter':
          if (activeIndex !== -1 && allItems[activeIndex]) {
            const selectedItem = allItems[activeIndex];
            if (isItemIsValidator(selectedItem)) {
              router.push(`/validators/${selectedItem.id}/networks`);
            } else {
              router.push(`/networks/${selectedItem.id}/overview`);
            }
            onSelect();
          }
          return;
        case 'Escape':
          return setIsOpened(false);
      }
    },
    [results, activeIndex],
  );

  useEffect(() => {
    debouncedFetchResults(search);
    return debouncedFetchResults.cancel;
  }, [search]);

  return (
    <label className="sm:-mt-6 -mt-10 ml-4 flex h-6 flex-row items-center justify-center">
      <div className="relative flex">
        {!search && (
          <Tooltip className="md:block hidden" noWrap tooltip={t('Search for a validator, pool, tx, address, network, etc')}>
            <div className={`md:h-6 md:w-6 sm:h-8 sm:w-8 h-12 w-12 cursor-text bg-search bg-contain peer-focus:hidden hover:bg-search_h`} />
          </Tooltip>
        )}
        <div>
          <input
            value={search}
            ref={setReferenceElement}
            style={{ width: '1rem' }}
            className="w-min-0 peer max-w-[50vw] bg-transparent text-center md:text-base sm:text-2xl text-5xl text-highlight focus:outline-0 focus:ring-0"
            onChange={handleChange}
            onFocus={() => results && setIsOpened(true)}
            onKeyDown={handleKeyDown}
          />
          {isOpened && (
            <div ref={setPopperElement} style={styles.popper} {...attributes.popper} className="z-40 md:w-[30rem] sm:w-[40rem] w-[50rem]">
              <BaseModal opened={true} onClose={() => setIsOpened(false)} className="mt-1 md:w-[30rem] sm:w-[40rem] w-[50rem]">
                <div className="space-y-6" onClick={() => setIsOpened(false)}>
                  {loading && <SearchSkeleton />}
                  {!results?.validators.length && !results?.chains.length && !results?.tokens.length && (
                    <div className="mt-4 text-center md:text-lg sm:text-2xl text-4xl">{t('search.noResults')}</div>
                  )}
                </div>
                <SearchList results={results} activeIndex={activeIndex} onSelect={onSelect} />
              </BaseModal>
            </div>
          )}
        </div>
      </div>
    </label>
  );
};

export default HeaderSearch;
