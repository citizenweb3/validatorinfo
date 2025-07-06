export const bigIntPow = (base: bigint, exp: bigint): bigint => {
  let res = BigInt(1);
  for (let i = BigInt(0); i < exp; i++) res *= base;
  return res;
};
