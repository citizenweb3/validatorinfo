import { Chain } from '@prisma/client';

import logger from '@/logger';
import { GetChainUptime } from '@/server/tools/chains/chain-indexer';
import { LogosStats } from '@/server/tools/chains/logos-testnet/types';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logWarn } = logger('logos-chain-uptime');

const CRYPTARCHIA_SLOT_DURATION_MS = 2000;
const REQUEST_TIMEOUT_MS = 8000;

const getChainUptime: GetChainUptime = async (dbChain: Chain) => {
  const token = process.env.LOGOS_INDEXER_API_TOKEN;

  if (!token) {
    logWarn(`${dbChain.name} - LOGOS_INDEXER_API_TOKEN not set, skipping uptime fetch`);
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const params = getChainParams(dbChain.name);
    const indexerUrl = params.nodes.find((n) => n.type === 'indexer')?.url;

    if (!indexerUrl) {
      logError(`${dbChain.name} - no indexer URL in params.ts nodes`);
      return null;
    }

    const res = await fetch(`${indexerUrl}/api/v1/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });

    if (!res.ok) {
      logError(`${dbChain.name} - indexer /api/v1/stats returned ${res.status}`);
      return null;
    }

    const stats = (await res.json()) as LogosStats;

    if (!Number.isFinite(stats.node_height) || stats.node_height < 0) {
      logError(`${dbChain.name} - invalid node_height in stats; response keys: ${Object.keys(stats).join(',')}`);
      return null;
    }

    return {
      lastUptimeUpdated: new Date(),
      uptimeHeight: stats.node_height,
      avgTxInterval: CRYPTARCHIA_SLOT_DURATION_MS,
    };
  } catch (e) {
    logError(`${dbChain.name} - fetch /api/v1/stats failed`, e);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export default getChainUptime;
