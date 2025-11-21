import GSE_ABI_AZTEC_TESTNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec-testnent/GSE_ABI.json';
import TOKEN_ABI_AZTEC_TESTNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec-testnent/TOKEN_ABI.json';
import GSE_ABI_AZTEC_MAINNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec/GSE_ABI.json';
import TOKEN_ABI_AZTEC_MAINNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec/TOKEN_ABI.json';
import { aztecMainnet, aztecTestnet } from '@/server/tools/chains/aztec/utils/contracts/l1-contracts';

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

export const getL1: Record<string, string> = {
  'aztec-testnet': 'ethereum-sepolia',
  aztec: 'ethereum',
};
