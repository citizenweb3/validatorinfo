import { Window as KeplrWindow } from '@keplr-wallet/types';
import { Chain } from '@prisma/client';

import { WalletProvider } from '.';
import { ChainWithParams } from '@/services/chain-service';

declare global {
  interface Window extends KeplrWindow {}
}
class KeplrProvider extends WalletProvider {
  getWallet() {
    const wallet = window.keplr;
    if (!wallet) throw Error('Keplr not found');
    return wallet;
  }

  async enable(chainId: string): Promise<void> {
    const wallet = this.getWallet();
    wallet.enable(chainId);
  }

  async suggestChain(chain: ChainWithParams & { rpcNode: string; lcdNode: string }): Promise<void> {
    const wallet = this.getWallet();
    await wallet.experimentalSuggestChain({
      chainId: chain.chainId,
      chainName: chain.name,
      rpc: chain.rpcNode,
      rest: chain.lcdNode,
      bip44: {
        coinType: chain.params?.coinType ?? 0,
      },
      bech32Config: {
        bech32PrefixAccAddr: chain.params?.bech32Prefix ?? '',
        bech32PrefixAccPub: chain.params?.bech32Prefix + 'pub',
        bech32PrefixValAddr: chain.params?.bech32Prefix + 'valoper',
        bech32PrefixValPub: chain.params?.bech32Prefix + 'valoperpub',
        bech32PrefixConsAddr: chain.params?.bech32Prefix + 'valcons',
        bech32PrefixConsPub: chain.params?.bech32Prefix + 'valconspub',
      },
      currencies: [
        {
          coinDenom: chain.params?.denom ?? '',
          coinMinimalDenom: chain.params?.minimalDenom ?? '',
          coinDecimals: chain.params?.coinDecimals ?? 0,
          coinGeckoId: chain.coinGeckoId,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: chain.params?.denom ?? '',
          coinMinimalDenom: chain.params?.minimalDenom ?? '',
          coinDecimals: chain.params?.coinDecimals ?? 0,
          coinGeckoId: chain.coinGeckoId,
          gasPriceStep: {
            low: 100000,
            average: 200000,
            high: 300000,
          },
        },
      ],
      stakeCurrency: {
        coinDenom: chain.params?.denom ?? '',
        coinMinimalDenom: chain.params?.minimalDenom ?? '',
        coinDecimals: chain.params?.coinDecimals ?? 0,
        coinGeckoId: chain.coinGeckoId,
      },
    });
  }

  async connect(chainId: string) {
    const wallet = this.getWallet();
    const { bech32Address, name } = await wallet.getKey(chainId);

    return {
      wallet: { address: bech32Address, chainId: chainId },
      walletName: name,
    };
  }

  async getOfflineSigner(chainId: string) {
    const wallet = this.getWallet();
    return wallet.getOfflineSignerAuto(chainId, {
      preferNoSetFee: false,
      preferNoSetMemo: false,
    });
  }

  async signProof(chainId: string) {
    const { cryptoRandomStringAsync } = await import('crypto-random-string');
    const keyHash = await cryptoRandomStringAsync({
      length: 32,
      type: 'base64',
    });
    const wallet = this.getWallet();
    const { bech32Address } = await wallet.getKey(chainId);
    return {
      signature: await wallet.signArbitrary(chainId, bech32Address, keyHash),
      key: keyHash,
    };
  }
}

export const keplrWalletProvider = new KeplrProvider();
