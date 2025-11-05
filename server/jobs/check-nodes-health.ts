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

  if (type === 'ws' || type === 'grpc') {
    logError(`Skipping ${type} node (not suitable for HTTP health checks)`);
    return null;
  }

  switch (type) {
    case 'rpc':
      result = await checkRpcHealth(normalizedUrl);
      break;
    case 'rest':
    case 'lcd':
      result = await checkRestHealth(normalizedUrl);
      break;
    case 'indexer':
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

      if (node.type === 'ws' || node.type === 'grpc') {
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

    logInfo(`Updating ${updates.length} nodes in database...`);

    const timestamp = new Date();
    await db.$transaction(
      updates.map((update) =>
        db.chainNode.update({
          where: { id: update.nodeId },
          data: {
            status: update.status,
            lastCheckedAt: timestamp,
            responseTime: update.responseTime,
            consecutiveFailures: update.consecutiveFailures,
          },
        }),
      ),
    );

    const activeCount = updates.filter((u) => u.success).length;
    const inactiveCount = updates.filter((u) => !u.success).length;

    logInfo(`Health check completed: ${activeCount} active, ${inactiveCount} inactive, ${skippedCount} skipped`);
  } catch (error) {
    logError('Fatal error in health check job:', error);
    throw error;
  }
}

export default checkNodesHealth;
