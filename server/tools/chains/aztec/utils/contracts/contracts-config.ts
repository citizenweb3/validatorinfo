import GOVERNANCE_ABI_AZTEC_TESTNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec-testnent/GOVERNANCE_ABI.json';
import GOVERNANCE_PROPOSER_ABI_AZTEC_TESTNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec-testnent/GOVERNANCE_PROPOSER_ABI.json';
import GSE_ABI_AZTEC_TESTNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec-testnent/GSE_ABI.json';
import STAKING_REGISTRY_AZTEC_TESTNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec-testnent/STAKING_REGISTRY_ABI.json';
import TOKEN_ABI_AZTEC_TESTNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec-testnent/TOKEN_ABI.json';
import GOVERNANCE_ABI_AZTEC_MAINNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec/GOVERNANCE_ABI.json';
import GOVERNANCE_PROPOSER_ABI_AZTEC_MAINNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec/GOVERNANCE_PROPOSER_ABI.json';
import GSE_ABI_AZTEC_MAINNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec/GSE_ABI.json';
import ROLLUP_AZTEC_MAINNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec/ROLLUP_ABI.json';
import ROLLUP_AZTEC_TESTNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec/ROLLUP_ABI.json';
import STAKING_REGISTRY_AZTEC_MAINNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec/STAKING_REGISTRY_ABI.json';
import TOKEN_ABI_AZTEC_MAINNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec/TOKEN_ABI.json';
import { aztecMainnet, aztecTestnet } from '@/server/tools/chains/aztec/utils/contracts/l1-contracts';

export type AztecChainName = keyof typeof contracts;

export const isAztecChainName = (chainName: string): chainName is AztecChainName => {
  return chainName === 'aztec' || chainName === 'aztec-testnet';
};

export const getL1: Record<string, string> = {
  'aztec-testnet': 'ethereum-sepolia',
  aztec: 'ethereum',
};

export const contracts = {
  aztec: aztecMainnet,
  'aztec-testnet': aztecTestnet,
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
  aztec: 21550000, // Approximate deployment block for aztec mainnet
  'aztec-testnet': 7300000, // Approximate deployment block for aztec testnet
};
