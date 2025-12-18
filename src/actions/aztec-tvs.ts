'use server';

import aztecTvsService, { PeriodType, TvsDataPoint } from '@/services/aztec-tvs-service';

export const getAztecTvsData = async (
  chainName: string,
  period: PeriodType = 'day'
): Promise<TvsDataPoint[]> => {
  try {
    const data = await aztecTvsService.getTvsData(chainName, period);
    return data;
  } catch (error) {
    console.error('Error in getAztecTvsData action:', error);
    return [];
  }
};
