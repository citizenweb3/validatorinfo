import { sleep } from '@cosmjs/utils';

import logger from '@/logger';

const { logInfo, logDebug, logWarn } = logger('fetch-data');

const fetchData: <T>(url: string, sleepTime?: number, attempt?: number) => Promise<T> = async (
  url,
  sleepTime = 1000,
  attempt = 0,
) => {
  logInfo(`Fetching data from ${url}`);
  const result = await fetch(url);
  try {
    const data = await result.json();

    if (data.code) {
      throw new Error(`Error fetching data: ${data.code} ${data.message} - ${url}`);
    }

    logDebug(`Data fetched from ${url}: ${JSON.stringify(result)}`);
    return data;
  } catch {
    if (result.status === 404) {
      throw new Error(`Page not found ${url}`);
    }

    if (result.status === 429) {
      if (attempt < 5) {
        await sleep(sleepTime);
        return fetchData(url, sleepTime, attempt + 1);
      } else {
        throw new Error(`Can't resolve 429 error for ${url} after attempts: ${attempt + 1}`);
      }
    }

    throw new Error(`Fetch Error: ${result.status} ${result.statusText} ${url}`);
  }
};
export default fetchData;
