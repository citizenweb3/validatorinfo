import { StakingRates } from '@/types';

export const getStakingRates = (chainId: number, validatorAddress: string): Promise<StakingRates | undefined> => {
  const rates: StakingRates | undefined =
    chainId && validatorAddress
      ? {
          d1: 0.00101,
          d7: 0.007,
          d30: 0.03,
          d365: 0.1754,
        }
      : undefined;

  return Promise.resolve(rates);
};
