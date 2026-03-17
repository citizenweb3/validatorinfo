import { FC } from 'react';

import VotingHistoryItem from '@/app/networks/[name]/address/[accountAddress]/governance/voting-history/voting-history-item';
import { votingHistoryExample } from '@/app/networks/[name]/address/[accountAddress]/governance/votingHistoryExample';

interface OwnProps {
  chainName: string;
}

const VotingHistoryList: FC<OwnProps> = async ({ chainName }) => {
  return (
    <tbody>
      {votingHistoryExample.map((item) => (
        <VotingHistoryItem key={item.proposalId} item={item} chainName={chainName} />
      ))}
    </tbody>
  );
};

export default VotingHistoryList;
