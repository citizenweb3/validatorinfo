import logger from '@/logger';

const { logDebug } = logger('fetch-data');

const fetchData: <T>(url: string) => Promise<T> = async (url) => {
  logDebug(`Fetching data from ${url}`);
  const result = await fetch(url).then((data) => data.json());
  logDebug(`Data fetched from ${url}: ${JSON.stringify(result)}`);
  return result;
};
export default fetchData;
