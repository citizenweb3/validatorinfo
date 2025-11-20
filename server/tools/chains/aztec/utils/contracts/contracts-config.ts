import GSE_ABI_AZTEC_TESTNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec-testnent/GSE_ABI.json';
import GSE_ABI_AZTEC_MAINNET from '@/server/tools/chains/aztec/utils/contracts/abis/aztec/GSE_ABI.json';
import { aztecMainnet, aztecTestnet } from '@/server/tools/chains/aztec/utils/contracts/l1-contracts';

export const contracts = {
  aztec: aztecMainnet,
  'aztec-testnet': aztecTestnet,
};

export const gseAbis = {
  aztec: GSE_ABI_AZTEC_MAINNET,
  'aztec-testnet': GSE_ABI_AZTEC_TESTNET,
};
