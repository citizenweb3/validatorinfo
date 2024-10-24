import { cosmos } from "@cosmostation/extension-client";
import { AddChainParams } from "@cosmostation/extension-client/types/message";
import { getOfflineSigner } from "@cosmostation/cosmos-client";
import { WalletProvider } from ".";
import { Chain, LcdNode, RpcNode } from '@prisma/client';

class CosmostationProvider extends WalletProvider {
  async getWallet() {
    const wallet = await cosmos();
    if (!wallet) throw Error("Cosmostation not found");
    return wallet;
  }

  async enable(chainId: string): Promise<void> {
    const client = await this.getWallet();
    client.getAccount(chainId);
  }

  async suggestChain(chain: Chain & {rpcNodes: RpcNode[], lcdNodes: LcdNode[]}) {
    const client = await this.getWallet();
    const activeChains = await client.getActivatedChainIds();
    if (
      activeChains &&
      activeChains.find((activeChain) => chain.chainId === activeChain)
    )
      return;
    const wallet = await cosmos();
    const chainConfig: AddChainParams = {
      chainId: chain.chainId,
      chainName: chain.name,
      addressPrefix: chain.bech32Prefix,
      baseDenom: chain.minimalDenom,
      displayDenom: chain.denom,
      restURL: chain.lcdNodes[0].url,
      coinGeckoId: chain.coinGeckoId,
      coinType: chain.coinType.toString(),
      decimals: chain.coinDecimals,
      gasRate: {
        average: "200000",
        low: "100000",
        tiny: "150000",
      },
      sendGas: "100000",
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
}

export const cosmostationWalletProvider = new CosmostationProvider();
