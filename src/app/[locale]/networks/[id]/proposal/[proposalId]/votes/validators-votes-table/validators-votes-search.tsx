'use client';

import { ChangeEvent, FC, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { usePopper } from 'react-popper';
import debounce from 'lodash.debounce';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import Tooltip from '@/components/common/tooltip';
import BaseModal from '@/components/common/modal/base-modal';
import SearchSkeleton from '@/components/header/header-search/search-skeleton';
import SearchItem from '@/components/header/header-search/search-item';
import icons from '@/components/icons';
import useIsMobile from '@/hooks/useIsMobile';

export interface VoterSearchResult {
  validators: {
    id: number;
    moniker: string;
    url: string | null;
    vote: string;
  }[];
}

interface OwnProps {
  chainId: number;
  proposalId: string;
}

const ValidatorsVotesSearch: FC<OwnProps> = ({ chainId, proposalId }) => {
  const t = useTranslations('ProposalPage');
  const router = useRouter();
  const [referenceEl, setReferenceEl] = useState<HTMLDivElement | null>(null);
  const [popperEl, setPopperEl] = useState<HTMLDivElement | null>(null);
  const { styles, attributes, update } = usePopper(referenceEl, popperEl, { placement: 'bottom' });

  const [search, setSearch] = useState('');
  const [results, setResults] = useState<VoterSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const isMobile = useIsMobile();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);

    const coef = isMobile ? 3 : 0.7;
    e.target.style.width = ((val.length || 1) * coef) + 'rem';
    update && update();
  };

  const fetchResults = async (q: string) => {
    if (q.length < 2) {
      setIsOpened(false);
      setResults(null);
      return;
    }
    setIsOpened(true);
    setLoading(true);
    try {
      const resp = await fetch(
        `/api/proposal_validators_votes?chainId=${chainId}&proposalId=${proposalId}&q=${encodeURIComponent(q)}`,
      );
      const data = (await resp.json()) as VoterSearchResult;
      setResults(data);
    } catch (err) {
      console.error('search voters error', err);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = debounce(fetchResults, 400);

  useEffect(() => {
    debouncedFetch(search);
    return debouncedFetch.cancel;
  }, [search]);

  const onSelect = () => {
    setSearch('');
    setIsOpened(false);
    setActiveIndex(-1);
    setResults(null);
    setLoading(false);
    if (referenceEl) {
      referenceEl.style.width = '0.7rem';
      referenceEl.blur();
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!results) return;

      const items = results.validators;
      if (items.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          return setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
        case 'ArrowUp':
          return setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
        case 'Enter':
          if (activeIndex !== -1) {
            const v = items[activeIndex];
            router.push(`?search=${v.id}`);
            onSelect();
          }
          return;
        case 'Escape':
          return setIsOpened(false);
      }
    },
    [results, activeIndex],
  );

  return (
    <label className="-mt-6 flex h-6 flex-row">
      <div className="relative flex">
        {!search && (
          <Tooltip tooltip={t('search by validator name')}>
            <div className="h-6 w-6 cursor-text bg-search bg-contain peer-focus:hidden hover:bg-search_h" />
          </Tooltip>
        )}
        <input
          ref={setReferenceEl}
          value={search}
          style={{ width: '1rem' }}
          className="ml-2 w-min-0 peer bg-transparent text-base text-highlight focus:outline-0"
          onChange={handleChange}
          onFocus={() => results && setIsOpened(true)}
          onKeyDown={handleKeyDown}
        />

        {isOpened && (
          <div ref={setPopperEl} style={styles.popper} {...attributes.popper} className="z-40 w-96">
            <BaseModal opened onClose={() => setIsOpened(false)} className="mt-1 w-96">
              {loading && <SearchSkeleton />}
              {!loading && results && results.validators.length === 0 && (
                <div className="mt-4 text-center">No results</div>
              )}
              {results && results.validators.length > 0 && (
                <div className="space-y-4 text-sm">
                  <div>
                    {results.validators.map((v, idx) => (
                      <SearchItem
                        key={v.id}
                        name={`${v.moniker}`}
                        link={`?search=${v.id}`}
                        icon={v.url ?? icons.AvatarIcon}
                        isSelected={activeIndex === idx}
                        onClick={onSelect}
                        isScroll={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </BaseModal>
          </div>
        )}
      </div>
    </label>
  );
};

export default ValidatorsVotesSearch;
