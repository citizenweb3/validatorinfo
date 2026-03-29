/**
 * Formats a price with adaptive decimal places based on magnitude.
 * Shows enough precision to capture meaningful price movements.
 *
 * - >= $1,000: 2 decimals ($1,234.56)
 * - >= $1: 2 decimals ($1.23)
 * - >= $0.01: 4 decimals ($0.0260)
 * - >= $0.001: 5 decimals ($0.00263)
 * - < $0.001: 6 decimals ($0.000263)
 */
const formatPrice = (value: number): string => {
  const defaultPrecision = 2;
  if (value > 1) return value.toFixed(2);
  if (value >= 0.01) return value.toFixed(4);
  if (value >= 0.001) return value.toFixed(5);
  return value.toFixed(6);
};

export default formatPrice;
