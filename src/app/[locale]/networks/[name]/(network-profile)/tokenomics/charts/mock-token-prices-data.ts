/**
 * Static mock token price data for 3 years
 * Generated once and cached for consistent data across renders
 * This simulates real database data and can be easily replaced with actual DB calls
 */

// PriceData interface matching Prisma schema
export interface PriceData {
  id: number;
  chainId: number;
  value: number;
  createdAt: Date;
}

/**
 * Generate mock price data for 3 years
 * Uses sinusoidal waves to create realistic market cycles
 */
const generateThreeYearsData = (chainId: number): PriceData[] => {
  const data: PriceData[] = [];
  const hoursInThreeYears = 3 * 365 * 24; // 26,280 hours
  const averagePrice = 1.5;
  const minPrice = 0.5;
  const maxPrice = 2.5;

  // Start date: 3 years ago from now
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setFullYear(startDate.getFullYear() - 3);

  for (let i = 0; i < hoursInThreeYears; i++) {
    const currentDate = new Date(startDate.getTime() + i * 60 * 60 * 1000);

    // Create realistic price movement using multiple sine waves
    // Long-term trend (2-year cycle)
    const longTermCycle = Math.sin((i / hoursInThreeYears) * Math.PI * 2 * 1.5) * 0.3;

    // Medium-term trend (3-month cycle)
    const mediumTermCycle = Math.sin((i / (90 * 24)) * Math.PI * 2) * 0.2;

    // Short-term volatility (weekly cycle)
    const shortTermCycle = Math.sin((i / (7 * 24)) * Math.PI * 2) * 0.15;

    // Random noise for realistic fluctuations
    const randomNoise = (Math.random() - 0.5) * 0.08;

    // Combine all factors
    const priceVariation = longTermCycle + mediumTermCycle + shortTermCycle + randomNoise;

    // Calculate final price within bounds
    let price = averagePrice + priceVariation;

    // Ensure price stays within min/max range
    price = Math.max(minPrice, Math.min(maxPrice, price));

    // Round to 6 decimal places (realistic for crypto prices)
    price = Math.round(price * 1000000) / 1000000;

    data.push({
      id: i + 1,
      chainId,
      value: price,
      createdAt: currentDate,
    });
  }

  return data;
};

// Cache for different chains - prevents regeneration
const dataCache = new Map<number, PriceData[]>();

/**
 * Get mock price data for a specific chain
 * Data is cached to ensure consistency across renders
 */
export const getMockPriceData = (chainId: number): PriceData[] => {
  if (!dataCache.has(chainId)) {
    dataCache.set(chainId, generateThreeYearsData(chainId));
  }
  return dataCache.get(chainId)!;
};

/**
 * Pre-generated mock data for common chains
 * This simulates what would come from priceService.getPricesByChainId()
 */
export const mockPriceData = {
  // CosmosHub - established chain with full 3-year history
  cosmoshub: getMockPriceData(1),

  // Osmosis - full 3-year history
  osmosis: getMockPriceData(2),

  // Default fallback
  default: getMockPriceData(1),
};

/**
 * Simulate shorter history for new tokens (for testing edge cases)
 */
export const getMockPriceDataForPeriod = (chainId: number, daysOfHistory: number): PriceData[] => {
  const allData = getMockPriceData(chainId);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOfHistory);

  return allData.filter((price) => price.createdAt >= cutoffDate);
};

/**
 * Get statistics about the mock data
 */
export const getMockDataStats = (chainId: number) => {
  const data = getMockPriceData(chainId);
  const values = data.map((d) => d.value);

  return {
    count: data.length,
    min: Math.min(...values),
    max: Math.max(...values),
    average: values.reduce((a, b) => a + b, 0) / values.length,
    startDate: data[0].createdAt,
    endDate: data[data.length - 1].createdAt,
    periodInDays: Math.round(
      (data[data.length - 1].createdAt.getTime() - data[0].createdAt.getTime()) / (1000 * 60 * 60 * 24),
    ),
  };
};

// Export for testing/debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__mockPriceDataStats = getMockDataStats;
}
