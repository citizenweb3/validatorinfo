import { mkdir, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';

import logger from '@/logger';

const { logError, logInfo } = logger('update-staking-page-json');

const SOURCE_URL = 'https://raw.githubusercontent.com/citizenweb3/staking/config/networks.json';
const LOCAL_PATH = resolve(process.cwd(), 'uploads/networks.json');

const updateStakingPageJson = async () => {
  try {
    const res = await fetch(SOURCE_URL);
    if (!res.ok) {
      logError(`Error fetching staking page json from ${SOURCE_URL}`);
      return;
    }
    const text = await res.text();

    try {
      JSON.parse(text);
    } catch {
      logError('Fetched staking networks.json is not valid JSON!');
      return;
    }

    try {
      await mkdir(dirname(LOCAL_PATH), { recursive: true });
      await writeFile(LOCAL_PATH, text);
    } catch (e) {
      console.error('Write error:', e);
    }

    logInfo(`Staking networks json updated`);
  } catch (e) {
    logError(`Error getting and writing new networks json: ${e}`);
    return;
  }
};

export default updateStakingPageJson;
