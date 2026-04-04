import ChainService from '@/services/chain-service';
import SearchService from '@/services/search-service';

export const toHumanTokens = (raw: string | null | undefined, decimals: number | null | undefined): number | null => {
  if (!raw || decimals == null) return null;
  const value = Number(raw) / 10 ** decimals;
  return isFinite(value) ? value : null;
};

export const ZERO_HASH = '0x' + '0'.repeat(64);

const normalizeSearchValue = (value: string) =>
  value
    .toLowerCase()
    .replace(/[.\-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const resolveChain = async (chainName: string) => {
  const safeChainName = chainName.trim();
  if (!safeChainName) {
    return null;
  }

  const exact = await ChainService.getByName(safeChainName);
  if (exact) {
    return exact;
  }

  const { chains, tokens } = await SearchService.findAll(safeChainName);
  const normalizedQuery = normalizeSearchValue(safeChainName);
  const rankedCandidates = [...chains, ...tokens];
  const rankedMatch = rankedCandidates.find((candidate) =>
    normalizeSearchValue(candidate.name) === normalizedQuery
    || normalizeSearchValue(candidate.prettyName) === normalizedQuery,
  ) ?? rankedCandidates[0];

  if (!rankedMatch) {
    return null;
  }

  return ChainService.getById(rankedMatch.id);
};
