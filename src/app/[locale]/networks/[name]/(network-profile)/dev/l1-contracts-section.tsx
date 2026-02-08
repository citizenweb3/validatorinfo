import { FC, ReactElement } from 'react';
import Link from 'next/link';
import SubTitle from '@/components/common/sub-title';
import CopyButton from '@/components/common/copy-button';
import { L1ContractAddresses } from '@/server/tools/chains/aztec/utils/get-l1-contract-addresses';

interface OwnProps {
  contractsJson: string;
  chainName: string;
}

const L1ContractsSection: FC<OwnProps> = ({ contractsJson, chainName }): ReactElement | null => {
  let l1Contracts: L1ContractAddresses | null = null;

  try {
    l1Contracts = JSON.parse(contractsJson);
  } catch (e) {
    console.error('Failed to parse L1 contract addresses:', e);
    return null;
  }

  if (!l1Contracts) {
    return null;
  }

  const contractNames: Record<string, string> = {
    registryAddress: 'Registry',
    rollupAddress: 'Rollup',
    inboxAddress: 'Inbox',
    outboxAddress: 'Outbox',
    feeJuiceAddress: 'Fee Juice',
    stakingAssetAddress: 'Staking Asset',
    feeJuicePortalAddress: 'Fee Juice Portal',
    coinIssuerAddress: 'Coin Issuer',
    rewardDistributorAddress: 'Reward Distributor',
    governanceProposerAddress: 'Governance Proposer',
    governanceAddress: 'Governance',
    gseAddress: 'GSE',
  };

  const isTestnet = chainName === 'aztec-testnet';
  const etherscanBaseUrl = isTestnet ? 'https://sepolia.etherscan.io' : 'https://etherscan.io';

  return (
    <>
      <div className="mt-12">
        <SubTitle text="L1 Contracts" />
      </div>
      {Object.entries(l1Contracts).map(([key, address]) => (
        <div key={key} className="mt-4 flex w-full bg-table_row hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {contractNames[key] || key}
          </div>
          <div className="flex w-3/4 items-center gap-2 border-b border-bgSt py-6 pl-6">
            <Link
              href={`${etherscanBaseUrl}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-handjet text-lg underline underline-offset-4 hover:text-highlight"
            >
              {address}
            </Link>
            <CopyButton value={address} size="md" />
          </div>
        </div>
      ))}
    </>
  );
};

export default L1ContractsSection;
