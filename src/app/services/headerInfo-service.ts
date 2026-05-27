import db from '@/db';
import { FDV_EXCLUDED_CHAINS_SET } from '@/utils/fdv-excluded-chains';

const getValidatorsAndChains = async (): Promise<{ chains: number; validators: number }> => {
  const [chains, validators] = await Promise.all([db.chain.count(), db.validator.count()]);
  return { chains, validators };
};

interface DominanceItem {
  name: string;
  share: number;
}

// Total FDV = sum of Tokenomics.fdv across chains (FDV = totalSupply * price, computed by update-fdv job).
// Dominance = each ecosystem's FDV share of the total. Only ecosystems with real data (fdv > 0) are returned.
const getFdvAndDominance = async (): Promise<{ totalFdv: number; dominance: DominanceItem[] }> => {
  const chains = await db.chain.findMany({
    select: {
      name: true,
      ecosystem: true,
      chainEcosystem: { select: { prettyName: true } },
      tokenomics: { select: { fdv: true } },
    },
  });

  let totalFdv = 0;
  const ecosystemFdv = new Map<string, number>();

  for (const chain of chains) {
    const fdv = FDV_EXCLUDED_CHAINS_SET.has(chain.name) ? 0 : chain.tokenomics?.fdv ?? 0;
    if (fdv <= 0) continue;

    totalFdv += fdv;
    const ecosystemName = chain.chainEcosystem?.prettyName ?? chain.ecosystem;
    ecosystemFdv.set(ecosystemName, (ecosystemFdv.get(ecosystemName) ?? 0) + fdv);
  }

  if (totalFdv === 0) {
    return { totalFdv: 0, dominance: [] };
  }

  const dominance = Array.from(ecosystemFdv.entries())
    .map(([name, value]) => ({ name, share: (value / totalFdv) * 100 }))
    .sort((a, b) => b.share - a.share);

  return { totalFdv, dominance };
};

const HeaderInfoService = {
  getValidatorsAndChains,
  getFdvAndDominance,
};

export default HeaderInfoService;
