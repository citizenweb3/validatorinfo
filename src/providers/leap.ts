import { SignOptions } from '@cosmostation/extension-client/types/message';
import {
  AminoSignResponse,
  BroadcastMode,
  OfflineAminoSigner,
  OfflineDirectSigner,
  StdSignDoc,
  StdSignature,
} from '@keplr-wallet/types';
import { ChainWithParams } from '@/services/chain-service';

import { OfflineSignerT, WalletProvider } from '.';

interface Key {
  name: string;
  algo: string;
  pubKey: Uint8Array;
  address: Uint8Array;
  bech32Address: string;
  isNanoLedger: boolean;
}

interface ChainInfo {
  readonly rpc: string;
  readonly rest: string;
  readonly chainId: string;
  readonly chainName: string;
  readonly stakeCurrency: {
    coinDenom: string;
    coinMinimalDenom: string;
    coinDecimals: number;
    coinGeckoId: string;
  };
  readonly walletUrlForStaking?: string;
  readonly bip44: {
    coinType: number;
  };
  readonly bech32Config: {
    bech32PrefixAccAddr: string;
    bech32PrefixAccPub: string;
    bech32PrefixValAddr: string;
    bech32PrefixValPub: string;
    bech32PrefixConsAddr: string;
    bech32PrefixConsPub: string;
  };
  readonly currencies: [
    {
      coinDenom: string;
      coinMinimalDenom: string;
      coinDecimals: number;
      coinGeckoId: string;
    },
  ];
  readonly feeCurrencies: [
    {
      coinDenom: string;
      coinMinimalDenom: string;
      coinDecimals: number;
      coinGeckoId: string;
      gasPriceStep: { low: number; avergage: number; high: number };
    },
  ];
  readonly features?: string[];
  theme: {
    primaryColor: string;
    gradient: string;
  };
  image: string;
}

declare global {
  interface Window {
    leap: {
      getKey(chainId: string): Promise<Key>;
      suggestCW20Token(chainId: string, contractAddress: string): Promise<void>;
      experimentalSuggestChain(chain: ChainInfo): Promise<void>;
      enable(chainId: string | Array<string>): Promise<void>;
      getSupportedChains(): Promise<string>;
      getOfflineSignerAuto(chainId: string): Promise<OfflineAminoSigner | OfflineDirectSigner> | undefined;
      getOfflineSignerOnlyAmino(chainId: string): Promise<OfflineAminoSigner> | undefined;
      signArbitrary(chainId: string, signerAddress: string, data: string | Uint8Array): Promise<StdSignature>;
      sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array>;
      signAmino(
        chainId: string,
        signer: string,
        signDoc: StdSignDoc,
        signOptions?: SignOptions,
      ): Promise<AminoSignResponse>;
    };
  }
}

class LeapProvider extends WalletProvider {
  getWallet() {
    if (!window.leap) throw Error('Leap not found.');
    return window.leap;
  }

  async enable(chainId: string): Promise<void> {
    const wallet = this.getWallet();
    wallet.enable(chainId);
  }

  async suggestChain(chain: ChainWithParams & { rpcNode: string; lcdNode: string }) {
    const chainConfig: ChainInfo = {
      chainId: chain.chainId,
      chainName: chain.name,
      bech32Config: {
        bech32PrefixAccAddr: chain.params?.bech32Prefix ?? '',
        bech32PrefixAccPub: chain.params?.bech32Prefix + 'pub',
        bech32PrefixValAddr: chain.params?.bech32Prefix + 'valoper',
        bech32PrefixValPub: chain.params?.bech32Prefix + 'valoperpub',
        bech32PrefixConsAddr: chain.params?.bech32Prefix + 'valcons',
        bech32PrefixConsPub: chain.params?.bech32Prefix + 'valconspub',
      },
      rest: chain.lcdNode,
      rpc: chain.rpcNode,
      bip44: {
        coinType: chain.params?.coinType ?? 0,
      },
      image: '',
      currencies: [
        {
          coinMinimalDenom: chain.params?.minimalDenom ?? '',
          coinDenom: chain.params?.denom ?? '',
          coinDecimals: chain.params?.coinDecimals ?? 0,
          coinGeckoId: chain.coinGeckoId,
        },
      ],
      stakeCurrency: {
        coinMinimalDenom: chain.params?.minimalDenom ?? '',
        coinDenom: chain.params?.denom ?? '',
        coinDecimals: chain.params?.coinDecimals ?? 0,
        coinGeckoId: chain.coinGeckoId,
      },
      feeCurrencies: [
        {
          coinMinimalDenom: chain.params?.minimalDenom ?? '',
          coinDenom: chain.params?.denom ?? '',
          coinDecimals: chain.params?.coinDecimals ?? 0,
          coinGeckoId: chain.coinGeckoId,
          gasPriceStep: {
            low: 100000,
            avergage: 200000,
            high: 300000,
          },
        },
      ],
      walletUrlForStaking: '',
      theme: {
        primaryColor: '#fff',
        gradient: 'linear-gradient(180deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0) 100%)',
      },
    };

    const wallet = this.getWallet();

    await wallet.experimentalSuggestChain(chainConfig);
  }

  async connect(chainId: string) {
    const wallet = this.getWallet();
    await wallet.enable(chainId);
    const { name, bech32Address } = await wallet.getKey(chainId);

    return {
      walletName: name,
      wallet: {
        chainId: chainId,
        address: bech32Address,
      },
    };
  }

  async getOfflineSigner(chainId: string) {
    const wallet = this.getWallet();
    return wallet.getOfflineSignerAuto(chainId) as unknown as OfflineSignerT;
  }

  async signProof(chainId: string) {
    const { cryptoRandomStringAsync } = await import('crypto-random-string');
    const wallet = this.getWallet();
    const { bech32Address } = await wallet.getKey(chainId);
    const key = await cryptoRandomStringAsync({ length: 32, type: 'base64' });
    return {
      signature: await wallet.signArbitrary(chainId, bech32Address, key),
      key: key,
    };
  }
}

export const leapWalletProvider = new LeapProvider();
