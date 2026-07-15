import db from '@/db';

const getNetworksBySlug = async (poolSlug: string) => {
  return db.miningPool.findMany({
    where: { slug: poolSlug, isVerified: true },
    include: { chain: true, stats: true },
    orderBy: { chainId: 'asc' },
  });
};

const miningPoolService = {
  getNetworksBySlug,
};

export default miningPoolService;
export { getNetworksBySlug };
