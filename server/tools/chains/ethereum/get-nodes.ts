import { setTimeout as sleep } from 'timers/promises';

import logger from '@/logger';
import { GetNodesFunction } from '@/server/tools/chains/chain-indexer';
import { NodeResult } from '@/server/types';

const { logError, logInfo } = logger('eth-nodes');

interface ChainNode {
  index: string;
  balance: string;
  status: string;
  validator: { pubkey: string; slashed: boolean };
}

const nextToken = (link?: string | null) => link?.match(/page_token=([^>]+)>;\s*rel="next"/)?.[1] ?? null;

const getNodes: GetNodesFunction = async (chain) => {
  const restUrl = chain.nodes.find((n: any) => n.type === 'rest')?.url ?? '';
  if (!restUrl) {
    logError(`Chain ${chain.name}: REST (Beacon) URL not provided`);
    return [];
  }

  // Mainnet is deliberately not indexed per validator. The Beacon set is ~2.3M
  // entries in a single ~1 GB response (server-side `status` filtering is ignored
  // by the node — `?status=active` and `?status=active_ongoing` both return the
  // full set), and jobs/get-nodes.ts issues per-node database queries, so even a
  // successful parse would mean ~890k round trips and rows for one chain.
  // Aggregate staking figures come from stream-beacon-validators instead, which
  // folds the same response without materialising it. Testnets stay per-node:
  // their validator sets are small enough to index.
  if (chain.name === 'ethereum') {
    logInfo(`Skipping per-validator indexing for ${chain.name}: aggregate stake is streamed instead`);
    return [];
  }

  const ENDPOINT = '/eth/v1/beacon/states/head/validators';
  const RETRIES = 3;
  const RETRY_WAIT_MS = 1_000;

  const nodes: NodeResult[] = [];
  let pageToken: string | null = null;

  try {
    do {
      let tries = 0;
      let nodesData: ChainNode[] | null = null;
      let linkHeader: string | null = null;

      while (tries < RETRIES && !nodesData) {
        try {
          const baseUrl = restUrl.endsWith('/') ? restUrl : restUrl + '/';
          const endpoint = ENDPOINT.startsWith('/') ? ENDPOINT.slice(1) : ENDPOINT;
          const url = new URL(endpoint, baseUrl);
          if (pageToken) url.searchParams.set('page_token', pageToken);
          logInfo(`Fetching data from ${url}`);
          const res = await fetch(url.toString());
          if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

          const json: { data: ChainNode[] } = await res.json();
          nodesData = json.data;
          linkHeader = res.headers.get('link');
        } catch (err) {
          tries += 1;
          logError(`Fetch page failed (${tries}/${RETRIES})`, err);
          if (tries < RETRIES) await sleep(RETRY_WAIT_MS);
        }
      }

      if (!nodesData) throw new Error('Max retries exceeded on Beacon fetch');

      for (const node of nodesData) {
        const balanceWei = (BigInt(node.balance) * BigInt(1_000_000_000)).toString();

        nodes.push({
          operator_address: node.validator.pubkey,
          delegator_shares: balanceWei,
          consensus_pubkey: {
            '@type': 'ethereum/BeaconValidatorPubkey',
            key: node.validator.pubkey,
          },
          jailed: node.validator.slashed || !node.status.startsWith('active'),
          min_self_delegation: '0',
          unbonding_height: '0',
          unbonding_time: new Date(0).toISOString(),
          tokens: balanceWei,
          status: node.status.startsWith('active') || node.status === 'withdrawal_possible'
            ? 'BOND_STATUS_BONDED'
            : 'BOND_STATUS_UNBONDED',
          commission: {
            commission_rates: { rate: '0', max_rate: '0', max_change_rate: '100' },
            update_time: new Date().toISOString(),
          },
          description: {
            identity: '',
            moniker: '',
            website: '',
            security_contact: '',
            details: '',
          },
        });
      }

      pageToken = nextToken(linkHeader);
    } while (pageToken);

    return nodes;
  } catch (e) {
    logError(`Can't fetch validators for chain ${chain.name}`, e);
    return [];
  }
};

export default getNodes;
