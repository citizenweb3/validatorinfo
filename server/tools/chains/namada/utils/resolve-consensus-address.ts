import db from '@/db';
import getOperatorAddress from '@/server/tools/chains/namada/utils/get-operator-address';
import logger from '@/logger';

const { logError } = logger('namada-validator-resolver');

export const resolveConsensusAddress = async (
  address: string,
  chainName: string,
  consensusToOperator: Record<string, string | null>,
): Promise<string | null> => {

  if (address in consensusToOperator) return consensusToOperator[address];

  try {
    const operatorAddress = await getOperatorAddress(address, chainName);
    if (operatorAddress) {
      consensusToOperator[address] = operatorAddress;
      const result = await db.node.updateMany({
        where: { operatorAddress },
        data: { consensusAddress: address },
      });
      if (result.count === 0) {
        logError(`Error update for ${operatorAddress}, couldn't find node in DB, skipped update`);
      }
      return operatorAddress;
    }

  } catch (err) {
    logError(`Failed to resolve consensusAddress for addr=${address}`, err);
  }
  return null;
};
