type UnsignedDecimal = {
  numerator: bigint;
  scale: bigint;
};

const UNSIGNED_DECIMAL_PATTERN = /^\d+(?:\.\d+)?$/;
const UNSIGNED_INTEGER_PATTERN = /^\d+$/;

export const parseUnsignedInteger = (value: string, label: string): bigint => {
  if (!UNSIGNED_INTEGER_PATTERN.test(value)) {
    throw new Error(`${label} must be an unsigned base-10 integer: ${value}`);
  }

  return BigInt(value);
};

export const parseUnsignedDecimal = (value: string, label: string): UnsignedDecimal => {
  if (!UNSIGNED_DECIMAL_PATTERN.test(value)) {
    throw new Error(`${label} must be an unsigned fixed-point decimal: ${value}`);
  }

  const [whole = '', fraction = ''] = value.split('.');
  let scale = BigInt(1);
  for (let index = 0; index < fraction.length; index++) scale *= BigInt(10);

  return {
    numerator: BigInt(`${whole}${fraction}`),
    scale,
  };
};

export const floorDelegationTokens = (shares: string, tokens: string, delegatorShares: string): bigint => {
  const parsedShares = parseUnsignedDecimal(shares, 'delegation shares');
  const parsedTokens = parseUnsignedInteger(tokens, 'validator tokens');
  const parsedDelegatorShares = parseUnsignedDecimal(delegatorShares, 'validator delegator_shares');

  if (parsedDelegatorShares.numerator === BigInt(0)) {
    throw new Error('validator delegator_shares must be greater than zero');
  }

  const numerator = parsedShares.numerator * parsedTokens * parsedDelegatorShares.scale;
  const denominator = parsedShares.scale * parsedDelegatorShares.numerator;
  return numerator / denominator;
};
