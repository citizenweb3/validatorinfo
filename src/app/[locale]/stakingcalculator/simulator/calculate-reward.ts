export const calculateReward = (amount: number, apr: number, days: number, compounding: boolean): number => {
  if (apr <= 0 || days <= 0 || amount <= 0) return 0;

  if (compounding) {
    const periodsPerYear = 365;
    const ratePerPeriod = apr / 100 / periodsPerYear;
    const totalValue = amount * Math.pow(1 + ratePerPeriod, days);
    return totalValue - amount;
  }

  return amount * (apr / 100) * (days / 365);
};
