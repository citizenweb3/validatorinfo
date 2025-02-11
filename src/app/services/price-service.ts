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

const priceService = {
  addPrice,
};

export default priceService;
