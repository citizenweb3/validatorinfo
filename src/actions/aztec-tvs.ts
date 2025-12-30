'use server';

import aztecDbService, { PeriodType, TvsDataPoint } from '@/services/aztec-db-service';

export const getAztecTvsData = async (chainName: string, period: PeriodType = 'day'): Promise<TvsDataPoint[]> => {
  try {
    const data = await aztecDbService.getTvsData(chainName, period);
    return data;
  } catch (error) {
    console.error('Error in getAztecTvsData action:', error);
    return [];
  }
};
