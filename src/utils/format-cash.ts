const formatCash = (n: number, decimals: number = 1): string => {
  const units = ['', 'K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y'];
  let unitIndex = 0;

  while (n >= 1000 && unitIndex < units.length - 1) {
    n /= 1000;
    unitIndex++;
  }

  const formattedNumber = n.toFixed(decimals);
  return formattedNumber.endsWith('.0')
    ? formattedNumber.slice(0, -2) + units[unitIndex]
    : formattedNumber + units[unitIndex];
};

export default formatCash;
