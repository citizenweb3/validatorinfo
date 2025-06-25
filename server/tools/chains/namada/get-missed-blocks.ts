import logger from '@/logger';
import fetchChainData from '@/server/tools/get-chain-data';
import db from '@/db';
import { resolveConsensusAddress } from '@/server/tools/chains/namada/utils/resolve-consensus-address';
import { SlashingSigningInfos } from '@/server/types';
import { GetMissedBlocks } from '@/server/tools/chains/chain-indexer';
import fetchValidatorsActiveSet from '@/server/tools/chains/namada/utils/fetch-validators-active-set';

const { logError, logInfo } = logger('namada-missed-blocks');

interface BlockResponse {
  result?: {
    block: {
      last_commit: {
        signatures: {
          block_id_flag: string;
          validator_address: string;
          signature: string | null;
        }[];
      };
    };
  };
}

const prepareAddressesMap = async (dbChainId: number) => {
  const nodes = await db.node.findMany({
    where: { chainId: dbChainId },
    select: { consensusAddress: true, operatorAddress: true },
  });
  const consensusToOperator: Record<string, string | null> = {};
  for (const node of nodes) {
    if (node.consensusAddress) consensusToOperator[node.consensusAddress.toUpperCase()] = node.operatorAddress;
  }
  return consensusToOperator;
};

const getMissedBlocks: GetMissedBlocks = async (chain, dbChain) => {
  try {
    const latestHeight = await fetchChainData<{ result: { sync_info: { latest_block_height: string } } }>(
      chain.name, 'rpc', '/status',
    ).then(r => Number(r?.result?.sync_info.latest_block_height));

    if (!latestHeight) {
      logError(`No latestHeight for chain: ${chain.name}`);
      return [];
    }

    if (!dbChain?.params?.blocksWindow) {
      logError(`Didn't set up blocks window for chain ${chain.name}`);
      return [];
    }

    const startHeight = Math.max(1, latestHeight - dbChain.params.blocksWindow + 1);

    let consensusOperatorMap = await prepareAddressesMap(dbChain.id);
    let missedCounters: Record<string, number> = {};
    let checkedBlocksCount = 0;

    for (let height = startHeight; height <= latestHeight; height++) {
      let consensusAddresses: string[];
      try {
        consensusAddresses = await fetchValidatorsActiveSet(chain.name, height);
      } catch (e) {
        logError(`Failed to fetch validators active set at height ${height}:`, e);
        continue;
      }
      if (!consensusAddresses.length) continue;

      for (let consensusAddress of consensusAddresses) {
        if (!(consensusAddress in consensusOperatorMap)) {
          const operatorAddress = await resolveConsensusAddress(consensusAddress, chain.name, consensusOperatorMap);
          consensusOperatorMap[consensusAddress] = operatorAddress ?? null;
        }
      }

      const operatorAddressesSet = new Set<string>(
        consensusAddresses
          .map(addr => consensusOperatorMap[addr])
          .filter(Boolean) as string[],
      );

      operatorAddressesSet.forEach(operatorAddress => {
        if (!(operatorAddress in missedCounters)) missedCounters[operatorAddress] = 0;
      });

      let block: BlockResponse | null = null;
      try {
        block = await fetchChainData<BlockResponse>(chain.name, 'rpc', `/block?height=${height}`);
      } catch (e) {
        logError(`Failed to fetch block at height ${height}:`, e);
        continue;
      }
      if (!block?.result?.block) continue;
      checkedBlocksCount++;

      let signedValidatorsSet = new Set<string>();
      for (const signature of block.result.block.last_commit.signatures) {
        if (Number(signature.block_id_flag) === 2 && signature.validator_address) {
          signedValidatorsSet.add(signature.validator_address.toUpperCase());
        }
      }

      for (const address of consensusAddresses) {
        if (!signedValidatorsSet.has(address)) {
          const operatorAddress = consensusOperatorMap[address];
          if (operatorAddress) {
            missedCounters[operatorAddress]++;
          }
        }
      }
    }

    logInfo(`Blocks checked: ${checkedBlocksCount} out of ${latestHeight - startHeight + 1} expected`);

    return Object.entries(missedCounters).map(
      ([address, missed]): SlashingSigningInfos => ({
        address,
        missed_blocks_counter: missed.toString(),
      }),
    );
  } catch (e) {
    logError(`Can't fetch slashing infos for ${chain.name}:`, e);
    return [];
  }
};

export default getMissedBlocks;
