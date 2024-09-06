import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

type Chain = {
  chainId: string;
  name: string;
  prettyName: string;
  denom: string;
  minimalDenom: string;
  logoUrl: string;
  coinGeckoId: string;
  bech32Prefix: string;
  lcdNodeUrl: string;
  rpcNodeUrl: string;
  grpcNodeUrl: string;
  wsNodeUrl: string;
  coinDecimals: number;
  coinType: number;
  twitterUrl: string;
  docs: string | null;
  mainRepo: string;
  githubUrl: string;
};

async function addNetwork(chain: Chain): Promise<void> {
  await prisma.chain.upsert({
    where: { chainId: chain.chainId },
    update: {},
    create: {
      type: 'cosmos',
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
      github: {
        create: {
          url: chain.githubUrl,
          mainRepo: chain.mainRepo,
        },
      },
      lcdNodes: {
        create: {
          url: chain.lcdNodeUrl,
        },
      },
      rpcNodes: {
        create: {
          url: chain.rpcNodeUrl,
        },
      },
      grpcNodes: {
        create: {
          url: chain.grpcNodeUrl,
        },
      },
      wsNodes: {
        create: {
          url: chain.wsNodeUrl,
        },
      },
    },
  });
}

async function main() {
  await addNetwork({
    name: 'cosmoshub',
    prettyName: 'CosmosHub',
    chainId: 'cosmoshub-4',
    bech32Prefix: 'cosmos',
    coinDecimals: 6,
    coinGeckoId: 'cosmos',
    coinType: 118,
    denom: 'ATOM',
    minimalDenom: 'uatom',
    grpcNodeUrl: 'grpc.cosmoshub-4.citizenweb3.com/',
    lcdNodeUrl: 'https://api.cosmoshub-4.citizenweb3.com/',
    rpcNodeUrl: 'https://rpc.cosmoshub-4.citizenweb3.com/',
    wsNodeUrl: 'wss://rpc.cosmoshub-4.citizenweb3.com/websocket',
    logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg',
    mainRepo: 'https://github.com/cosmos/gaia',
    docs: 'https://cosmos.network/',
    githubUrl: 'https://github.com/cosmos',
    twitterUrl: '123',
  });

  await addNetwork({
    name: 'celestia',
    prettyName: 'Celestia',
    chainId: 'celestia',
    bech32Prefix: 'tia',
    coinDecimals: 6,
    coinGeckoId: 'celestia',
    coinType: 118,
    denom: 'TIA',
    minimalDenom: 'utia',
    grpcNodeUrl: 'grpc.celestia.citizenweb3.com/',
    lcdNodeUrl: 'https://api.celestia.citizenweb3.com/',
    rpcNodeUrl: 'https://rpc.celestia.citizenweb3.com/',
    wsNodeUrl: 'wss://rpc.celestia.citizenweb3.com/websocket',
    logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.svg',
    mainRepo: '123',
    docs: '123',
    githubUrl: '123',
    twitterUrl: '123',
  });

  // await addNetwork({
  //   name: 'picasso',
  //   prettyName: 'Picasso',
  //   chainId: 'centauri-1',
  //   bech32Prefix: 'pica',
  //   coinDecimals: 6,
  //   coinGeckoId: '123',
  //   coinType: 118,
  //   denom: 'PICA',
  //   minimalDenom: 'ppica',
  //   grpcNodeUrl: 'grpc.celestia.citizenweb3.com/',
  //   lcdNodeUrl: 'https://api.composable.citizenweb3.com/',
  //   rpcNodeUrl: 'https://rpc.composable.citizenweb3.com/',
  //   wsNodeUrl: 'wss://rpc.composable.com/websocket',
  //   logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/composable/images/pica.svg',
  //   mainRepo: '123',
  //   docs: '123',
  //   githubUrl: '123',
  //   twitterUrl: '123',
  // });

  // await addNetwork({
  //   name: 'evmos',
  //   prettyName: 'Evmos',
  //   chainId: 'evmos_9001-2',
  //   bech32Prefix: 'evmos',
  //   coinDecimals: 18,
  //   coinGeckoId: '123',
  //   coinType: 60,
  //   denom: 'EVMOS',
  //   minimalDenom: 'aevmos',
  //   grpcNodeUrl: 'grpc.evmos.citizenweb3.com/',
  //   lcdNodeUrl: 'https://api.evmos.citizenweb3.com/',
  //   rpcNodeUrl: 'https://rpc.evmos.citizenweb3.com/',
  //   wsNodeUrl: 'wss://rpc.evmos.citizenweb3.com/websocket',
  //   logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/evmos.svg',
  //   mainRepo: '123',
  //   docs: '123',
  //   githubUrl: '11223',
  //   twitterUrl: '123',
  // });

  await addNetwork({
    name: 'bitcanna',
    prettyName: 'BitCanna',
    chainId: 'bitcanna-1',
    bech32Prefix: 'bcna',
    coinDecimals: 6,
    coinGeckoId: 'bitcanna',
    coinType: 118,
    denom: 'BCNA',
    minimalDenom: 'ubcna',
    grpcNodeUrl: 'grpc.bitcanna.citizenweb3.com/',
    lcdNodeUrl: 'https://api.bitcanna.citizenweb3.com/',
    rpcNodeUrl: 'https://rpc.bitcanna.citizenweb3.com/',
    wsNodeUrl: 'wss://rpc.bitcanna.citizenweb3.com/websocket',
    logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/bitcanna/images/bcna.svg',
    mainRepo: '123',
    docs: '123',
    githubUrl: '123',
    twitterUrl: '123',
  });

  await addNetwork({
    name: 'likecoin',
    prettyName: 'LikeCoin',
    chainId: 'likecoin-mainnet-2',
    bech32Prefix: 'bcna',
    coinDecimals: 6,
    coinGeckoId: 'likecoin',
    coinType: 118,
    denom: 'LIKE',
    minimalDenom: 'nanolike',
    grpcNodeUrl: 'grpc.likecoin.citizenweb3.com/',
    lcdNodeUrl: 'https://api.likecoin.citizenweb3.com/',
    rpcNodeUrl: 'https://rpc.likecoin.citizenweb3.com/',
    wsNodeUrl: 'wss://rpc.likecoin.citizenweb3.com/websocket',
    logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/likecoin/images/likecoin-chain-logo.svg',
    mainRepo: '123',
    docs: '123',
    githubUrl: '123',
    twitterUrl: '123',
  });

  await addNetwork({
    name: 'stride',
    prettyName: 'Stride',
    chainId: 'stride-1',
    bech32Prefix: 'stride',
    coinDecimals: 6,
    coinGeckoId: 'stride',
    coinType: 118,
    denom: 'STRD',
    minimalDenom: 'ustrd',
    grpcNodeUrl: 'grpc.stride.citizenweb3.com/',
    lcdNodeUrl: 'https://api.stride.citizenweb3.com/',
    rpcNodeUrl: 'https://rpc.stride.citizenweb3.com/',
    wsNodeUrl: 'wss://rpc.stride.citizenweb3.com/websocket',
    logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.svg',
    mainRepo: '123',
    docs: '123',
    githubUrl: '123',
    twitterUrl: '123',
  });
}

main();