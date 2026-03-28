import net from 'net';

import db from '@/db';
import logger from '@/logger';

const { logError, logInfo } = logger('check-nodes-health');

interface HealthCheckResult {
  success: boolean;
  responseTime: number | null;
  error?: string;
}

async function checkRpcHealth(url: string): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'status',
        params: [],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      if (data.result) {
        return { success: true, responseTime };
      }
    }

    return {
      success: false,
      responseTime: null,
      error: `Invalid response: ${response.status}`,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    return {
      success: false,
      responseTime: null,
      error: error.message || 'Unknown error',
    };
  }
}

async function checkRestHealth(url: string): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    let endpoint = `${url}/cosmos/base/tendermint/v1beta1/blocks/latest`;

    const response = await fetch(endpoint, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.status === 404) {
      const legacyStartTime = Date.now();
      const legacyController = new AbortController();
      const legacyTimeoutId = setTimeout(() => legacyController.abort(), 5000);

      try {
        const legacyResponse = await fetch(`${url}/blocks/latest`, {
          signal: legacyController.signal,
        });

        clearTimeout(legacyTimeoutId);
        const legacyResponseTime = Date.now() - legacyStartTime;

        if (legacyResponse.ok) {
          return { success: true, responseTime: legacyResponseTime };
        }
      } catch (legacyError: any) {
        clearTimeout(legacyTimeoutId);
        return {
          success: false,
          responseTime: null,
          error: legacyError.message || 'Unknown error',
        };
      }
    }

    if (response.ok) {
      return { success: true, responseTime };
    }

    return {
      success: false,
      responseTime: null,
      error: `HTTP ${response.status}`,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    return {
      success: false,
      responseTime: null,
      error: error.message || 'Unknown error',
    };
  }
}

async function checkGenericHealth(url: string): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return { success: true, responseTime };
    }

    return {
      success: false,
      responseTime: null,
      error: `HTTP ${response.status}`,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    return {
      success: false,
      responseTime: null,
      error: error.message || 'Unknown error',
    };
  }
}

async function checkGrpcHealth(url: string): Promise<HealthCheckResult> {
  const startTime = Date.now();

  return new Promise((resolve) => {
    try {
      let host = url.replace(/^https?:\/\//, '').replace(/^grpc:\/\//, '');
      let port = 9090;

      const portMatch = host.match(/:(\d+)$/);
      if (portMatch) {
        port = parseInt(portMatch[1], 10);
        host = host.replace(/:\d+$/, '');
      }

      host = host.replace(/\/.*$/, '');

      const socket = new net.Socket();
      const timeout = 5000;

      socket.setTimeout(timeout);

      socket.on('connect', () => {
        const responseTime = Date.now() - startTime;
        socket.destroy();
        resolve({ success: true, responseTime });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ success: false, responseTime: null, error: 'Connection timeout' });
      });

      socket.on('error', (err: Error) => {
        socket.destroy();
        resolve({ success: false, responseTime: null, error: err.message || 'Connection failed' });
      });

      socket.connect(port, host);
    } catch (error: any) {
      resolve({ success: false, responseTime: null, error: error.message || 'Unknown error' });
    }
  });
}

async function checkWsHealth(url: string): Promise<HealthCheckResult> {
  const startTime = Date.now();

  return new Promise((resolve) => {
    try {
      let wsUrl = url;
      if (wsUrl.startsWith('http://')) {
        wsUrl = wsUrl.replace('http://', 'ws://');
      } else if (wsUrl.startsWith('https://')) {
        wsUrl = wsUrl.replace('https://', 'wss://');
      } else if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
        wsUrl = `wss://${wsUrl}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const httpUrl = wsUrl.replace('wss://', 'https://').replace('ws://', 'http://');

      fetch(httpUrl, {
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade',
          'Sec-WebSocket-Key': Buffer.from(Math.random().toString()).toString('base64'),
          'Sec-WebSocket-Version': '13',
        },
        signal: controller.signal,
      })
        .then((response) => {
          clearTimeout(timeoutId);
          const responseTime = Date.now() - startTime;

          if (response.status === 101) {
            resolve({ success: true, responseTime });
          } else {
            resolve({ success: false, responseTime: null, error: `HTTP ${response.status}` });
          }
        })
        .catch((error: any) => {
          clearTimeout(timeoutId);
          const responseTime = Date.now() - startTime;

          if (error.code === 'ERR_INVALID_PROTOCOL') {
            return resolve({ success: true, responseTime });
          }

          resolve({ success: false, responseTime: null, error: error.message || 'WebSocket connection failed' });
        });
    } catch (error: any) {
      resolve({ success: false, responseTime: null, error: error.message || 'Unknown error' });
    }
  });
}

async function checkNamadaIndexerHealth(url: string): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const endpoint = `${url}/api/v1/chain/parameters`;
    const response = await fetch(endpoint, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return { success: true, responseTime };
    }

    return { success: false, responseTime: null, error: `HTTP ${response.status}` };
  } catch (error: any) {
    clearTimeout(timeoutId);
    return { success: false, responseTime: null, error: error.message || 'Unknown error' };
  }
}

interface NodeHealthUpdate {
  nodeId: number;
  status: string;
  responseTime: number | null;
  consecutiveFailures: number;
  chainName: string;
  type: string;
  success: boolean;
}

async function checkNodeHealth(
  nodeId: number,
  url: string,
  type: string,
  chainName: string,
  currentConsecutiveFailures: number,
): Promise<NodeHealthUpdate | null> {
  let result: HealthCheckResult;

  const normalizedUrl = url.endsWith('/') ? url.slice(0, -1) : url;

  logInfo(`Checking ${chainName}/${type}: ${normalizedUrl}`);

  switch (type) {
    case 'rpc':
      result = await checkRpcHealth(normalizedUrl);
      break;
    case 'rest':
    case 'lcd':
      result = await checkRestHealth(normalizedUrl);
      break;
    case 'grpc':
      result = await checkGrpcHealth(normalizedUrl);
      break;
    case 'ws':
      result = await checkWsHealth(normalizedUrl);
      break;
    case 'masp-indexer':
      result = await checkNamadaIndexerHealth(normalizedUrl);
      break;
    case 'indexer':
    case 'interface':
    case 'entry':
    case 'exit':
    default:
      result = await checkGenericHealth(normalizedUrl);
      break;
  }

  let newStatus: string;
  let newConsecutiveFailures: number;

  if (result.success) {
    newStatus = 'active';
    newConsecutiveFailures = 0;
    logInfo(`✓ ${chainName}/${type}: ${result.responseTime}ms`);
  } else {
    newConsecutiveFailures = currentConsecutiveFailures + 1;
    newStatus = 'inactive';
    logError(`✗ ${chainName}/${type}: ${result.error} (failures: ${newConsecutiveFailures})`);
  }

  return {
    nodeId,
    status: newStatus,
    responseTime: result.responseTime,
    consecutiveFailures: newConsecutiveFailures,
    chainName,
    type,
    success: result.success,
  };
}

const BATCH_SIZE = 100;

async function updateNodesInBatches(updates: NodeHealthUpdate[]): Promise<void> {
  const timestamp = new Date();

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);

    await db.$transaction(
      batch.map((update) =>
        db.chainNode.update({
          where: { id: update.nodeId },
          data: {
            status: update.status,
            lastCheckedAt: timestamp,
            responseTime: update.responseTime,
            consecutiveFailures: update.consecutiveFailures,
          },
        })
      )
    );

    if (i + BATCH_SIZE < updates.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

async function checkNodesHealth(): Promise<void> {
  try {
    const chainNodes = await db.chainNode.findMany({
      include: {
        chain: true,
      },
      orderBy: {
        chainId: 'asc',
      },
    });

    logInfo(`Starting health check for ${chainNodes.length} chain nodes`);

    const updates: NodeHealthUpdate[] = [];
    let skippedCount = 0;

    for (const node of chainNodes) {
      if (!node.url) {
        logError(`Skipping node ${node.id} - no URL`);
        skippedCount++;
        continue;
      }

      try {
        const result = await checkNodeHealth(
          node.id,
          node.url,
          node.type,
          node.chain.name,
          node.consecutiveFailures,
        );

        if (result) {
          updates.push(result);
        }
      } catch (error: any) {
        logError(`Error checking node ${node.id} (${node.chain.name}/${node.type}):`, error);
      }
    }

    logInfo(`Updating ${updates.length} nodes in database (batches of ${BATCH_SIZE})...`);

    await updateNodesInBatches(updates);

    const activeCount = updates.filter((u) => u.success).length;
    const inactiveCount = updates.filter((u) => !u.success).length;

    logInfo(`Health check completed: ${activeCount} active, ${inactiveCount} inactive, ${skippedCount} skipped`);
  } catch (error) {
    logError('Fatal error in health check job:', error);
    throw error;
  }
}

export default checkNodesHealth;
