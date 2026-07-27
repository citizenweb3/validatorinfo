import 'server-only';

import atomoneIndexer from '@/services/atomone-indexer-api';
import cosmosIndexer from '@/services/cosmos-indexer-api';
import type { AccountGovVotesPage } from '@/utils/account-governance';
import type {
  AccountCoverage,
  AccountEarliestActivity,
  AccountStakingDeltasCursor,
  AccountStakingDeltasPage,
} from '@/utils/account-history';

type AccountIndexerRequestOptions = {
  cache?: RequestCache;
  timeout?: number;
};

export type AccountIndexerFactsClient = {
  getCoverage: (options?: AccountIndexerRequestOptions) => Promise<{ data: AccountCoverage } | null>;
  getEarliestActivity: (
    address: string,
    options?: AccountIndexerRequestOptions,
  ) => Promise<{
    data: { earliest: AccountEarliestActivity | null; coverage: AccountCoverage };
  } | null>;
  getStakingDeltas: (
    params: {
      delegator: string;
      limit?: number;
      before_height?: AccountStakingDeltasCursor['next_before_height'];
      before_index?: AccountStakingDeltasCursor['next_before_index'];
      before_msg_index?: AccountStakingDeltasCursor['next_before_msg_index'];
    },
    options?: AccountIndexerRequestOptions,
  ) => Promise<AccountStakingDeltasPage>;
  getGovVotes: (
    params: {
      voter: string;
      limit?: number;
      before_proposal_id?: string;
    },
    options?: AccountIndexerRequestOptions,
  ) => Promise<AccountGovVotesPage>;
};

const ACCOUNT_INDEXER_CLIENTS: Record<string, AccountIndexerFactsClient> = {
  atomone: atomoneIndexer,
  cosmoshub: cosmosIndexer,
};

export const getAccountIndexerFactsClient = (chainName: string): AccountIndexerFactsClient | null =>
  ACCOUNT_INDEXER_CLIENTS[chainName.toLowerCase()] ?? null;
