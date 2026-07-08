import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import DelegatedEventsItem from '@/app/validators/[id]/[operatorAddress]/rich_list/delegated-table/delegated-events-items';
import { delegates } from '@/app/validators/[id]/[operatorAddress]/rich_list/delegated-table/nodeDelegatesExample';
import BaseTable from '@/components/common/table/base-table';
import DelegateTableClient from '@/components/delegations/delegate-table-client';
import DelegateTableHead from '@/components/delegations/delegate-table-head';
import { decodeDelegationCursorToken } from '@/components/delegations/delegation-cursor-token';
import TablePagination from '@/components/common/table/table-pagination';
import aztecDbService from '@/services/aztec-db-service';
import DelegationService from '@/services/delegation-service';
import priceService from '@/services/price-service';
import { PagesProps } from '@/types';

const PER_PAGE = 20;

interface OwnProps extends PagesProps {
  chainName: string;
  operatorAddress: string;
  cursorToken?: string;
  windowIndex: number;
}

const isAztecChain = (chainName: string): boolean => {
  return chainName === 'aztec' || chainName === 'aztec-testnet';
};

const DelegatedEventsList: FC<OwnProps> = async ({ page, chainName, operatorAddress, cursorToken, windowIndex }) => {
  const pages = 1;
  const normalizedChainName = chainName.toLowerCase();

  if (normalizedChainName === 'cosmoshub' || normalizedChainName === 'atomone') {
    const cursor = decodeDelegationCursorToken(cursorToken);
    const [initial, price] = await Promise.all([
      DelegationService.getDelegationsBatch(chainName, operatorAddress, cursor),
      priceService.getLatestPriceByChainName(normalizedChainName),
    ]);
    const windows = Math.max(1, Math.ceil(initial.rows.length / PER_PAGE));
    const clampedWindow = Math.min(Math.max(0, windowIndex), windows - 1);

    return (
      <DelegateTableClient
        validator={operatorAddress}
        chainName={chainName}
        price={price}
        initialCursor={cursor ?? null}
        initialWindow={clampedWindow}
        initial={initial}
      >
        <DelegateTableHead page={page} />
      </DelegateTableClient>
    );
  }

  if (isAztecChain(chainName)) {
    const t = await getTranslations('RichListPage');
    const stakedEvent = await aztecDbService.getStakedEventByAttester(operatorAddress, chainName);

    return (
      <BaseTable>
        <DelegateTableHead page={page} />
        <tbody>
          {stakedEvent ? (
            <DelegatedEventsItem key={stakedEvent.txHash} item={stakedEvent} chainName={chainName} />
          ) : (
            <tr>
              <td colSpan={5} className="py-8 text-center font-sfpro text-lg text-highlight">
                {t('noStakingTransaction')}
              </td>
            </tr>
          )}
          <tr>
            <td colSpan={5} className="pt-4">
              <TablePagination pageLength={pages} />
            </td>
          </tr>
        </tbody>
      </BaseTable>
    );
  }

  return (
    <BaseTable>
      <DelegateTableHead page={page} />
      <tbody>
        {delegates.map((item, index) => (
          <DelegatedEventsItem key={`${item.txHash}-${index}`} item={item} chainName={chainName} />
        ))}
        <tr>
          <td colSpan={5} className="pt-4">
            <TablePagination pageLength={pages} />
          </td>
        </tr>
      </tbody>
    </BaseTable>
  );
};

export default DelegatedEventsList;
