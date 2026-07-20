const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_ENDPOINT_ATTEMPTS = 10;

type LcdRequestOptions = {
  fetcher?: typeof fetch;
  timeoutMs?: number;
};

const joinLcdUrl = (endpoint: string, path: string): string => {
  const normalizedEndpoint = endpoint.trim().replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${normalizedEndpoint}${normalizedPath}`);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`unsupported LCD endpoint protocol: ${url.protocol}`);
  }
  return url.toString();
};

export const fetchJsonWithFailover = async <T>(
  endpoints: readonly string[],
  path: string,
  options: LcdRequestOptions = {},
): Promise<T> => {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60_000) {
    throw new Error(`LCD timeout must be an integer between 1 and 60000: ${timeoutMs}`);
  }

  const candidates = Array.from(new Set(endpoints.map((endpoint) => endpoint.trim()).filter(Boolean))).slice(
    0,
    MAX_ENDPOINT_ATTEMPTS,
  );
  if (candidates.length === 0) throw new Error('no LCD endpoints are available');

  let lastError: unknown = null;
  for (const endpoint of candidates) {
    try {
      const url = joinLcdUrl(endpoint, path);
      const response = await (options.fetcher ?? fetch)(url, {
        cache: 'no-store',
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
    }
  }

  const message = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`all ${candidates.length} LCD endpoints failed: ${message}`);
};
