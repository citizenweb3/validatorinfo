import { Prisma } from '@prisma/client';

import db from '@/db';
import logger from '@/logger';

const { logInfo, logError } = logger('init-chains');

import ChainCreateInput = Prisma.ChainCreateInput;

type ChainNodeType = 'indexer' | 'lcd' | 'rpc' | 'grpc' | 'ws';

type AddChainProps = {
  ecosystem?: string;
  rang: number;
  chainId: string;
  name: string;
  prettyName: string;
  denom: string;
  minimalDenom: string;
  logoUrl: string;
  coinGeckoId: string;
  bech32Prefix: string;
  nodes: { type: ChainNodeType; url: string }[];
  coinDecimals: number;
  coinType: number;
  twitterUrl: string;
  docs: string | null;
  mainRepo: string;
  githubUrl: string;
  hasValidators?: boolean;
};

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
    await addNetwork({
      rang: 1,
      name: 'cosmoshub',
      prettyName: 'CosmosHub',
      chainId: 'cosmoshub-4',
      bech32Prefix: 'cosmos',
      coinDecimals: 6,
      coinGeckoId: 'cosmos',
      coinType: 118,
      denom: 'ATOM',
      minimalDenom: 'uatom',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg',
      nodes: [
        { type: 'grpc', url: 'grpc.cosmoshub-4.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.cosmoshub-4.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.cosmoshub-4.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.cosmoshub-4.citizenweb3.com/websocket' },
      ],
      mainRepo: 'https://github.com/cosmos/gaia',
      docs: 'https://cosmos.network',
      githubUrl: 'https://github.com/cosmos',
      twitterUrl: '123',
    });

    await addNetwork({
      rang: 1,
      name: 'celestia',
      prettyName: 'Celestia',
      chainId: 'celestia',
      bech32Prefix: 'tia',
      coinDecimals: 6,
      coinGeckoId: 'celestia',
      coinType: 118,
      denom: 'TIA',
      minimalDenom: 'utia',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.svg',
      nodes: [
        { type: 'grpc', url: 'grpc.celestia.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.celestia.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.celestia.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.celestia.citizenweb3.com/websocket' },
      ],
      mainRepo: '123',
      docs: '123',
      githubUrl: '123',
      twitterUrl: '123',
    });

    await addNetwork({
      rang: 4,
      name: 'bitcanna',
      prettyName: 'BitCanna',
      chainId: 'bitcanna-1',
      bech32Prefix: 'bcna',
      coinDecimals: 6,
      coinGeckoId: 'bitcanna',
      coinType: 118,
      denom: 'BCNA',
      minimalDenom: 'ubcna',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/bitcanna/images/bcna.svg',
      nodes: [
        { type: 'grpc', url: 'grpc.bitcanna.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.bitcanna.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.bitcanna.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.bitcanna.citizenweb3.com/websocket' },
      ],
      mainRepo: '123',
      docs: '123',
      githubUrl: '123',
      twitterUrl: '123',
    });

    await addNetwork({
      rang: 4,
      name: 'likecoin',
      prettyName: 'LikeCoin',
      chainId: 'likecoin-mainnet-2',
      bech32Prefix: 'bcna',
      coinDecimals: 6,
      coinGeckoId: 'likecoin',
      coinType: 118,
      denom: 'LIKE',
      minimalDenom: 'nanolike',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/refs/heads/master/likecoin/images/like.svg',
      nodes: [
        { type: 'grpc', url: 'grpc.likecoin.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.likecoin.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.likecoin.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.likecoin.citizenweb3.com/websocket' },
      ],
      mainRepo: '123',
      docs: '123',
      githubUrl: '123',
      twitterUrl: '123',
    });

    await addNetwork({
      rang: 2,
      name: 'stride',
      prettyName: 'Stride',
      chainId: 'stride-1',
      bech32Prefix: 'stride',
      coinDecimals: 6,
      coinGeckoId: 'stride',
      coinType: 118,
      denom: 'STRD',
      minimalDenom: 'ustrd',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.svg',
      nodes: [
        { type: 'grpc', url: 'grpc.stride.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.stride.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.stride.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.stride.citizenweb3.com/websocket' },
      ],
      mainRepo: '123',
      docs: '123',
      githubUrl: '123',
      twitterUrl: '123',
    });

    await addNetwork({
      rang: 3,
      name: 'Quicksilver',
      prettyName: 'Quicksilver',
      chainId: 'quicksilver-2',
      bech32Prefix: 'quick',
      coinDecimals: 6,
      coinGeckoId: 'quicksilver',
      coinType: 118,
      denom: 'QCK',
      minimalDenom: 'uqck',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qck.svg',
      nodes: [
        { type: 'grpc', url: 'grpc.quicksilver.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.quicksilver.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.quicksilver.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.quicksilver.citizenweb3.com/websocket' },
      ],
      mainRepo: '123',
      docs: '123',
      githubUrl: '123',
      twitterUrl: '123',
    });

    await addNetwork({
      rang: 3,
      name: 'govgen',
      prettyName: 'GovGen',
      chainId: 'govgen-1',
      bech32Prefix: 'govgen',
      coinDecimals: 6,
      coinGeckoId: '',
      coinType: 118,
      denom: 'GOVGEN',
      minimalDenom: 'ugovgen',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/govgen/images/govgen.svg',
      nodes: [
        { type: 'grpc', url: 'grpc.govgen.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.govgen.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.govgen.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.govgen.citizenweb3.com/websocket' },
      ],
      mainRepo: '123',
      docs: '123',
      githubUrl: '123',
      twitterUrl: '123',
    });

    await addNetwork({
      rang: 4,
      name: 'uptick',
      prettyName: 'Uptick',
      chainId: 'uptick_117-1',
      bech32Prefix: 'uptick',
      coinDecimals: 18,
      coinGeckoId: '',
      coinType: 60,
      denom: 'UPTICK',
      minimalDenom: 'auptick',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/uptick/images/uptick.svg',
      nodes: [
        { type: 'grpc', url: 'grpc.uptick.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.uptick.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.uptick.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.uptick.citizenweb3.com/websocket' },
      ],
      mainRepo: '123',
      docs: '123',
      githubUrl: '123',
      twitterUrl: '123',
    });

    await addNetwork({
      rang: 4,
      name: 'gravitybridge',
      prettyName: 'Gravity Bridge',
      chainId: 'gravity-bridge-3',
      bech32Prefix: 'gravity',
      coinDecimals: 6,
      coinGeckoId: '',
      coinType: 118,
      denom: 'GRAV',
      minimalDenom: 'ugraviton',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.svg',
      nodes: [
        { type: 'grpc', url: 'grpc.gravity.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.gravity.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.gravity.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.gravity.citizenweb3.com/websocket' },
      ],
      mainRepo: '123',
      docs: '123',
      githubUrl: '123',
      twitterUrl: '123',
    });

    await addNetwork({
      rang: 4,
      name: 'neutron',
      prettyName: 'Neutron',
      chainId: 'neutron-1',
      bech32Prefix: 'neutron',
      coinDecimals: 6,
      coinGeckoId: 'neutron',
      coinType: 118,
      denom: 'NTRN',
      minimalDenom: 'untrn',
      hasValidators: false,
      logoUrl:
        'https://raw.githubusercontent.com/cosmos/chain-registry/refs/heads/master/neutron/images/neutron-raw.svg',
      nodes: [
        { type: 'grpc', url: 'grpc.neutron.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.neutron.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.neutron.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.neutron.citizenweb3.com/websocket' },
      ],
      mainRepo: '123',
      docs: '123',
      githubUrl: '123',
      twitterUrl: '123',
    });

    await addNetwork({
      rang: 4,
      name: 'neutron-testnet',
      prettyName: 'Neutron testnet',
      chainId: 'pion-1',
      bech32Prefix: 'neutron',
      coinDecimals: 6,
      coinGeckoId: '',
      coinType: 118,
      denom: 'NTRN',
      minimalDenom: 'untrn',
      hasValidators: false,
      logoUrl:
        'https://raw.githubusercontent.com/cosmos/chain-registry/refs/heads/master/neutron/images/neutron-raw.svg',
      nodes: [
        { type: 'grpc', url: 'grpc.neutron.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.pion-1.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.pion-1-testnet.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.pion-1-testnet.citizenweb3.com/websocket' },
      ],
      mainRepo: '123',
      docs: '123',
      githubUrl: '123',
      twitterUrl: '123',
    });

    await addNetwork({
      rang: 4,
      name: 'dymension',
      prettyName: 'Dymension Hub',
      chainId: 'dymension_1100-1',
      bech32Prefix: 'dym',
      coinDecimals: 18,
      coinGeckoId: 'dymension',
      coinType: 60,
      denom: 'DYM',
      minimalDenom: 'adym',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/dymension/images/dymension-logo.svg',
      nodes: [
        { type: 'grpc', url: 'dymension-grpc.polkachu.com' },
        { type: 'lcd', url: 'https://dymension-api.polkachu.com' },
        { type: 'rpc', url: 'https://dymension-rpc.polkachu.com' },
        { type: 'ws', url: 'wss://dymension-rpc.polkachu.com/websocket' },
      ],
      mainRepo: '123',
      docs: '123',
      githubUrl: '123',
      twitterUrl: '123',
    });

    await addNetwork({
      rang: 4,
      name: 'althea',
      prettyName: 'Althea',
      chainId: 'althea_258432-1',
      bech32Prefix: 'althea',
      coinDecimals: 18,
      coinGeckoId: 'althea',
      coinType: 118,
      denom: 'ALTHEA',
      minimalDenom: 'aalthea',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/althea/images/althea.svg',
      nodes: [
        { type: 'grpc', url: 'grpc.althea.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.althea.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.althea.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.althea.citizenweb3.com/websocket' },
      ],
      mainRepo: '123',
      docs: '123',
      githubUrl: '123',
      twitterUrl: '123',
    });

    await addNetwork({
      rang: 4,
      name: 'atomone',
      prettyName: 'AtomOne',
      chainId: 'atomone-1',
      bech32Prefix: 'atone',
      coinDecimals: 6,
      coinGeckoId: 'atomone',
      coinType: 118,
      denom: 'ATONE',
      minimalDenom: 'uatone',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/atomone/images/atomone.svg',
      nodes: [
        { type: 'grpc', url: 'grpc.atomone.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.atomone.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.atomone.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.atomone.citizenweb3.com/websocket' },
      ],
      mainRepo: '123',
      docs: '123',
      githubUrl: '123',
      twitterUrl: '123',
    });

    await addNetwork({
      rang: 4,
      name: 'union',
      prettyName: 'Union',
      chainId: 'union-testnet-8',
      bech32Prefix: 'union',
      coinDecimals: 6,
      coinGeckoId: '',
      coinType: 118,
      denom: 'UNO',
      minimalDenom: 'uuno',
      logoUrl:
        'https://raw.githubusercontent.com/citizenweb3/staking-page/refs/heads/chain-images/union-testnet/union.svg',
      nodes: [
        { type: 'grpc', url: 'grpc.union-testnet.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.union-testnet.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.union-testnet.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.union-testnet.citizenweb3.com/websocket' },
      ],
      mainRepo: '123',
      docs: '123',
      githubUrl: '123',
      twitterUrl: '123',
    });

    await addNetwork({
      rang: 4,
      name: 'axone',
      prettyName: 'Axone',
      chainId: 'axone-dentrite-1',
      bech32Prefix: 'union',
      coinDecimals: 6,
      coinGeckoId: '',
      coinType: 118,
      denom: 'AXONE',
      minimalDenom: 'uaxone',
      logoUrl:
        'https://raw.githubusercontent.com/citizenweb3/staking-page/refs/heads/chain-images/axone-testnet/axone.svg',
      nodes: [
        { type: 'grpc', url: 'grpc.axone-testnet.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.axone-testnet.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.axone-testnet.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.axone-testnet.citizenweb3.com/websocket' },
      ],
      mainRepo: '123',
      docs: '123',
      githubUrl: '123',
      twitterUrl: '123',
    });

    await addNetwork({
      rang: 4,
      ecosystem: 'namada',
      name: 'namada',
      prettyName: 'Namada',
      chainId: 'namada.5f5de2dd1b88cba30586420',
      bech32Prefix: 'tnam',
      coinDecimals: 6,
      coinGeckoId: '',
      coinType: 877,
      denom: 'NAM',
      minimalDenom: 'unam',
      logoUrl: 'https://raw.githubusercontent.com/citizenweb3/staking-page/refs/heads/chain-images/namada/namada.svg',
      nodes: [
        { type: 'indexer', url: 'https://indexer.namada.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.namada.citizenweb3.com' },
      ],
      mainRepo: 'https://github.com/anoma/namada',
      docs: 'https://docs.namada.net',
      githubUrl: 'https://github.com/anoma',
      twitterUrl: 'https://x.com/namada',
    });

    await addNetwork({
      rang: 4,
      name: 'bostrom',
      prettyName: 'Bostrom',
      chainId: 'bostrom',
      bech32Prefix: 'bostrom',
      coinDecimals: 6,
      coinGeckoId: 'bostrom',
      coinType: 118,
      denom: 'BOOT',
      minimalDenom: 'uboot',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/boot.png',
      nodes: [
        { type: 'grpc', url: 'grpc.bostrom.cybernode.ai' },
        { type: 'lcd', url: 'https://lcd.bostrom.cybernode.ai' },
        { type: 'rpc', url: 'https://rpc.bostrom.cybernode.ai' },
        { type: 'ws', url: 'wss://rpc.bostrom.cybernode.ai/websocket' },
      ],
      mainRepo: '',
      docs: 'https://cybercongress.ai/docs/',
      githubUrl: 'https://github.com/cybercongress/cyberd',
      twitterUrl: 'https://twitter.com/cyber_devs',
    });

    await addNetwork({
      rang: 5,
      name: 'symphony-testnet',
      prettyName: 'Symphony Testnet',
      chainId: 'symphony-testnet-4',
      bech32Prefix: 'symphony',
      coinDecimals: 6,
      coinGeckoId: '',
      coinType: 118,
      denom: 'MLD',
      minimalDenom: 'note',
      logoUrl:
        'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/symphony-testnet/melody.png',
      nodes: [
        { type: 'grpc', url: 'grpc.symphony-testnet.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.symphony-testnet.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.symphony-testnet.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.symphony-testnet.citizenweb3.com/websocket' },
      ],
      mainRepo: 'https://github.com/Orchestra-Labs/symphony',
      docs: '',
      githubUrl: 'https://github.com/Orchestra-Labs',
      twitterUrl: 'https://x.com/orchestra_labs',
    });

    await addNetwork({
      rang: 5,
      name: 'nillion-testnet',
      prettyName: 'Nillion Testnet',
      chainId: 'nillion-chain-testnet-1',
      bech32Prefix: 'nillion',
      coinDecimals: 6,
      coinGeckoId: 'nillion',
      coinType: 118,
      denom: 'NIL',
      minimalDenom: 'unil',
      logoUrl:
        'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/nillion-chain-testnet/nil.png',
      nodes: [
        { type: 'grpc', url: 'grpc.nillion-testnet.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.nillion-testnet.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.nillion-testnet.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.nillion-testnet.citizenweb3.com/websocket' },
      ],
      mainRepo: 'https://github.com/NillionNetwork/nilchain',
      docs: '',
      githubUrl: 'https://github.com/NillionNetwork',
      twitterUrl: 'https://twitter.com/nillionnetwork',
    });

    await addNetwork({
      rang: 5,
      name: 'artela-testnet',
      prettyName: 'Artela Testnet',
      chainId: 'artela_11822-1',

      bech32Prefix: 'art',
      coinDecimals: 6,
      coinGeckoId: 'artela-network',
      coinType: 118,
      denom: 'ART',
      minimalDenom: 'uart',
      logoUrl:
        'https://raw.githubusercontent.com/citizenweb3/staking-page/refs/heads/chain-images/artela-testnet/artela.svg',
      nodes: [
        { type: 'grpc', url: 'grpc.artela-testnet.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.artela-testnet.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.artela-testnet.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.artela-testnet.citizenweb3.com/websocket' },
      ],
      mainRepo: 'https://github.com/artela-network/artela',
      docs: '',
      githubUrl: 'https://github.com/artela-network',
      twitterUrl: 'https://x.com/artela_network',
    });

    await addNetwork({
      rang: 5,
      name: 'space-pussy',
      prettyName: 'Pussy',
      chainId: 'space-pussy',
      bech32Prefix: 'pussy',
      coinDecimals: 0,
      coinGeckoId: '',
      coinType: 118,
      denom: 'PUSSY',
      minimalDenom: 'pussy',
      logoUrl: 'https://raw.githubusercontent.com/greatweb/pussy-landing/master/src/images/spacepussy.png',
      nodes: [
        { type: 'grpc', url: 'grpc.space-pussy.cybernode.ai' },
        { type: 'lcd', url: 'https://lcd.space-pussy.cybernode.ai' },
        { type: 'rpc', url: 'https://rpc.space-pussy.cybernode.ai' },
        { type: 'ws', url: 'wss://rpc.space-pussy.cybernode.ai/websocket' },
      ],
      mainRepo: 'https://github.com/greatweb/space-pussy/tree/main',
      docs: '',
      githubUrl: 'https://github.com/greatweb',
      twitterUrl: 'https://x.com/SpacePussy_ai',
    });

    await addNetwork({
      rang: 5,
      name: 'nomic',
      prettyName: 'Nomic',
      chainId: 'nomic-stakenet-3',
      bech32Prefix: 'nomic',
      coinDecimals: 6,
      coinGeckoId: '',
      coinType: 118,
      denom: 'NOM',
      minimalDenom: 'unom',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/refs/heads/master/nomic/images/nom.svg',
      nodes: [
        { type: 'grpc', url: 'grpc.nomic.polkachu.com' },
        { type: 'lcd', url: 'https://api.nomic.quokkastake.io' },
        { type: 'rpc', url: 'https://nomic-rpc.polkachu.com' },
        { type: 'ws', url: 'wss://nomic-rpc.polkachu.com/websocket' },
      ],
      mainRepo: 'https://github.com/nomic-io/nomic',
      docs: '',
      githubUrl: 'https://github.com/nomic-io',
      twitterUrl: 'https://x.com/nomicbtc',
    });

    await addNetwork({
      rang: 1,
      name: 'osmosis',
      prettyName: 'Osmosis',
      chainId: 'osmosis-1',
      bech32Prefix: 'osmo',
      coinDecimals: 6,
      coinGeckoId: 'osmosis',
      coinType: 118,
      denom: 'OSMO',
      minimalDenom: 'uosmo',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg',
      nodes: [
        { type: 'grpc', url: 'grpc.osmosis.citizenweb3.com' },
        { type: 'lcd', url: 'https://api.osmosis.citizenweb3.com' },
        { type: 'rpc', url: 'https://rpc.osmosis.citizenweb3.com' },
        { type: 'ws', url: 'wss://rpc.osmosis.citizenweb3.com/websocket' },
      ],
      mainRepo: 'https://github.com/osmosis-labs/osmosis',
      docs: 'https://docs.osmosis.zone',
      githubUrl: 'https://github.com/osmosis-labs',
      twitterUrl: 'https://twitter.com/osmosiszone',
    });
  } catch (e) {
    logError('Error: ', e);
  }

  logInfo(`Finished adding chains`);
}

main();
