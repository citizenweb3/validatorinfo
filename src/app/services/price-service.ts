import { Chain } from '@prisma/client';

import db from '@/db';
import logger from '@/logger';

const { logDebug } = logger('price-service');

const addPrice = async (chain: Chain, value: number) => {
  await db.price.create({
    data: { chainId: chain.id, value },
  });

  logDebug(`Price for ${chain.name} updated to ${value}`);
};

const getPricesByChainId = async (chainId: number, startDate?: Date, endDate?: Date) => {
  const where: any = { chainId };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  const prices = await db.price.findMany({
    where,
    orderBy: {
      createdAt: 'asc',
    },
  });

  return prices;
};

const getPricesByChainName = async (chainName: string, startDate?: Date, endDate?: Date) => {
  const chain = await db.chain.findUnique({
    where: { name: chainName },
  });

  if (!chain) {
    logDebug(`Chain ${chainName} not found`);
    return [];
  }

  return getPricesByChainId(chain.id, startDate, endDate);
};

const priceService = {
  addPrice,
  getPricesByChainId,
  getPricesByChainName,
};

export default priceService;
