import { Prisma } from '@prisma/client';

import db from '@/db';
import logger from '@/logger';
import { AddChainProps } from '@/server/tools/chains/chain-indexer';
import chainNames from '@/server/tools/chains/chains';
import { getChainParams } from '@/server/tools/chains/params';

const { logInfo, logError } = logger('init-chains');

import ChainCreateInput = Prisma.ChainCreateInput;

async function addNetwork(chain: AddChainProps): Promise<void> {
  const chainFields: ChainCreateInput = {
    rang: chain.rang,
    ecosystem: chain.ecosystem ?? 'cosmos',
    chainId: chain.chainId,
    name: chain.name,
    prettyName: chain.prettyName,
    denom: chain.denom,
    minimalDenom: chain.minimalDenom,
    coinDecimals: chain.coinDecimals,
    coinType: chain.coinType,
    logoUrl: chain.logoUrl,
    coinGeckoId: chain.coinGeckoId,
    bech32Prefix: chain.bech32Prefix,
    twitterUrl: chain.twitterUrl,
    docs: chain.docs,
    githubMainRepo: chain.mainRepo,
    githubUrl: chain.githubUrl,
    hasValidators: chain.hasValidators,
  };

  const existingChain = await db.chain.findUnique({
    where: { chainId: chain.chainId },
    include: {
      chainNodes: true,
    },
  });

  if (!existingChain) {
    await db.chain.create({
      data: {
        ...chainFields,
        chainNodes: {
          create: chain.nodes.map((node) => ({ url: node.url, type: node.type })),
        },
      },
    });
    logInfo(`${chain.prettyName} #${chain.chainId} chain created`);
    return;
  }

  await db.chain.update({
    where: { chainId: chain.chainId },
    data: {
      ...chainFields,
    },
  });

  const existingNodes = existingChain.chainNodes;
  const newNodes = chain.nodes;
  nodesLoop: for (const newNode of newNodes) {
    for (const existingNode of existingNodes) {
      if (existingNode.type === newNode.type && existingNode.url !== newNode.url) {
        await db.chainNode.update({
          where: { id: existingNode.id },
          data: { url: newNode.url },
        });
        continue nodesLoop;
      }
    }

    await db.chainNode.create({
      data: {
        url: newNode.url,
        type: newNode.type,
        chainId: existingChain.id,
      },
    });
  }

  logInfo(`Chain #${chain.chainId} ${chain.prettyName} updated`);
}

async function main() {
  try {
    for (const chainName of chainNames) {
      const chainParams = getChainParams(chainName);
      await addNetwork(chainParams);
    }
  } catch (e) {
    logError('Error: ', e);
  }

  logInfo(`Finished adding chains`);
}

main();
