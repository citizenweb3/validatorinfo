import logger from '@/logger';
import {
  AddChainProps,
  AuthzJsonValue,
  GetNodeAuthzGrants,
  NodeAuthzGrantResult,
} from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError, logWarn } = logger('get-node-authz-grants');

interface LcdGrant {
  granter?: unknown;
  grantee?: unknown;
  authorization?: unknown;
  expiration?: unknown;
}

interface LcdGrantsResponse {
  grants?: unknown;
  pagination?: {
    next_key?: unknown;
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isJsonValue = (value: unknown): value is AuthzJsonValue => {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return true;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every(isJsonValue);
};

export const mapLcdAuthzGrant = (grant: LcdGrant): NodeAuthzGrantResult | null => {
  if (typeof grant.granter !== 'string' || typeof grant.grantee !== 'string' || !isRecord(grant.authorization)) {
    return null;
  }

  const { ['@type']: rawAuthorizationType, ...rawAuthorizationData } = grant.authorization;
  if (typeof rawAuthorizationType !== 'string' || !isJsonValue(rawAuthorizationData)) {
    return null;
  }

  const rawExpiration = grant.expiration;
  if (rawExpiration !== null && rawExpiration !== undefined && typeof rawExpiration !== 'string') {
    return null;
  }

  if (typeof rawExpiration === 'string' && Number.isNaN(Date.parse(rawExpiration))) {
    return null;
  }

  const rawMsgTypeUrl = grant.authorization.msg;

  return {
    granter: grant.granter,
    grantee: grant.grantee,
    authorizationType: rawAuthorizationType,
    msgTypeUrl: typeof rawMsgTypeUrl === 'string' ? rawMsgTypeUrl : null,
    authorizationData: rawAuthorizationData,
    expiration: typeof rawExpiration === 'string' ? rawExpiration : null,
  };
};

const getNodeAuthzGrants: GetNodeAuthzGrants = async (chain: AddChainProps, granterAddress: string) => {
  const grants: NodeAuthzGrantResult[] = [];
  const seenPaginationKeys = new Set<string>();
  let paginationKey: string | null = null;

  try {
    do {
      const paginationQuery: string = paginationKey
        ? `&pagination.key=${encodeURIComponent(paginationKey)}`
        : '';
      const url: string = `/cosmos/authz/v1beta1/grants/granter/${encodeURIComponent(granterAddress)}?pagination.limit=200${paginationQuery}`;
      const response: LcdGrantsResponse = await fetchChainData<LcdGrantsResponse>(chain.name, 'rest', url);

      if (!Array.isArray(response.grants)) {
        throw new Error('LCD authz response does not contain a grants array');
      }

      for (const rawGrant of response.grants) {
        if (!isRecord(rawGrant)) {
          logWarn(`${chain.name}: skipped malformed authz grant for ${granterAddress}`);
          continue;
        }

        const mappedGrant = mapLcdAuthzGrant(rawGrant);
        if (!mappedGrant) {
          logWarn(`${chain.name}: skipped malformed authz grant for ${granterAddress}`);
          continue;
        }

        grants.push(mappedGrant);
      }

      const rawNextKey: unknown = response.pagination?.next_key;
      paginationKey = typeof rawNextKey === 'string' && rawNextKey.length > 0 ? rawNextKey : null;

      if (paginationKey && seenPaginationKeys.has(paginationKey)) {
        throw new Error('LCD authz pagination returned a repeated next_key');
      }

      if (paginationKey) {
        seenPaginationKeys.add(paginationKey);
      }
    } while (paginationKey);

    return grants;
  } catch (error) {
    logError(`${chain.name}: failed to fetch authz grants for ${granterAddress}`, error);
    return null;
  }
};

export default getNodeAuthzGrants;
