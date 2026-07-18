import AccountGovernanceService from '@/services/account-governance-service';
import { isGovVotesChainSupported } from '@/utils/governance-supported-chains';

import AccountGovernanceClient from './account-governance-client';
import { accountVotesExample } from './account-votes-example';

type AccountGovernanceContentProps = {
  chainName: string;
  accountAddress: string;
};

const AccountGovernanceContent = async ({ chainName, accountAddress }: AccountGovernanceContentProps) => {
  if (!isGovVotesChainSupported(chainName)) {
    return (
      <AccountGovernanceClient
        chainName={chainName}
        accountAddress={accountAddress}
        initial={accountVotesExample}
        isMock
      />
    );
  }

  const result = await AccountGovernanceService.getAccountVotingHistory(chainName, accountAddress);
  return (
    <AccountGovernanceClient
      chainName={chainName}
      accountAddress={accountAddress}
      initial={result.status === 'ready' ? result : null}
      isMock={false}
    />
  );
};

export default AccountGovernanceContent;
