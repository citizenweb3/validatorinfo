import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';



import { ChainWithNodes } from '../types';


export const getPrices = async (
  client: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  chains: ChainWithNodes[],
) => {
  try {
    const req =
      'https://api.coingecko.com/api/v3/simple/price?ids=' +
      chains.map((chain) => chain.coinGeckoId).join('%2C') +
      '&vs_currencies=usd';
    const prices = await fetch(req).then((data) => data.json());
    const date = new Date();
    for (const chain of chains) {
      await client.price.create({
        data: { chainId: chain.chainId, date: date, value: prices[chain.coinGeckoId].usd },
      });
    }
  } catch (e) {
    console.log("Can't fetch prices: ", e);
  }
};