import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Github {
  url: string;
  mainRepo: string;
}

export async function addNetwork(
  chainId: string,
  name: string,
  denom: string,
  minimalDenom: string,
  logoUrl: string,
  walletUrlForStaking: string,
  coinGeckoId: string,
  bech32Prefix: string,
  lcdNodeUrl: string,
  rpcNodeUrl: string,
  grpcNodeUrl: string,
  coinDecimals: number,
  coinType: number,
  twitterUrl: string,
  docs: string | null = null,
  mainRepo: string,
  githubUrl: string,
) {
  await prisma.chain.upsert({
    where: { chainId },
    update: {},
    create: {
      chainId,
      name,
      denom,
      minimalDenom,
      coinDecimals,
      coinType,
      logoUrl,
      walletUrlForStaking,
      coinGeckoId,
      bech32Prefix,
      twitterUrl,
      docs,
      github: {
        create: {
          url: githubUrl,
          mainRepo: mainRepo,
        },
      },
      lcdNodes: {
        create: {
          url: lcdNodeUrl,
        },
      },
      rpcNodes: {
        create: {
          url: rpcNodeUrl,
        },
      },
      grpc: {
        create: {
          url: grpcNodeUrl,
        },
      },
    },
  });
}
