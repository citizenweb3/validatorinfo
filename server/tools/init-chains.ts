import { sleep } from '@cosmjs/utils';

import db from '@/db';
import logger from '@/logger';
import { AddChainProps } from '@/server/tools/chains/chain-indexer';
import chainNames from '@/server/tools/chains/chains';
import { ecosystemParams, updateChainParamsUpdated } from '@/server/tools/chains/params';
import downloadImage from '@/server/utils/download-image';

import { Prisma } from '.prisma/client';

import ChainUncheckedCreateInput = Prisma.ChainUncheckedCreateInput;

const { logInfo, logError } = logger('init-chains');

async function addNetwork(chain: AddChainProps): Promise<void> {
  const chainFields: ChainUncheckedCreateInput = {
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
    peers: chain.peers ? chain.peers.join(',') : undefined,
    seeds: chain.seeds ? chain.seeds.join(',') : undefined,
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
          create: chain.nodes.map((node) => {
            if (node.url[node.url.length - 1] === '/') {
              node.url = node.url.slice(0, -1);
            }
            return { url: node.url, type: node.type };
          }),
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

  const existingNodes = existingChain.chainNodes || [];
  const newNodes = chain.nodes;

  for (const newNode of newNodes) {
    if (newNode.url[newNode.url.length - 1] === '/') {
      newNode.url = newNode.url.slice(0, -1);
    }
    if (!existingNodes.some((node) => node.url === newNode.url && node.type === newNode.type)) {
      await db.chainNode.create({
        data: {
          url: newNode.url,
          type: newNode.type,
          chainId: existingChain.id,
        },
      });
    }
  }

  logInfo(`Chain #${chain.chainId} ${chain.prettyName} updated`);
}

async function main() {
  try {
    for (const ecosystem of ecosystemParams) {
      const existingEcosystem = await db.ecosystem.findUnique({
        where: { name: ecosystem.name },
      });

      let url = '';
      if (ecosystem.logoUrl) {
        url = await downloadImage('ecos', ecosystem.name, ecosystem.logoUrl);
      }

      if (!existingEcosystem) {
        await db.ecosystem.create({
          data: {
            name: ecosystem.name,
            prettyName: ecosystem.prettyName,
            logoUrl: url,
          },
        });
        logInfo(`Ecosystem ${ecosystem.prettyName} created`);
      }
    }
    for (const chainName of chainNames) {
      const chainParamsUpdated = await updateChainParamsUpdated(chainName);
      await addNetwork(chainParamsUpdated);
      await sleep(3000);
    }
  } catch (e) {
    logError('Error: ', e);
  }

  logInfo(`Finished adding chains`);
}

main();
