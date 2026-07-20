import {
  MONEY_SUPPLY_ATOMIC,
  TAIL_EMISSION_ATOMIC,
  annualIssuanceAtomic,
  estimateBaseRewardAtomic,
  inflationRate,
  parseAtomicAmount,
  stockToFlow,
} from '@/utils/monero-emission';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const tailReward = estimateBaseRewardAtomic(MONEY_SUPPLY_ATOMIC + BigInt(1));
assert(tailReward === TAIL_EMISSION_ATOMIC, 'already-generated supply above money supply must use tail emission');

const preTailReward = estimateBaseRewardAtomic(BigInt(0));
assert(preTailReward > TAIL_EMISSION_ATOMIC, 'pre-tail reward should be above tail emission');

const annualIssuance = annualIssuanceAtomic(TAIL_EMISSION_ATOMIC);
assert(annualIssuance === BigInt('157680000000000000'), 'tail annual issuance should be 157,680 XMR atomic');

assert(inflationRate(annualIssuance, BigInt(0)) === null, 'zero circulating supply should not produce inflation');
assert(stockToFlow(BigInt(100), BigInt(0)) === null, 'zero annual issuance should not produce stock-to-flow');
assert(parseAtomicAmount('18768504105216647351') === BigInt('18768504105216647351'), 'valid atomic string parses');
assert(parseAtomicAmount('not-a-number') === null, 'malformed atomic string returns null');
assert(parseAtomicAmount('-1') === null, 'negative atomic string returns null');
assert(parseAtomicAmount(Number.MAX_SAFE_INTEGER + 1) === null, 'unsafe numeric atomic input returns null');

console.log('monero emission checks passed');
