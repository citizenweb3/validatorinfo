import { Tokenomics } from '@prisma/client';
import db from '@/db';

const getTokenomicsByChainId = async (chainId: number): Promise<Tokenomics | null> => {
  const tokenomics = await db.tokenomics.findFirst({
    where: { chainId },
  });
  return tokenomics ?? null;
};

const TokenomicsService = {
  getTokenomicsByChainId,
};

export default TokenomicsService;
