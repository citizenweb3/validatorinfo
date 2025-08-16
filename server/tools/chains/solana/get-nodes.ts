import { sleep } from '@cosmjs/utils';

import logger from '@/logger';
import { GetNodesFunction } from '@/server/tools/chains/chain-indexer';
import getIdentityByName from '@/server/tools/chains/solana/utils/get-identity-by-name';
import { NodeResult } from '@/server/types';
import isUrlValid from '@/server/utils/is-url-valid';

const { logError } = logger('sol-nodes');

interface ChainNode {
  activatedStake: number;
  commission: number;
  epochCredits: any;
  epochVoteAccount: boolean;
  lastVote: number;
  nodePubkey: string;
  rootSlot: number;
  votePubkey: string;
}

const getSolanaNodes: GetNodesFunction = async (chain) => {
  try {
    const response = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getVoteAccounts',
        params: [],
      }),
    }).then((res) => res.json());

    const voteAccounts: ChainNode[] = [...response.result.current, ...response.result.delinquent].filter(
      (acc) => acc.nodePubkey,
    );

    const apiUrl = 'https://www.validators.app/api/v1/validators/mainnet.json';
    let apiData = [];
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          Token: process.env.VALIDATORS_APP_TOKEN || '',
        },
      });
      apiData = await response.json();
    } catch (apiError) {
      logError(`Failed to fetch data from Validators.app: ${apiUrl}`, apiError);
    }

    const nodes: NodeResult[] = [];
    let count = voteAccounts.length;
    for (const vote of voteAccounts) {
      const apiValidator = apiData.find((v: any) => v.account === vote.nodePubkey) || {};
      let website = apiValidator.www_url || '';
      if (website && !website.startsWith('http')) {
        website = isUrlValid(`https://${website}`) ? `https://${website}` : '';
      }

      const stake = (vote.activatedStake ?? 0).toString();

      let identity = vote.nodePubkey;
      if (apiValidator.keybase_id) {
        identity = (await getIdentityByName(apiValidator.keybase_id)) ?? identity;
        await sleep(100);
      }

      nodes.push({
        operator_address: vote.nodePubkey,
        delegator_shares: stake,
        consensus_pubkey: {
          '@type': 'solana-sdk/ValidatorPubkey',
          key: vote.nodePubkey,
        },
        jailed: apiValidator.delinquent || false,
        min_self_delegation: '0',
        unbonding_height: '0',
        unbonding_time: new Date(0).toISOString(),
        tokens: stake,
        status: apiValidator.is_active ? 'BOND_STATUS_BONDED' : 'BOND_STATUS_UNBONDED',
        commission: {
          commission_rates: { rate: '0', max_rate: '0', max_change_rate: '100' },
          update_time: new Date().toISOString(),
        },
        description: {
          identity,
          moniker: apiValidator.name || vote.nodePubkey,
          website,
          security_contact: '',
          details: apiValidator.details || '',
        },
      });
    }

    return nodes;
  } catch (e) {
    logError(`Can't fetch Solana nodes`, e);
    return [];
  }
};

export default getSolanaNodes;
