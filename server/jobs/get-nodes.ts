import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

import { ChainWithNodes } from '../types';
import getCosmosNodes from './get-cosmos-nodes';
import getNamadaNodes from './get-namada-nodes';

const getNodes = async (db: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, chains: ChainWithNodes[]) => {
  for (const chain of chains) {
    console.log('[SSA] ', `server/jobs/get-nodes.ts:10 chain.type:`, chain.type);
    try {
      switch (chain.type) {
        case 'namada':
          await getNamadaNodes(db, chain);
          break;
        default:
          await getCosmosNodes(db, chain);
      }
    } catch (e) {
      console.log(chain.name + 'error:', e);
    }
  }
};
export default getNodes;
