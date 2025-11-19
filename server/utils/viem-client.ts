import { createPublicClient, http } from 'viem';

export const viemClient = (url: string) => {
  return createPublicClient({
    transport: http(url),
  });
};
