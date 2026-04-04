import GOVERNANCE_ABI_AZTEC_TESTNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec-testnent/GOVERNANCE_ABI.json';
import GOVERNANCE_PROPOSER_ABI_AZTEC_TESTNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec-testnent/GOVERNANCE_PROPOSER_ABI.json';
import GSE_ABI_AZTEC_TESTNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec-testnent/GSE_ABI.json';
import STAKING_REGISTRY_AZTEC_TESTNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec-testnent/STAKING_REGISTRY_ABI.json';
import TOKEN_ABI_AZTEC_TESTNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec-testnent/TOKEN_ABI.json';
import GOVERNANCE_ABI_AZTEC_MAINNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec/GOVERNANCE_ABI.json';
import GOVERNANCE_PROPOSER_ABI_AZTEC_MAINNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec/GOVERNANCE_PROPOSER_ABI.json';
import GSE_ABI_AZTEC_MAINNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec/GSE_ABI.json';
import ROLLUP_AZTEC_MAINNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec/ROLLUP_ABI.json';
import ROLLUP_ABI_V2_AZTEC_MAINNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec/ROLLUP_ABI_V2.json';
import ROLLUP_AZTEC_TESTNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec-testnent/ROLLUP_ABI.json';
import STAKING_REGISTRY_AZTEC_MAINNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec/STAKING_REGISTRY_ABI.json';
import TOKEN_ABI_AZTEC_MAINNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec/TOKEN_ABI.json';
import db from '@/db';
import logger from '@/logger';
import { L1ContractAddresses } from '@/server/tools/chains/aztec/utils/get-l1-contract-addresses';
import { aztecMainnet, aztecTestnet } from '@/server/tools/chains/aztec/utils/contracts/l1-contracts';

const { logWarn, logError } = logger('contracts-config');

export type AztecChainName = keyof typeof contracts;

export const isAztecChainName = (chainName: string): chainName is AztecChainName => {
  return chainName === 'aztec' || chainName === 'aztec-testnet';
};

export const getL1: Record<string, string> = {
  'aztec-testnet': 'ethereum-sepolia',
  aztec: 'ethereum',
};

export interface RollupVersion {
  fromBlock: number;
  toBlock: number;
  address: string;
  abi: any;
}

export const contracts = {
  aztec: aztecMainnet,
  'aztec-testnet': aztecTestnet,
};

export const rollupVersions: Record<AztecChainName, RollupVersion[]> = {
  aztec: [
    {
      fromBlock: 21550000,
      toBlock: 24763000,
      address: '0x603bb2c05d474794ea97805e8de69bccfb3bca12',
      abi: ROLLUP_ABI_V2_AZTEC_MAINNET,
    },
    {
      fromBlock: 24763000,
      toBlock: Infinity,
      address: '0xae2001f7e21d5ecabf6234e9fdd1e76f50f74962',
      abi: ROLLUP_AZTEC_MAINNET,
    },
  ],
  'aztec-testnet': [
    {
      fromBlock: 7300000,
      toBlock: Infinity,
      address: '0xf6d0d42ace06829becb78c74f49879528fc632c1',
      abi: ROLLUP_AZTEC_TESTNET,
    },
  ],
};

export const getRollupVersionsForRange = (
  chainName: AztecChainName,
  startBlock: bigint,
  endBlock: bigint,
): Array<{ fromBlock: bigint; toBlock: bigint; address: string; abi: any }> => {
  const versions = rollupVersions[chainName];
  const result: Array<{ fromBlock: bigint; toBlock: bigint; address: string; abi: any }> = [];

  for (const v of versions) {
    const vFrom = BigInt(v.fromBlock);
    const vTo = v.toBlock === Infinity ? endBlock : BigInt(v.toBlock);

    if (vTo <= startBlock || vFrom >= endBlock) continue;

    result.push({
      fromBlock: vFrom < startBlock ? startBlock : vFrom,
      toBlock: vTo > endBlock ? endBlock : vTo,
      address: v.address,
      abi: v.abi,
    });
  }

  return result;
};

export const getContracts = async (chainName: AztecChainName): Promise<L1ContractAddresses> => {
  try {
    const chain = await db.chain.findFirst({
      where: { name: chainName },
      include: { params: true },
    });

    if (chain?.params?.l1ContractsAddresses) {
      try {
        return JSON.parse(chain.params.l1ContractsAddresses) as L1ContractAddresses;
      } catch {
        logError(`${chainName}: Invalid JSON in l1ContractsAddresses, using fallback`);
      }
    }

    logWarn(`${chainName}: No L1 contract addresses in DB, using hardcoded fallback`);
  } catch (e: any) {
    logWarn(`${chainName}: Failed to read L1 contracts from DB (${e.message}), using hardcoded fallback`);
  }

  return contracts[chainName];
};

export const tokenAbis = {
  aztec: TOKEN_ABI_AZTEC_MAINNET,
  'aztec-testnet': TOKEN_ABI_AZTEC_TESTNET,
};

export const gseAbis = {
  aztec: GSE_ABI_AZTEC_MAINNET,
  'aztec-testnet': GSE_ABI_AZTEC_TESTNET,
};

export const stakingRegistryAbis = {
  aztec: STAKING_REGISTRY_AZTEC_MAINNET,
  'aztec-testnet': STAKING_REGISTRY_AZTEC_TESTNET,
};

export const rollupAbis = {
  aztec: ROLLUP_AZTEC_MAINNET,
  'aztec-testnet': ROLLUP_AZTEC_TESTNET,
};

export const governanceAbis = {
  aztec: GOVERNANCE_ABI_AZTEC_MAINNET,
  'aztec-testnet': GOVERNANCE_ABI_AZTEC_TESTNET,
};

export const governanceProposerAbis = {
  aztec: GOVERNANCE_PROPOSER_ABI_AZTEC_MAINNET,
  'aztec-testnet': GOVERNANCE_PROPOSER_ABI_AZTEC_TESTNET,
};

export const deploymentBlocks = {
  aztec: rollupVersions.aztec[0].fromBlock,
  'aztec-testnet': rollupVersions['aztec-testnet'][0].fromBlock,
};
