import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import CommitteeTableItem from '@/app/networks/[name]/(network-profile)/governance/aztec-committee/committee-table-item';
import EpochProgressBar from '@/app/networks/[name]/(network-profile)/governance/aztec-committee/epoch-progress-bar';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import aztecContractService from '@/services/aztec-contracts-service';
import chainService, { ChainWithParamsAndTokenomics } from '@/services/chain-service';

interface OwnProps {
  chain: ChainWithParamsAndTokenomics;
  sort: { sortBy: string; order: SortDirection };
}

const CommitteeTable: FC<OwnProps> = async ({ chain, sort }) => {
  const t = await getTranslations('NetworkGovernance');
  const committeeMembers = await chainService.getCommitteeMembers(chain.id, sort.sortBy, sort.order);
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

      {committeeMembers.length === 0 ? (
        <div className="py-8 text-center">{t('no committee members')}</div>
      ) : (
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
          <tbody>
            {committeeMembers.map((member) => (
              <CommitteeTableItem key={member.operatorAddress} member={member} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CommitteeTable;
