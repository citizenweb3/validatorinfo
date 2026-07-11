import { NodeAuthzGrant, Prisma } from '@prisma/client';

import db from '@/db';

export type AuthzTabSlug = 'withdraw_rewards' | 'unjail' | 'transact' | 'vote';

interface AuthzGrantBase {
  id: number;
  granter: string;
  grantee: string;
  typeUrl: string;
  expiration: Date | null;
}

export type AuthzGrant =
  | (AuthzGrantBase & { kind: 'generic'; msgTypeUrl: string })
  | (AuthzGrantBase & { kind: 'send'; spendLimit: Array<{ denom: string; amount: string }> })
  | (AuthzGrantBase & {
      kind: 'stake';
      authorizationType: string;
      maxTokens: { denom: string; amount: string } | null;
      validators: { mode: 'allow' | 'deny' | 'any'; addresses: string[] };
    })
  | (AuthzGrantBase & { kind: 'unknown' });

type AuthzGrantRow = Pick<
  NodeAuthzGrant,
  'id' | 'granter' | 'grantee' | 'authorizationType' | 'msgTypeUrl' | 'authorizationData' | 'expiration'
>;

const WITHDRAW_REWARDS_MESSAGES = new Set([
  'MsgSetWithdrawAddress',
  'MsgWithdrawDelegatorReward',
  'MsgWithdrawValidatorCommission',
]);
const VOTE_MESSAGES = new Set(['MsgVote', 'MsgVoteWeighted']);

const isJsonObject = (value: Prisma.JsonValue | null): value is Prisma.JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readString = (value: Prisma.JsonValue | undefined): string | null =>
  typeof value === 'string' ? value : null;

const readCoin = (value: Prisma.JsonValue | undefined): { denom: string; amount: string } | null => {
  const jsonObject = value ?? null;
  if (!isJsonObject(jsonObject)) {
    return null;
  }

  const denom = readString(jsonObject.denom);
  const amount = readString(jsonObject.amount);

  return denom && amount ? { denom, amount } : null;
};

const readCoins = (value: Prisma.JsonValue | undefined): Array<{ denom: string; amount: string }> => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((coin) => {
    const parsedCoin = readCoin(coin);
    return parsedCoin ? [parsedCoin] : [];
  });
};

const readValidatorAddresses = (
  value: Prisma.JsonValue | undefined,
): { mode: 'allow' | 'deny' | 'any'; addresses: string[] } => {
  const jsonObject = value ?? null;
  if (!isJsonObject(jsonObject) || !Array.isArray(jsonObject.address)) {
    return { mode: 'any', addresses: [] };
  }

  return {
    mode: 'allow',
    addresses: jsonObject.address.filter((address): address is string => typeof address === 'string'),
  };
};

const getAuthorizationName = (typeUrl: string): string => typeUrl.split('.').pop() ?? typeUrl;

export const mapAuthzGrantRow = (row: AuthzGrantRow): AuthzGrant => {
  const base: AuthzGrantBase = {
    id: row.id,
    granter: row.granter,
    grantee: row.grantee,
    typeUrl: row.authorizationType,
    expiration: row.expiration,
  };
  const authorizationName = getAuthorizationName(row.authorizationType);

  if (authorizationName === 'GenericAuthorization' && row.msgTypeUrl) {
    return { ...base, kind: 'generic', msgTypeUrl: row.msgTypeUrl };
  }

  if (authorizationName === 'SendAuthorization' && isJsonObject(row.authorizationData)) {
    return { ...base, kind: 'send', spendLimit: readCoins(row.authorizationData.spend_limit) };
  }

  if (authorizationName === 'StakeAuthorization' && isJsonObject(row.authorizationData)) {
    const allowList = readValidatorAddresses(row.authorizationData.allow_list);
    const denyList = readValidatorAddresses(row.authorizationData.deny_list);
    const validators =
      allowList.addresses.length > 0
        ? allowList
        : denyList.addresses.length > 0
          ? { ...denyList, mode: 'deny' as const }
          : { mode: 'any' as const, addresses: [] };

    return {
      ...base,
      kind: 'stake',
      authorizationType: readString(row.authorizationData.authorization_type) ?? 'AUTHORIZATION_TYPE_UNSPECIFIED',
      maxTokens: readCoin(row.authorizationData.max_tokens),
      validators,
    };
  }

  return { ...base, kind: 'unknown' };
};

export const classifyGrantTab = (grant: AuthzGrant): AuthzTabSlug => {
  if (grant.kind !== 'generic') {
    return 'transact';
  }

  const messageName = grant.msgTypeUrl.split('.').pop() ?? grant.msgTypeUrl;

  if (WITHDRAW_REWARDS_MESSAGES.has(messageName)) {
    return 'withdraw_rewards';
  }

  if (messageName === 'MsgUnjail') {
    return 'unjail';
  }

  if (VOTE_MESSAGES.has(messageName)) {
    return 'vote';
  }

  return 'transact';
};

const getNodeAuthzGrants = async (nodeId: number, tab: AuthzTabSlug): Promise<AuthzGrant[]> => {
  const rows = await db.nodeAuthzGrant.findMany({
    where: { nodeId },
    orderBy: { id: 'asc' },
  });

  return rows.map(mapAuthzGrantRow).filter((grant) => classifyGrantTab(grant) === tab);
};

const authzService = {
  getNodeAuthzGrants,
};

export default authzService;
