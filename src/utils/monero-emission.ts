import { MONERO_BLOCK_TIME_SECONDS } from '@/server/tools/chains/monero/constants';

const ZERO = BigInt(0);
const ONE = BigInt(1);

export const MONEY_SUPPLY_ATOMIC = (ONE << BigInt(64)) - ONE;
export const TAIL_EMISSION_ATOMIC = BigInt('600000000000');
export const SECONDS_PER_YEAR = 31_536_000;
export const BLOCKS_PER_YEAR = SECONDS_PER_YEAR / MONERO_BLOCK_TIME_SECONDS;

const ATOMIC_PATTERN = /^\d+$/;

export const parseAtomicAmount = (value: string | bigint | number | null | undefined): bigint | null => {
  if (typeof value === 'bigint') return value >= ZERO ? value : null;

  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value) || value < 0) return null;
    return BigInt(value);
  }

  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!ATOMIC_PATTERN.test(trimmed)) return null;

  try {
    return BigInt(trimmed);
  } catch {
    return null;
  }
};

export const estimateBaseRewardAtomic = (alreadyGeneratedAtomic: bigint): bigint => {
  const decayingReward = (MONEY_SUPPLY_ATOMIC - alreadyGeneratedAtomic) >> BigInt(20);
  return decayingReward > TAIL_EMISSION_ATOMIC ? decayingReward : TAIL_EMISSION_ATOMIC;
};

export const annualIssuanceAtomic = (blockRewardAtomic: bigint): bigint => {
  return blockRewardAtomic * BigInt(Math.round(BLOCKS_PER_YEAR));
};

export const atomicToDecimal = (value: bigint, coinDecimals: number): number => {
  return Number(value) / 10 ** coinDecimals;
};

export const inflationRate = (annualIssuance: bigint, circulatingSupply: bigint): number | null => {
  if (circulatingSupply <= ZERO) return null;
  return Number(annualIssuance) / Number(circulatingSupply);
};

export const stockToFlow = (circulatingSupply: bigint, annualIssuance: bigint): number | null => {
  if (annualIssuance <= ZERO) return null;
  return Number(circulatingSupply) / Number(annualIssuance);
};
