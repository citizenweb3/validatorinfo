'use client';

import { useTranslations } from 'next-intl';
import { FC, useCallback, useState } from 'react';

import DelegationsItem from '@/app/networks/[name]/address/[accountAddress]/passport/delegations-table/delegations-item';
import TxCursorPagination from '@/components/txs/tx-cursor-pagination';
import type { AccountDelegationRow } from '@/utils/cosmos-account-delegations';

const ITEMS_PER_PAGE = 20;

interface OwnProps {
  items: AccountDelegationRow[];
  denom: string;
  tokenPrice: number | null;
}

const DelegationsListClient: FC<OwnProps> = ({ items, denom, tokenPrice }) => {
  const t = useTranslations('AccountPage.Passport');
  const [currentPage, setCurrentPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const clampedPage = Math.min(currentPage, pageCount);
  const pageRows = items.slice((clampedPage - 1) * ITEMS_PER_PAGE, clampedPage * ITEMS_PER_PAGE);

  const handleSelect = useCallback(
    (page: number) => setCurrentPage(Math.min(Math.max(1, page), pageCount)),
    [pageCount],
  );
  const handlePrevious = useCallback(() => setCurrentPage((page) => Math.max(1, page - 1)), []);
  const handleNext = useCallback(() => setCurrentPage((page) => Math.min(pageCount, page + 1)), [pageCount]);

  return (
    <>
      <tbody>
        {pageRows.map((item) => (
          <DelegationsItem key={item.operatorAddress} item={item} denom={denom} tokenPrice={tokenPrice} />
        ))}
      </tbody>
      <tbody>
        <tr>
          <td colSpan={4} className="pt-4">
            <TxCursorPagination
              current={clampedPage}
              loadedWindows={pageCount}
              hasMore={false}
              onSelect={handleSelect}
              onPrev={handlePrevious}
              onNext={handleNext}
              prevLabel={t('delegationsPreviousPage')}
              nextLabel={t('delegationsNextPage')}
            />
          </td>
        </tr>
      </tbody>
    </>
  );
};

export default DelegationsListClient;
