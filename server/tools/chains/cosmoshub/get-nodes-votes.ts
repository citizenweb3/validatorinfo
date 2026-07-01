import cosmosIndexer from '@/services/cosmos-indexer-api';
import logger from '@/logger';
import { GetNodesVotes, NodeVote } from '@/server/tools/chains/chain-indexer';
import { fromValoperToAccount } from '@/utils/cosmos-address-converter';

const { logError } = logger('cosmos-nodes-votes');

const PAGE_LIMIT = 100;
const MAX_PAGES = 1000;

// Only cosmoshub has a populated cosmos-indexer-api deployment (a single
// COSMOS_INDEXER_BASE_URL = cosmoshub-4). This method lives in the shared cosmoshub methods
// reused by other cosmos chains, so guard on chain.name to avoid querying the wrong indexer.
const getNodesVotes: GetNodesVotes = async (chain, operatorAddress) => {
  if (chain.name !== 'cosmoshub') return [];

  // gov.votes is keyed by the voter ACCOUNT address; the job passes the validator operator
  // (valoper) address, so convert it. Same bech32 payload, different prefix.
  const voter = fromValoperToAccount(operatorAddress, chain.bech32Prefix);
  if (!voter) return [];

  try {
    const votes: NodeVote[] = [];
    let before: string | undefined;
    let pages = 0;

    // Drain the keyset cursor so the validator's full vote history is not truncated.
    for (;;) {
      const { data, cursor, has_more } = await cosmosIndexer.getGovVotes({
        voter,
        limit: PAGE_LIMIT,
        before_proposal_id: before,
      });

      for (const v of data) {
        votes.push({ address: voter, proposalId: v.proposal_id, vote: v.option, txHash: v.tx_hash });
      }

      if (!has_more || !cursor) break;

      const next = cursor.next_before_proposal_id;
      // Defensive bound against a misbehaving indexer: the keyset cursor strictly decreases,
      // so stop if it fails to advance or the page count explodes.
      if (next === before || ++pages >= MAX_PAGES) break;
      before = next;
    }

    return votes;
  } catch (e) {
    logError(`Can't fetch gov votes for ${voter}`, e);
    return [];
  }
};

export default getNodesVotes;
