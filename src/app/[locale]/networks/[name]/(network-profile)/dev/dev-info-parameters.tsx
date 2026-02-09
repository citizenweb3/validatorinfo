import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import CopyButton from '@/components/common/copy-button';
import { ChainWithParams } from '@/services/chain-service';
import { L1ContractAddresses } from '@/server/tools/chains/aztec/utils/get-l1-contract-addresses';
import L1ContractsCollapsible from './l1-contracts-collapsible';

interface OwnProps {
  chain: ChainWithParams | null;
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

const parseL1Contracts = (chain: ChainWithParams | null): [string, string][] | null => {
  const isAztecChain = chain?.name === 'aztec' || chain?.name === 'aztec-testnet';
  if (!isAztecChain || !chain?.params || !('l1ContractsAddresses' in chain.params) || !chain.params.l1ContractsAddresses) {
    return null;
  }
  try {
    const parsed = JSON.parse(chain.params.l1ContractsAddresses as string) as L1ContractAddresses;
    return Object.entries(parsed);
  } catch {
    return null;
  }
};

const DevInfoParameters: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkDevInfo');

  const l1Contracts = parseL1Contracts(chain);
  const etherscanBaseUrl = chain?.name === 'aztec-testnet'
    ? 'https://sepolia.etherscan.io'
    : 'https://etherscan.io';

  return (
    <div>
      {chain?.params?.bech32Prefix && (
        <div className="mt-4 flex w-full bg-table_row hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {t('bech32 prefix')}
          </div>
          <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
            {chain.params.bech32Prefix}
            <CopyButton value={chain.params.bech32Prefix} size="md" />
          </div>
        </div>
      )}

      {chain?.params?.daemonName && (
        <div className="mt-4 flex w-full bg-table_row hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {t('daemon name')}
          </div>
          <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
            {chain.params.daemonName}
            <CopyButton value={chain.params.daemonName} size="md" />
          </div>
        </div>
      )}

      {chain?.params?.nodeHome && (
        <div className="mt-4 flex w-full bg-table_row hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {t('node home')}
          </div>
          <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
            {chain.params.nodeHome}
            <CopyButton value={chain.params.nodeHome} size="md" />
          </div>
        </div>
      )}

      {chain?.params?.coinType !== undefined && (
        <div className="mt-4 flex w-full bg-table_row hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {t('slip44')}
          </div>
          <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 font-handjet text-lg hover:text-highlight">
            {chain.params.coinType}
            <CopyButton value={String(chain.params.coinType)} size="md" />
          </div>
        </div>
      )}

      {chain?.params?.keyAlgos && (
        <div className="mt-4 flex w-full bg-table_row hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {t('key algosz')}
          </div>
          <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 font-handjet text-lg hover:text-highlight">
            {JSON.parse(chain.params.keyAlgos)[0]}
            <CopyButton value={JSON.parse(chain.params.keyAlgos)[0]} size="md" />
          </div>
        </div>
      )}

      {chain?.params?.genesis && (
        <div className="mt-4 flex w-full bg-table_row hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {t('genesis url')}
          </div>
          <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base underline underline-offset-4 hover:text-highlight">
            {JSON.parse(chain.params.genesis)}
            <CopyButton value={JSON.parse(chain.params.genesis)} size="md" />
          </div>
        </div>
      )}

      {chain?.chainId && (
        <div className="mt-4 flex w-full bg-table_row hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {t('chain id')}
          </div>
          <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
            {chain.chainId}
            <CopyButton value={String(chain.chainId)} size="md" />
          </div>
        </div>
      )}

      {chain?.params?.denom && (
        <div className="mt-4 flex w-full bg-table_row hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {t('denom')}
          </div>
          <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
            {chain.params.denom}
            <CopyButton value={String(chain.params.denom)} size="md" />
          </div>
        </div>
      )}

      {l1Contracts && (
        <L1ContractsCollapsible
          title={t('l1 contracts')}
          contracts={l1Contracts.map(([key, address]) => ({
            key,
            name: contractNames[key] || key,
            address,
          }))}
          etherscanBaseUrl={etherscanBaseUrl}
        />
      )}
    </div>
  );
};

export default DevInfoParameters;
