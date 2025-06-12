import { getOfflineSigner } from '@cosmostation/cosmos-client';
import { cosmos } from '@cosmostation/extension-client';
import { AddChainParams } from '@cosmostation/extension-client/types/message';
import { ChainWithParams } from '@/services/chain-service';

import { WalletProvider } from '.';

class CosmostationProvider extends WalletProvider {
  async getWallet() {
    const wallet = await cosmos();
    if (!wallet) throw Error('Cosmostation not found');
    return wallet;
  }

  async enable(chainId: string): Promise<void> {
    const client = await this.getWallet();
    client.getAccount(chainId);
  }

  async suggestChain(chain: ChainWithParams & { rpcNode: string; lcdNode: string }) {
    const client = await this.getWallet();
    const activeChains = await client.getActivatedChainIds();
    if (activeChains && activeChains.find((activeChain) => chain.chainId === activeChain)) return;
    const wallet = await cosmos();
    const chainConfig: AddChainParams = {
      chainId: chain.chainId,
      chainName: chain.name,
      addressPrefix: chain.params?.bech32Prefix ?? '',
      baseDenom: chain.params?.minimalDenom ?? '',
      displayDenom: chain.params?.denom ?? '',
      restURL: chain.lcdNode,
      coinGeckoId: chain.coinGeckoId,
      coinType: chain.params?.coinType.toString(),
      decimals: chain.params?.coinDecimals,
      gasRate: {
        average: '200000',
        low: '100000',
        tiny: '150000',
      },
      sendGas: '100000',
    };
    await wallet.addChain(chainConfig);
  }

  async connect(chainId: string) {
    const wallet = await this.getWallet();
    const { name, address } = await wallet.getAccount(chainId);
    return {
      wallet: { chainId: chainId, address: address },
      walletName: name,
    };
  }

  getOfflineSigner(chainId: string) {
    return getOfflineSigner(chainId);
  }

  async signProof(chainId: string) {
    const { cryptoRandomStringAsync } = await import('crypto-random-string');
    const wallet = await this.getWallet();
    const signer = await wallet.getAccount(chainId);
    const key = await cryptoRandomStringAsync({
      length: 32,
      type: 'base64',
    });

    return {
      signature: await wallet.signMessage(chainId, signer.address, key),
      key: key,
    };
  }
}

export const cosmostationWalletProvider = new CosmostationProvider();
