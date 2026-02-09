import { FC } from 'react';

import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import AztecSignalService from '@/services/aztec-signal-service';
import SignalsTableItem from './signals-table-item';

interface OwnProps {
  chainName: string;
  payload: string;
  sort: { sortBy: string; order: SortDirection };
  perPage: number;
  currentPage: number;
}

const SignalsTableList: FC<OwnProps> = async ({ chainName, payload, sort, perPage, currentPage }) => {
  const skip = perPage * (currentPage - 1);
  const { signals, pages } = await AztecSignalService.getPayloadSignals(
    chainName,
    payload,
    skip,
    perPage,
    sort.sortBy,
    sort.order,
  );

  if (signals.length === 0) {
    return (
      <tbody>
      <tr>
        <td colSpan={4} className="pt-4 text-center text-lg">
          No signals yet
        </td>
      </tr>
      </tbody>
    );
  }

  return (
    <tbody>
    {signals.map((signal, index) => (
      <SignalsTableItem key={`${signal.signaler.address}-${signal.round}-${index}`} signal={signal} />
    ))}
    <tr>
      <td colSpan={4} className="pt-4">
        <TablePagination pageLength={pages} isScroll={false} />
      </td>
    </tr>
    </tbody>
  );
};

export default SignalsTableList;
