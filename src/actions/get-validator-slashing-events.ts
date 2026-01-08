'use server';

import SlashingEventService from '@/services/slashing-event-service';
import chainService from '@/services/chain-service';

export interface GetValidatorSlashingEventsParams {
  chainName: string;
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
  }>;
  totalCount: number;
  totalSlashed: string;
  tokenPrice?: number;
}

export async function getValidatorSlashingEvents(
  params: GetValidatorSlashingEventsParams,
): Promise<ValidatorSlashingEventsResult | null> {
  const { chainName, operatorAddress, limit = 10 } = params;

  if (chainName !== 'aztec' && chainName !== 'aztec-testnet') {
    return null;
  }

  const chain = await chainService.getByName(chainName);
  if (!chain) {
    return null;
  }

  const history = await SlashingEventService.getValidatorSlashingHistory(
    chain.id,
    operatorAddress,
    0,
    limit,
  );

  const priceData = await chainService.getTokenPriceByChainId(chain.id);
  const tokenPrice = priceData?.value;

  return {
    events: history.events,
    totalCount: history.totalCount,
    totalSlashed: history.totalSlashed.toString(),
    tokenPrice: tokenPrice || undefined,
  };
}
