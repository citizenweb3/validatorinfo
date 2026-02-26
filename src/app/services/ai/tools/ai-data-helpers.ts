import db from '@/db';

const AZTEC_CHAINS = ['aztec', 'aztec-testnet'];

export const getChainValidatorCount = async (chainId: number, chainName: string): Promise<number> => {
  if (AZTEC_CHAINS.includes(chainName)) {
    const latestRecord = await db.chainValidatorsHistory.findFirst({
      where: { chainId },
      orderBy: { date: 'desc' },
    });

    return latestRecord?.validatorsCount ?? 0;
  }

  const distinctValidators = await db.node.findMany({
    where: {
      chain: { id: chainId },
      validatorId: { not: null },
    },
    select: { validatorId: true },
    distinct: ['validatorId'],
  });

  return distinctValidators.length;
};
