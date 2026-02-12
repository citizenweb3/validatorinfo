import logger from '@/logger';

import { AztecIndexerRequestOptions } from './types';


const { logDebug, logError } = logger('aztec-indexer-client');

type QueryParamValue = string | number | boolean | undefined | null;

export type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

const DEFAULT_TIMEOUT = 30000;

export const buildQueryString = (params: QueryParams): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      });
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

export const buildUrl = (path: string, params?: QueryParams): string => {
  const baseUrl = `${process.env.AZTEC_INDEXER_BASE_URL}${path}`;

  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const queryString = buildQueryString(params);
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

const buildHeaders = (customHeaders?: HeadersInit): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (customHeaders) {
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, customHeaders);
    }
  }

  return headers;
};

const buildNextOptions = (options?: AztecIndexerRequestOptions): RequestInit => {
  const nextOptions: RequestInit = {};
  const hasRevalidate = options?.revalidate !== undefined;
  const hasTags = options?.tags && options.tags.length > 0;

  if (hasRevalidate || hasTags) {
    // next.revalidate and cache are mutually exclusive in Next.js fetch
    (nextOptions as any).next = {
      ...(hasRevalidate && { revalidate: options.revalidate }),
      ...(hasTags && { tags: options.tags }),
    };
  } else if (options?.cache !== undefined) {
    nextOptions.cache = options.cache;
  } else {
    nextOptions.cache = 'no-store';
  }

  return nextOptions;
};

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms: ${url}`);
    }

    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Network error: ${errorMsg} (URL: ${url})`);
  } finally {
    clearTimeout(timeoutId);
  }
};

const safeJsonParse = async <T>(response: Response, url: string): Promise<T> => {
  const contentType = response.headers.get('content-type');

  if (contentType && !contentType.includes('application/json')) {
    const text = await response.text().catch(() => '[unable to read response]');
    throw new Error(
      `Failed to parse JSON response: Expected JSON, got content-type: ${contentType} (URL: ${url}, Status: ${response.status})`,
    );
  }

  try {
    const data = await response.json();
    return data as T;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse JSON response: ${errorMsg} (URL: ${url}, Status: ${response.status})`);
  }
};

const request = async <T>(
  url: string,
  method: string,
  options?: AztecIndexerRequestOptions,
  body?: unknown,
): Promise<T> => {
  const timeout = options?.timeout || DEFAULT_TIMEOUT;

  logDebug(`${method} ${url}`);

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method,
        headers: buildHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
        signal: options?.signal,
        ...buildNextOptions(options),
      },
      timeout,
    );

    if (!response.ok) {
      const text = await response.text().catch(() => '');

      let errorBody = text;
      try {
        const errorJson = JSON.parse(text);
        errorBody = errorJson.message || errorJson.error || text;
      } catch {}

      logError(`${method} ${url} failed: HTTP ${response.status} ${response.statusText}`, { body: errorBody });

      throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorBody} (URL: ${url})`);
    }

    const data = await safeJsonParse<T>(response, url);

    logDebug(`${method} ${url} success`);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    logError(`${method} ${url} unexpected error:`, error);
    throw new Error(`Unexpected error: ${String(error)} (URL: ${url})`);
  }
};

export const get = async <T>(
  path: string,
  params?: QueryParams | null,
  options?: AztecIndexerRequestOptions,
): Promise<T> => {
  const url = buildUrl(path, params || undefined);
  return request<T>(url, 'GET', options);
};

export const post = async <T, B = unknown>(
  path: string,
  body?: B,
  options?: AztecIndexerRequestOptions,
): Promise<T> => {
  const url = buildUrl(path);
  return request<T>(url, 'POST', options, body);
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    await get('/l2/info', null, { timeout: 5000, cache: 'no-store' });
    return true;
  } catch {
    return false;
  }
};

export const getBaseUrl = (): string => {
  return process.env.AZTEC_INDEXER_BASE_URL || '';
};
