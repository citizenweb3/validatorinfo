'use server';

import chainService from '@/services/chain-service';
import SlashingEventService from '@/services/slashing-event-service';

export interface GetValidatorSlashingEventsParams {
  chainId: number;
  operatorAddress: string;
  limit?: number;
}

export interface ValidatorSlashingEventsResult {
  events: Array<{
    id: number;
    blockNumber: string;
    transactionHash: string;
    amount: string;
    timestamp: Date;
    logIndex: number;
    attester: string;
  }>;
  totalCount: number;
  totalSlashed: string;
  tokenPrice?: number;
}

export async function getValidatorSlashingEvents(
  params: GetValidatorSlashingEventsParams,
): Promise<ValidatorSlashingEventsResult | null> {
  const { chainId, operatorAddress, limit = 10 } = params;

  const history = await SlashingEventService.getValidatorSlashingHistory(chainId, operatorAddress, 0, limit);

  const priceData = await chainService.getTokenPriceByChainId(chainId);
  const tokenPrice = priceData?.value;

  return {
    events: history.events,
    totalCount: history.totalCount,
    totalSlashed: history.totalSlashed.toString(),
    tokenPrice: tokenPrice || undefined,
  };
}
