import { FC } from 'react';

import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import chainService, { CommitteeMember } from '@/services/chain-service';
import CommitteeTableItem from '@/app/networks/[name]/(network-profile)/governance/aztec-committee/committee-table-item';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  chain: ChainWithParamsAndTokenomics;
}

const CommitteeTableList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1, chain }) => {
  const skip = perPage * (currentPage - 1);
  const { members, pages } = await chainService.getCommitteeMembers(
    chain.id,
    sort.sortBy,
    sort.order,
    skip,
    perPage,
  );

  return (
    <>
      {members.length > 0 ? (
        <tbody>
          {members.map((member) => (
            <CommitteeTableItem key={member.operatorAddress} member={member} />
          ))}
          <tr>
            <td colSpan={5} className="pt-4">
              <TablePagination pageLength={pages} tableId="committee" />
            </td>
          </tr>
        </tbody>
      ) : (
        <tbody>
          <tr>
            <td className="text-center text-lg pt-4">-</td>
            <td className="text-center text-lg pt-4">-</td>
            <td className="text-center text-lg pt-4">-</td>
          </tr>
        </tbody>
      )}
    </>
  );
};

export default CommitteeTableList;