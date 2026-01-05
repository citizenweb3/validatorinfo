import logger from '@/logger';
import { getChainParams } from '@/server/tools/chains/params';
import { jsonRpcClientWithFailover } from '@/server/utils/json-rpc-client';

const { logError, logInfo } = logger('get-l1-contract-addresses');

export interface L1ContractAddresses {
  registryAddress: string;
  rollupAddress: string;
  inboxAddress: string;
  outboxAddress: string;
  feeJuiceAddress: string;
  stakingAssetAddress: string;
  feeJuicePortalAddress: string;
  coinIssuerAddress: string;
  rewardDistributorAddress: string;
  governanceProposerAddress: string;
  governanceAddress: string;
  gseAddress: string;
}

const getL1ContractAddresses = async (chainName: string): Promise<L1ContractAddresses | null> => {
  try {
    const chainParams = getChainParams(chainName);
    const rpcUrls = chainParams.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

    if (!rpcUrls.length) {
      logError(`${chainName}: No RPC URLs found`);
      return null;
    }

    logInfo(`${chainName}: Fetching L1 contract addresses`);

    const result = await jsonRpcClientWithFailover<L1ContractAddresses>(
      rpcUrls,
      'node_getL1ContractAddresses',
      [],
      `${chainName}-get-l1-contract-addresses`,
      30000,
      2,
    );

    logInfo(`${chainName}: Successfully fetched L1 contract addresses`);
    return result;
  } catch (e: any) {
    logError(`${chainName}: Failed to fetch L1 contract addresses - ${e.message}`);
    return null;
  }
};

export default getL1ContractAddresses;
