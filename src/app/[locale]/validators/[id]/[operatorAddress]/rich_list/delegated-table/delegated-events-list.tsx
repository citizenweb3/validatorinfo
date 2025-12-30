import { FC } from 'react';

import DelegatedEventsItem from '@/app/validators/[id]/[operatorAddress]/rich_list/delegated-table/delegated-events-items';
import { delegates } from '@/app/validators/[id]/[operatorAddress]/rich_list/delegated-table/nodeDelegatesExample';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import aztecDbService from '@/services/aztec-db-service';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  chainName: string;
  operatorAddress: string;
}

const isAztecChain = (chainName: string): boolean => {
  return chainName === 'aztec' || chainName === 'aztec-testnet';
};

const DelegatedEventsList: FC<OwnProps> = async ({ chainName, sort, perPage, currentPage = 1, operatorAddress }) => {
  const pages = 1;

  if (isAztecChain(chainName)) {
    const stakedEvent = await aztecDbService.getStakedEventByAttester(operatorAddress);

    return (
      <tbody>
        {stakedEvent ? (
          <DelegatedEventsItem key={stakedEvent.txHash} item={stakedEvent} chainName={chainName} />
        ) : (
          <tr>
            <td colSpan={5} className="py-8 text-center font-sfpro text-lg text-highlight">
              No staking transaction found
            </td>
          </tr>
        )}
        <tr>
          <td colSpan={5} className="pt-4">
            <TablePagination pageLength={pages} />
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {delegates.map((item) => (
        <DelegatedEventsItem key={item.txHash} item={item} chainName={chainName} />
      ))}
      <tr>
        <td colSpan={5} className="pt-4">
          <TablePagination pageLength={pages} />
        </td>
      </tr>
    </tbody>
  );
};

export default DelegatedEventsList;
