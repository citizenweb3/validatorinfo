import { WALLETS } from "@/constants";
import { useAppSelector } from "./reduxHooks";
import { useMemo } from "react";

export const useWallet = () => {
  const { address, name, providerName, chainId } = useAppSelector(
    ({ reducer }) => reducer
  );

  return useMemo(() => {
    const providerEntry = WALLETS.find(({ label }) => label === providerName);
    if (providerEntry)
      return {
        provider: providerEntry.provider,
        address: address,
        name: name,
        chainId: chainId,
        providerName: providerName,
      };
  }, [address, name, providerName, chainId]);
};