import logger from '@/logger';
import getCurrentEpoch from '@/server/tools/chains/aztec/utils/get-current-epoch';
import getCurrentSlot from '@/server/tools/chains/aztec/utils/get-current-slot';
import getEpochProgressUtil, { EpochProgress } from '@/server/tools/chains/aztec/utils/get-epoch-progress';
import { getPayloadUriUtil } from '@/server/tools/chains/aztec/utils/get-payload-uri-util';

import { getAztecGovernanceDataFromDb } from '@/services/aztec-governance-db';
import { CACHE_KEYS, CACHE_TTL, cacheGetOrFetch } from '@/services/redis-cache';

const { logDebug } = logger('aztec-contracts-service');

const getLatestSlot = async (chainName: string): Promise<string | null> => {
  return cacheGetOrFetch(
    CACHE_KEYS.aztec.latestSlot(chainName),
    async () => {
      const latestSlot = await getCurrentSlot(chainName);
      return latestSlot ? String(latestSlot) : null;
    },
    CACHE_TTL.SHORT,
  );
};

const getLatestEpoch = async (chainName: string): Promise<string | null> => {
  return cacheGetOrFetch(
    CACHE_KEYS.aztec.latestEpoch(chainName),
    async () => {
      const latestEpoch = await getCurrentEpoch(chainName);
      return latestEpoch ? String(latestEpoch) : null;
    },
    CACHE_TTL.SHORT,
  );
};

const getActiveAttesterCount = async (chainName: string): Promise<number | null> => {
  const dbData = await getAztecGovernanceDataFromDb(chainName);
  if (dbData?.activeAttesterCount !== null && dbData?.activeAttesterCount !== undefined) {
    logDebug(`${chainName}: activeAttesterCount from DB: ${dbData.activeAttesterCount}`);
    return dbData.activeAttesterCount;
  }
  logDebug(`${chainName}: activeAttesterCount not available in DB`);
  return null;
};

const getCommitteeSize = async (chainName: string): Promise<number | null> => {
  const dbData = await getAztecGovernanceDataFromDb(chainName);
  if (dbData?.committeeSize !== null && dbData?.committeeSize !== undefined) {
    logDebug(`${chainName}: committeeSize from DB: ${dbData.committeeSize}`);
    return dbData.committeeSize;
  }
  logDebug(`${chainName}: committeeSize not available in DB`);
  return null;
};

const getEpochProgress = async (chainName: string): Promise<EpochProgress | null> => {
  return cacheGetOrFetch(
    CACHE_KEYS.aztec.epochProgress(chainName),
    async () => getEpochProgressUtil(chainName),
    CACHE_TTL.SHORT,
  );
};

const getPayloadUri = async (payloadAddress: string, chainName: string): Promise<string | null> => {
  return cacheGetOrFetch(
    CACHE_KEYS.aztec.payloadUri(chainName, payloadAddress),
    async () => getPayloadUriUtil(payloadAddress, chainName),
    CACHE_TTL.STATIC,
  );
};

const aztecContractService = {
  getLatestSlot,
  getLatestEpoch,
  getActiveAttesterCount,
  getEpochProgress,
  getCommitteeSize,
  getPayloadUri,
};

export default aztecContractService;
