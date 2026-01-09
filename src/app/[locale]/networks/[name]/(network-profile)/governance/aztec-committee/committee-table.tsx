import { FC } from 'react';

import EpochProgressBar from '@/app/networks/[name]/(network-profile)/governance/aztec-committee/epoch-progress-bar';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import aztecContractService from '@/services/aztec-contracts-service';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';
import CommitteeTableList
  from '@/app/networks/[name]/(network-profile)/governance/aztec-committee/committee-table-list';

interface OwnProps {
  chain: ChainWithParamsAndTokenomics;
  sort: { sortBy: string; order: SortDirection };
  perPage: number;
  currentPage?: number;
}

const CommitteeTable: FC<OwnProps> = async ({ chain, sort, perPage, currentPage }) => {
  const epochProgress = await aztecContractService.getEpochProgress(chain.name);

  return (
    <div className="mt-8">
      {epochProgress && (
        <div className="mb-12 flex w-full justify-center">
          <EpochProgressBar
            progress={epochProgress.progress}
            currentEpoch={epochProgress.currentEpoch}
            slotsIntoEpoch={epochProgress.slotsIntoEpoch}
            epochDuration={epochProgress.epochDuration}
            slotsRemaining={epochProgress.slotsRemaining}
          />
        </div>
      )}

      <table className="my-4 w-full table-auto border-collapse">
        <thead>
        <tr className="bg-table_header">
          <TableHeaderItem
            page="NetworkGovernance"
            name="Validator"
            sortField="validator"
            defaultSelected={sort.sortBy === 'validator' || !sort.sortBy}
            className="px-4 font-sfpro text-base font-normal"
          />
          <TableHeaderItem
            page="NetworkGovernance"
            name="Address"
            sortField="address"
            className="px-4 font-sfpro text-base font-normal"
          />
          <TableHeaderItem
            page="NetworkGovernance"
            name="RewardAddress"
            sortField="rewardAddress"
            className="px-4 font-sfpro text-base font-normal"
          />
        </tr>
        </thead>
        <CommitteeTableList perPage={perPage} sort={sort} currentPage={currentPage} chain={chain} />
      </table>
    </div>
  );
};

export default CommitteeTable;
