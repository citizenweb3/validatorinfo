import ChainService from '@/services/chain-service';

export const toHumanTokens = (raw: string | null | undefined, decimals: number | null | undefined): number | null => {
  if (!raw || decimals == null) return null;
  const value = Number(raw) / 10 ** decimals;
  return isFinite(value) ? value : null;
};

export const ZERO_HASH = '0x' + '0'.repeat(64);

export const resolveChain = async (chainName: string) => {
  const chain = await ChainService.getByName(chainName);
  if (!chain) return null;
  return chain;
};
