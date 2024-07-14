import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

type Chain = {
  chainId: string;
  name: string;
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
      chainId: chain.chainId,
      name: chain.name,
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
      grpc: {
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
    name: 'CosmosHub',
    chainId: 'cosmoshub-4',
    bech32Prefix: 'cosmos',
    coinDecimals: 6,
    coinGeckoId: 'cosmoshub',
    coinType: 118,
    denom: 'ATOM',
    minimalDenom: 'uatom',
    grpcNodeUrl: 'grpc.cosmoshub-4.citizenweb3.com/',
    lcdNodeUrl: 'https://api.cosmoshub-4.citizenweb3.com/',
    rpcNodeUrl: 'https://rpc.cosmoshub-4.citizenweb3.com/',
    wsNodeUrl: '',
    logoUrl: '',
    mainRepo: '',
    docs: '',
    githubUrl: '',
    twitterUrl: '',
  });

  await addNetwork({
    name: 'Celestia',
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
    wsNodeUrl: '',
    logoUrl: '',
    mainRepo: '',
    docs: '',
    githubUrl: '',
    twitterUrl: '',
  });

  await addNetwork({
    name: 'Picasso',
    chainId: 'centauri-1',
    bech32Prefix: 'pica',
    coinDecimals: 6,
    coinGeckoId: '',
    coinType: 118,
    denom: 'PICA',
    minimalDenom: 'ppica',
    grpcNodeUrl: 'grpc.celestia.citizenweb3.com/',
    lcdNodeUrl: 'https://api.celestia.citizenweb3.com/',
    rpcNodeUrl: 'https://rpc.celestia.citizenweb3.com/',
    wsNodeUrl: '',
    logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/composable/images/pica.svg',
    mainRepo: '',
    docs: '',
    githubUrl: '',
    twitterUrl: '',
  });

  await addNetwork({
    name: 'Picasso',
    chainId: 'centauri-1',
    bech32Prefix: 'pica',
    coinDecimals: 6,
    coinGeckoId: '',
    coinType: 118,
    denom: 'PICA',
    minimalDenom: 'ppica',
    grpcNodeUrl: 'grpc.composable.citizenweb3.com/',
    lcdNodeUrl: 'https://api.composable.citizenweb3.com/',
    rpcNodeUrl: 'https://rpc.composable.citizenweb3.com/',
    wsNodeUrl: '',
    logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/composable/images/pica.svg',
    mainRepo: '',
    docs: '',
    githubUrl: '',
    twitterUrl: '',
  });

  await addNetwork({
    name: 'Evmos',
    chainId: 'evmos_9001-2',
    bech32Prefix: 'evmos',
    coinDecimals: 18,
    coinGeckoId: '',
    coinType: 60,
    denom: 'EVMOS',
    minimalDenom: 'aevmos',
    grpcNodeUrl: 'grpc.evmos.citizenweb3.com/',
    lcdNodeUrl: 'https://api.evmos.citizenweb3.com/',
    rpcNodeUrl: 'https://rpc.evmos.citizenweb3.com/',
    wsNodeUrl: '',
    logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/composable/images/pica.svg',
    mainRepo: '',
    docs: '',
    githubUrl: '',
    twitterUrl: '',
  });

  await addNetwork({
    name: 'BitCanna',
    chainId: 'bitcanna-1',
    bech32Prefix: 'bcna',
    coinDecimals: 6,
    coinGeckoId: '',
    coinType: 118,
    denom: 'BCNA',
    minimalDenom: 'ubcna',
    grpcNodeUrl: 'grpc.bitcanna.citizenweb3.com/',
    lcdNodeUrl: 'https://api.bitcanna.citizenweb3.com/',
    rpcNodeUrl: 'https://rpc.bitcanna.citizenweb3.com/',
    wsNodeUrl: '',
    logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/composable/images/pica.svg',
    mainRepo: '',
    docs: '',
    githubUrl: '',
    twitterUrl: '',
  });


  await addNetwork({
    name: 'Likecoin',
    chainId: 'likecoin-mainnet-2',
    bech32Prefix: 'bcna',
    coinDecimals: 6,
    coinGeckoId: '',
    coinType: 118,
    denom: 'LIKE',
    minimalDenom: 'nanolike',
    grpcNodeUrl: 'grpc.likecoin.citizenweb3.com/',
    lcdNodeUrl: 'https://api.likecoin.citizenweb3.com/',
    rpcNodeUrl: 'https://rpc.likecoin.citizenweb3.com/',
    wsNodeUrl: '',
    logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/composable/images/pica.svg',
    mainRepo: '',
    docs: '',
    githubUrl: '',
    twitterUrl: '',
  });

   await addNetwork({
     name: 'Stride',
     chainId: 'stride-1',
     bech32Prefix: 'stride',
     coinDecimals: 6,
     coinGeckoId: '',
     coinType: 118,
     denom: 'STRD',
     minimalDenom: 'ustrd',
     grpcNodeUrl: 'grpc.stride.citizenweb3.com/',
     lcdNodeUrl: 'https://api.stride.citizenweb3.com/',
     rpcNodeUrl: 'https://rpc.stride.citizenweb3.com/',
     wsNodeUrl: '',
     logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/composable/images/pica.svg',
     mainRepo: '',
     docs: '',
     githubUrl: '',
     twitterUrl: '',
   });
}