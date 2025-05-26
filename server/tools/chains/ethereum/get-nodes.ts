import logger from '@/logger';
import { GetNodesFunction } from '@/server/tools/chains/chain-indexer';
import { NodeResult } from '@/server/types';
import { setTimeout as sleep } from 'timers/promises';

const { logError, logInfo } = logger('eth-nodes');

interface ChainNode {
  index: string;
  balance: string;
  status: string;
  validator: { pubkey: string; slashed: boolean };
}

const nextToken = (link?: string | null) =>
  link?.match(/page_token=([^>]+)>;\s*rel="next"/)?.[1] ?? null;

const getNodes: GetNodesFunction = async (chain) => {
  const restUrl = chain.nodes.find((n: any) => n.type === 'rest')?.url ?? '';
  if (!restUrl) {
    logError(`Chain ${chain.name}: REST (Beacon) URL not provided`);
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
          const url = new URL(ENDPOINT, restUrl);
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
