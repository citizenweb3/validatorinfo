'use client';

import { Chain, Validator } from '@prisma/client';
import debounce from 'lodash.debounce';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { SearchResult } from '@/api/search/route';
import BaseModal from '@/components/common/modal/base-modal';
import SearchList from '@/components/header/header-search/search-list';
import SearchSkeleton from '@/components/header/header-search/search-skeleton';

interface OwnProps {
}

function isItemIsValidator(item: Validator | Chain): item is Validator {
  return (item as Validator).identity !== undefined;
}

const HeaderSearch: FC<OwnProps> = () => {
  const t = useTranslations('Header');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
  };

  const fetchResults = useCallback(async (query: string) => {
    if (query.length < 3) {
      setIsOpened(false);
      setResults(null);
      setLoading(false);
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
  }, []);

  const debouncedFetchResults = useMemo(
    () =>
      debounce((query: string) => {
        void fetchResults(query);
      }, 500),
    [fetchResults],
  );

  const onSelect = () => {
    setResults(null);
    setIsOpened(false);
    setSearch('');
    setLoading(false);
    inputRef.current?.blur();
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
              router.push(`/networks/${selectedItem.name}/overview`);
            }
            onSelect();
          }
          return;
        case 'Escape':
          return setIsOpened(false);
      }
    },
    [activeIndex, results, router],
  );

  useEffect(() => {
    debouncedFetchResults(search);

    return () => debouncedFetchResults.cancel();
  }, [debouncedFetchResults, search]);

  return (
    <div className="relative">
      <label
        className="flex h-32 w-full items-center gap-4 border border-bgSt bg-background pl-8 pr-8 shadow-button focus-within:outline-none focus-within:ring-0 sm:h-20 sm:gap-3 sm:pl-5 sm:pr-5 md:h-8 md:gap-3 md:pl-3 md:pr-5"
      >
        <input
          ref={inputRef}
          value={search}
          className="min-w-0 flex-1 appearance-none bg-transparent text-right font-sfpro text-5xl leading-none text-white/70 outline-none ring-0 placeholder:text-white/70 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 sm:text-3xl md:text-base"
          onChange={handleChange}
          onFocus={() => results && setIsOpened(true)}
          onKeyDown={handleKeyDown}
          placeholder={t('Search')}
          aria-label={t('Search for a validator, pool, tx, address, network, etc')}
        />
        <span className="h-16 shrink-0 border-l border-primary sm:h-10 md:h-4" aria-hidden />
        <span className="h-16 w-16 shrink-0 bg-search bg-contain bg-center bg-no-repeat sm:h-10 sm:w-10 md:h-6 md:w-6"
              aria-hidden />
      </label>
      {isOpened && (
        <div className="absolute left-0 right-0 top-full z-40">
          <BaseModal
            opened={true}
            onClose={() => setIsOpened(false)}
            className="mt-1 w-full"
            closeClassName="h-9 w-9"
            contentClassName="pt-4 md:pt-0"
          >
            <div className="space-y-6" onClick={() => setIsOpened(false)}>
              {loading && <SearchSkeleton />}
              {!results?.validators.length && !results?.chains.length && !results?.tokens.length && (
                <div className="mt-4 text-center text-lg">{t('search.noResults')}</div>
              )}
            </div>
            <SearchList results={results} activeIndex={activeIndex} onSelect={onSelect} />
          </BaseModal>
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
