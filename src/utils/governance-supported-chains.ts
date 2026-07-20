import { isTxByAddressChainSupported } from '@/utils/tx-supported-chains';

export const isGovVotesChainSupported = (chainName: string): boolean => isTxByAddressChainSupported(chainName);
