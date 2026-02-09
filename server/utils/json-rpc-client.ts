import logger from '@/logger';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: any[];
}

interface JsonRpcResponse<T> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

const validateRpcUrl = (url: string): void => {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`Invalid protocol: ${parsed.protocol}. Only http: and https: are allowed`);
    }
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error(`Invalid RPC URL format: ${url}`);
    }
    throw e;
  }
};

const isRetryableError = (error: any): boolean => {
  const errorMessage = error?.message?.toLowerCase() || '';
  return (
    errorMessage.includes('timeout') ||
    errorMessage.includes('econnreset') ||
    errorMessage.includes('econnrefused') ||
    errorMessage.includes('etimedout') ||
    errorMessage.includes('network') ||
    errorMessage.includes('fetch failed') ||
    errorMessage.includes('429') ||
    errorMessage.includes('503') ||
    errorMessage.includes('504')
  );
};

export const jsonRpcClient = async <T>(
  rpcUrl: string,
  method: string,
  params?: any[],
  loggerName = 'json-rpc-client',
  timeoutMs = 30000,
): Promise<T> => {
  const { logError } = logger(loggerName);

  try {
    validateRpcUrl(rpcUrl);
  } catch (e) {
    logError(`URL validation failed for ${rpcUrl}:`, e);
    throw e;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params: params ?? [],
      } as JsonRpcRequest),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorMsg = `HTTP ${res.status} for method ${method} on ${rpcUrl}`;
      logError(errorMsg);
      throw new Error(errorMsg);
    }

    let data: JsonRpcResponse<T>;
    try {
      data = await res.json();
    } catch (e) {
      logError(`Response is not valid JSON for method ${method}:`, e);
      throw new Error(`Invalid JSON response from ${rpcUrl}`);
    }

    if (!data || typeof data !== 'object') {
      logError(`Unexpected response for method ${method}: ${JSON.stringify(data)}`);
      throw new Error(`Unexpected response format from ${rpcUrl}`);
    }

    if ('error' in data && data.error) {
      const rpcError = `RPC error [${data.error.code}]: ${data.error.message}`;
      logError(`${rpcError} (method: ${method}, url: ${rpcUrl})`);
      throw new Error(rpcError);
    }

    if (!('result' in data)) {
      logError(`No result in JSON-RPC response: ${JSON.stringify(data)}`);
      throw new Error(`No result in RPC response from ${rpcUrl}`);
    }

    return data.result as T;
  } catch (e: any) {
    clearTimeout(timeoutId);

    if (e.name === 'AbortError') {
      const timeoutError = `RPC request timeout after ${timeoutMs}ms (method: ${method}, url: ${rpcUrl})`;
      logError(timeoutError);
      throw new Error(timeoutError);
    }

    const errorContext = `method: ${method}, url: ${rpcUrl}`;
    if (e.message && !e.message.includes(rpcUrl)) {
      e.message = `${e.message} (${errorContext})`;
    }
    logError(`RPC call failed: ${errorContext}`, e);
    throw e;
  }
};

export const jsonRpcClientWithRetry = async <T>(
  rpcUrl: string,
  method: string,
  params?: any[],
  loggerName = 'json-rpc-client',
  timeoutMs = 30000,
  retries = 3,
  baseDelayMs = 1000,
): Promise<T> => {
  const { logWarn } = logger(loggerName);

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await jsonRpcClient<T>(rpcUrl, method, params, loggerName, timeoutMs);
    } catch (e: any) {
      const isLastAttempt = attempt === retries - 1;

      if (!isRetryableError(e)) {
        throw e;
      }

      if (isLastAttempt) {
        throw new Error(`Failed after ${retries} attempts: ${e.message}`);
      }

      const delay = baseDelayMs * Math.pow(2, attempt);
      logWarn(`Attempt ${attempt + 1}/${retries} failed: ${e.message}. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Retry logic failed unexpectedly');
};

export const jsonRpcClientWithFailover = async <T>(
  rpcUrls: string[],
  method: string,
  params?: any[],
  loggerName = 'json-rpc-client',
  timeoutMs = 30000,
  retriesPerEndpoint = 2,
): Promise<T> => {
  const { logError, logWarn, logInfo } = logger(loggerName);

  if (!rpcUrls || rpcUrls.length === 0) {
    throw new Error('No RPC URLs provided for failover');
  }

  let lastError: any = null;
  const attemptedUrls: string[] = [];

  for (const rpcUrl of rpcUrls) {
    attemptedUrls.push(rpcUrl);

    try {
      logInfo(`Trying RPC endpoint: ${rpcUrl} (method: ${method})`);
      return await jsonRpcClientWithRetry<T>(
        rpcUrl,
        method,
        params,
        loggerName,
        timeoutMs,
        retriesPerEndpoint,
        1000,
      );
    } catch (e: any) {
      lastError = e;
      logWarn(`RPC endpoint ${rpcUrl} failed: ${e.message}`);

      if (rpcUrl !== rpcUrls[rpcUrls.length - 1]) {
        logInfo(`Failing over to next RPC endpoint...`);
      }
    }
  }

  const failureMsg = `All ${rpcUrls.length} RPC endpoints failed for method ${method}. Attempted: ${attemptedUrls.join(', ')}`;
  logError(failureMsg);
  throw new Error(`${failureMsg}. Last error: ${lastError?.message || 'Unknown error'}`);
};
