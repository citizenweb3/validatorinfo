import { Node, Validator } from '@prisma/client';

import db from '@/db';
import logger from '@/logger';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';

const { logDebug } = logger('validator-service');

export type ValidatorWithNodes = Validator & {
  nodes: Node[];
};

export type validatorNodesWithChainData = Node & {
  chain: ChainWithParamsAndTokenomics;
  votingPower: number;
};

const getByAddress = async (address: string) => {
  return db.nodesConsensusData.findUnique({
    where: { nodeAddress: address },
  });
};

const nodeConsensusService = {
  getByAddress,
};

export default nodeConsensusService;
