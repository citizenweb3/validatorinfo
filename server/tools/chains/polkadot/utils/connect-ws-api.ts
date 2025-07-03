import { ApiPromise, WsProvider } from '@polkadot/api';
import logger from '@/logger';

const { logError } = logger('polkadot-connect-api');

export const connectWsApi = async (wsUrls: string[], retries = 3): Promise<ApiPromise> => {
  let lastError: any = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    for (const url of wsUrls) {
      let provider: WsProvider | null = null;
      try {
        provider = new WsProvider(url, 10000);
        const api = await ApiPromise.create({ provider });
        await api.isReadyOrError;
        return api;
      } catch (e) {
        lastError = e;
        if (provider) {
          try {
            provider.disconnect();
          } catch (e) {
            logError(`Can't disconnect with url ${url}`);
          }
        }
        logError(`Connection attempt ${attempt} failed for ${url}: ${e}`);
      }
    }
    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    logError(`Retrying WebSocket connection: attempt ${attempt + 1} of ${retries}`);
  }
  throw lastError || new Error(`Can't connect to any ws url after ${retries} attempts`);
};
