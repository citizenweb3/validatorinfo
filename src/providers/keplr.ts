import {  WalletProvider } from ".";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import { Chain, LcdNode, RpcNode } from '@prisma/client';

declare global {
  interface Window extends KeplrWindow {}
}
class KeplrProvider extends WalletProvider {
  getWallet() {
    const wallet = window.keplr;
    if (!wallet) throw Error("Keplr not found");
    return wallet;
  }

  async enable(chainId: string): Promise<void> {
    const wallet = this.getWallet();
    wallet.enable(chainId);
  }

  async suggestChain(chain: Chain & {rpcNodes: RpcNode[], lcdNodes: LcdNode[]}): Promise<void> {
    const wallet = this.getWallet();
    await wallet.experimentalSuggestChain({
      chainId: chain.chainId,
      chainName: chain.name,
      rpc: chain.rpcNodes[0].url,
      rest: chain.lcdNodes[0].url,
      bip44: {
        coinType: chain.coinType,
      },
      bech32Config: {
        bech32PrefixAccAddr: chain.bech32Prefix,
        bech32PrefixAccPub: chain.bech32Prefix + "pub",
        bech32PrefixValAddr: chain.bech32Prefix + "valoper",
        bech32PrefixValPub: chain.bech32Prefix + "valoperpub",
        bech32PrefixConsAddr: chain.bech32Prefix + "valcons",
        bech32PrefixConsPub: chain.bech32Prefix + "valconspub",
      },
      currencies: [
        {
          coinDenom: chain.denom,
          coinMinimalDenom: chain.minimalDenom,
          coinDecimals: chain.coinDecimals,
          coinGeckoId: chain.coinGeckoId,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: chain.denom,
          coinMinimalDenom: chain.minimalDenom,
          coinDecimals: chain.coinDecimals,
          coinGeckoId: chain.coinGeckoId,
          gasPriceStep: {
            low: 100000,
            average: 200000,
            high: 300000,
          },
        },
      ],
      stakeCurrency: {
        coinDenom: chain.denom,
        coinMinimalDenom: chain.minimalDenom,
        coinDecimals: chain.coinDecimals,
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

  async signProof(
    chainId: string,
  ) {
    const { cryptoRandomStringAsync } = await import("crypto-random-string");
    const keyHash = await cryptoRandomStringAsync({
      length: 32,
      type: "base64",
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
