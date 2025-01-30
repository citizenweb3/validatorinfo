import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Chain = {
  rang: number;
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
  ecosystem?: string;
};

async function addNetwork(chain: Chain): Promise<void> {
  await prisma.chain.upsert({
    where: { chainId: chain.chainId },
    update: {
      rang: chain.rang,
      type: chain.ecosystem || 'cosmos',
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
    },
    create: {
      rang: chain.rang,
      type: chain.ecosystem || 'cosmos',
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
      grpcNodeUrl: 'grpc.cosmoshub-4.citizenweb3.com',
      lcdNodeUrl: 'https://api.cosmoshub-4.citizenweb3.com',
      rpcNodeUrl: 'https://rpc.cosmoshub-4.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.cosmoshub-4.citizenweb3.com/websocket',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg',
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
      grpcNodeUrl: 'grpc.celestia.citizenweb3.com',
      lcdNodeUrl: 'https://api.celestia.citizenweb3.com',
      rpcNodeUrl: 'https://rpc.celestia.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.celestia.citizenweb3.com/websocket',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.svg',
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
      grpcNodeUrl: 'grpc.bitcanna.citizenweb3.com',
      lcdNodeUrl: 'https://api.bitcanna.citizenweb3.com',
      rpcNodeUrl: 'https://rpc.bitcanna.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.bitcanna.citizenweb3.com/websocket',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/bitcanna/images/bcna.svg',
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
      grpcNodeUrl: 'grpc.likecoin.citizenweb3.com',
      lcdNodeUrl: 'https://api.likecoin.citizenweb3.com',
      rpcNodeUrl: 'https://rpc.likecoin.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.likecoin.citizenweb3.com/websocket',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/likecoin/images/likecoin-chain-logo.svg',
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
      grpcNodeUrl: 'grpc.stride.citizenweb3.com',
      lcdNodeUrl: 'https://api.stride.citizenweb3.com',
      rpcNodeUrl: 'https://rpc.stride.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.stride.citizenweb3.com/websocket',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.svg',
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
      grpcNodeUrl: 'grpc.quicksilver.citizenweb3.com',
      lcdNodeUrl: 'https://api.quicksilver.citizenweb3.com',
      rpcNodeUrl: 'https://rpc.quicksilver.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.quicksilver.citizenweb3.com/websocket',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qck.svg',
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
      grpcNodeUrl: 'grpc.govgen.citizenweb3.com',
      lcdNodeUrl: 'https://api.govgen.citizenweb3.com',
      rpcNodeUrl: 'https://rpc.govgen.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.govgen.citizenweb3.com/websocket',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/govgen/images/govgen.svg',
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
      grpcNodeUrl: 'grpc.uptick.citizenweb3.com',
      lcdNodeUrl: 'https://api.uptick.citizenweb3.com',
      rpcNodeUrl: 'https://rpc.uptick.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.uptick.citizenweb3.com/websocket',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/uptick/images/uptick.svg',
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
      grpcNodeUrl: 'grpc.gravity.citizenweb3.com',
      lcdNodeUrl: 'https://api.gravity.citizenweb3.com',
      rpcNodeUrl: 'https://rpc.gravity.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.gravity.citizenweb3.com/websocket',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.svg',
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
      grpcNodeUrl: 'grpc.neutron.citizenweb3.com',
      lcdNodeUrl: 'https://api.neutron.citizenweb3.com',
      rpcNodeUrl: 'https://rpc.neutron.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.neutron.citizenweb3.com/websocket',
      logoUrl:
        'https://raw.githubusercontent.com/cosmos/chain-registry/refs/heads/master/neutron/images/neutron-raw.svg',
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
      grpcNodeUrl: 'grpc.neutron.citizenweb3.com',
      lcdNodeUrl: 'https://api.pion-1.citizenweb3.com',
      rpcNodeUrl: 'https://rpc.pion-1-testnet.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.pion-1-testnet.citizenweb3.com/websocket',
      logoUrl:
        'https://raw.githubusercontent.com/cosmos/chain-registry/refs/heads/master/neutron/images/neutron-raw.svg',
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
      grpcNodeUrl: 'dymension-grpc.polkachu.com',
      lcdNodeUrl: 'https://dymension-api.polkachu.com',
      rpcNodeUrl: 'https://dymension-rpc.polkachu.com',
      wsNodeUrl: 'wss://dymension-rpc.polkachu.com/websocket',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/dymension/images/dymension-logo.svg',
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
      grpcNodeUrl: 'grpc.dym.citizenweb3.com',
      lcdNodeUrl: 'https://api.althea.citizenweb3.com',
      rpcNodeUrl: 'https://rpc.althea.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.althea.citizenweb3.com/websocket',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/althea/images/althea.svg',
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
      grpcNodeUrl: 'grpc.atomone.citizenweb3.com',
      lcdNodeUrl: 'https://api.atomone.citizenweb3.com',
      rpcNodeUrl: 'https://rpc.atomone.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.atomone.citizenweb3.com/websocket',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/atomone/images/atomone.svg',
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
      grpcNodeUrl: 'grpc.union-testnet.citizenweb3.com',
      lcdNodeUrl: 'https://api.union-testnet.citizenweb3.com',
      rpcNodeUrl: 'https://rpc.union-testnet.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.union-testnet.citizenweb3.com/websocket',
      logoUrl:
        'https://raw.githubusercontent.com/citizenweb3/staking-page/refs/heads/chain-images/union-testnet/union.svg',
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
      grpcNodeUrl: 'grpc.union-testnet.citizenweb3.com',
      lcdNodeUrl: 'https://api.axone-testnet.citizenweb3.com',
      rpcNodeUrl: 'https://rpc.axone-testnet.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.axone-testnet.citizenweb3/websocket',
      logoUrl:
        'https://raw.githubusercontent.com/citizenweb3/staking-page/refs/heads/chain-images/axone-testnet/axone.svg',
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
      grpcNodeUrl: 'https://indexer.namada.citizenweb3.com',
      lcdNodeUrl: 'https://rpc.namada.citizenweb3.com',
      rpcNodeUrl: 'https://rpc.namada.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.namada.citizenweb3.com/websocket',
      logoUrl: 'https://raw.githubusercontent.com/citizenweb3/staking-page/refs/heads/chain-images/namada/namada.svg',
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
      grpcNodeUrl: 'grpc.bostrom.cybernode.ai',
      lcdNodeUrl: 'https://lcd.bostrom.cybernode.ai',
      rpcNodeUrl: 'https://rpc.bostrom.cybernode.ai',
      wsNodeUrl: 'wss://rpc.bostrom.cybernode.ai/websocket',
      logoUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/boot.png',
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
      rpcNodeUrl: 'https://rpc.symphony-testnet.citizenweb3.com',
      grpcNodeUrl: 'grpc.symphony-testnet.citizenweb3.com',
      lcdNodeUrl: 'https://api.symphony-testnet.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.symphony-testnet.citizenweb3.com/websocket',
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
      rpcNodeUrl: 'https://rpc.nillion-testnet.citizenweb3.com',
      grpcNodeUrl: 'grpc.nillion-testnet.citizenweb3.com',
      lcdNodeUrl: 'https://api.nillion-testnet.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.nillion-testnet.citizenweb3.com/websocket',
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
      rpcNodeUrl: 'https://rpc.artela-testnet.citizenweb3.com',
      grpcNodeUrl: 'grpc.artela-testnet.citizenweb3.com',
      lcdNodeUrl: 'https://api.artela-testnet.citizenweb3.com',
      wsNodeUrl: 'wss://rpc.artela-testnet.citizenweb3.com/websocket',
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
      rpcNodeUrl: 'https://rpc.space-pussy.cybernode.ai',
      grpcNodeUrl: 'grpc.space-pussy.cybernode.ai',
      lcdNodeUrl: 'https://lcd.space-pussy.cybernode.ai',
      wsNodeUrl: 'wss://rpc.space-pussy.cybernode.ai/websocket',
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
      rpcNodeUrl: 'https://nomic-rpc.polkachu.com',
      grpcNodeUrl: '',
      lcdNodeUrl: 'https://api.nomic.quokkastake.io',
      wsNodeUrl: 'wss://nomic-rpc.polkachu.com/websocket',
      mainRepo: 'https://github.com/nomic-io/nomic',
      docs: '',
      githubUrl: 'https://github.com/nomic-io',
      twitterUrl: 'https://x.com/nomicbtc',
    });
  } catch (e) {
    console.error(e);
  }
}

main();
