const formatWeiPercentage = (wei: bigint | number, decimals: number = 2): string => {
  const percentage = (Number(wei) / 1e18) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

export default formatWeiPercentage;
