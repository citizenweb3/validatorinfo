import { OfflineAminoSigner, OfflineDirectSigner } from "@keplr-wallet/types";

export type ConnectionResult = {
  wallet: { chainId: string; address: string };
  walletName: string;
};

export type OfflineSignerT = OfflineAminoSigner | OfflineDirectSigner;

export abstract class WalletProvider {
  abstract suggestChain(chain: any): Promise<void>;
  abstract enable(chainId: string): Promise<void>;
  abstract connect(chainId: string): Promise<ConnectionResult>;
  abstract getOfflineSigner(chainId: string): Promise<OfflineSignerT>;
}