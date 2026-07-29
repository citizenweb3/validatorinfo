import assert from 'node:assert/strict';
import test from 'node:test';

import { createEthereumTvsGetter } from '@/server/tools/chains/ethereum/get-tvs';
import { getChainParams } from '@/server/tools/chains/params';
import { type NodeResult } from '@/server/types';

const createNode = (tokens: string): NodeResult => ({
  operator_address: '0xvalidator',
  consensus_pubkey: {
    '@type': 'ethereum/BeaconValidatorPubkey',
    key: '0xvalidator',
  },
  jailed: false,
  status: 'BOND_STATUS_BONDED',
  tokens,
  delegator_shares: tokens,
  description: {
    moniker: '',
    identity: '',
    website: '',
    security_contact: '',
    details: '',
  },
  unbonding_height: '0',
  unbonding_time: new Date(0).toISOString(),
  commission: {
    commission_rates: {
      rate: '0',
      max_rate: '0',
      max_change_rate: '0',
    },
    update_time: new Date(0).toISOString(),
  },
  min_self_delegation: '0',
});

test('mainnet supply failure returns before the Beacon request', async () => {
  let bondedRequested = false;
  const getTvs = createEthereumTvsGetter({
    getTotalSupply: async () => null,
    getNodes: async () => [],
    getBondedWei: async () => {
      bondedRequested = true;
      return null;
    },
  });

  assert.equal(await getTvs(getChainParams('ethereum')), null);
  assert.equal(bondedRequested, false);
});

test('mainnet folds bonded stake from the streamed Beacon set, not from getNodes', async () => {
  let nodesRequested = false;
  const getTvs = createEthereumTvsGetter({
    getTotalSupply: async () => '1000',
    getNodes: async () => {
      nodesRequested = true;
      return [createNode('999')];
    },
    getBondedWei: async () => '250',
  });

  assert.deepEqual(await getTvs(getChainParams('ethereum')), {
    totalSupply: '1000',
    bondedTokens: '250',
    unbondedTokens: '750',
    unbondedTokensRatio: 0.75,
    tvs: 0.25,
  });
  assert.equal(nodesRequested, false);
});

test('an empty mainnet Beacon result still publishes total supply', async () => {
  const getTvs = createEthereumTvsGetter({
    getTotalSupply: async () => '1000',
    getNodes: async () => [],
    getBondedWei: async () => null,
  });

  // FDV is supply * price and must not depend on the validator set. The Beacon
  // endpoint fails for mainnet today, and dropping the snapshot on that failure is
  // what kept Tokenomics.fdv at 0.
  assert.deepEqual(await getTvs(getChainParams('ethereum')), {
    totalSupply: '1000',
    bondedTokens: '0',
    unbondedTokens: '1000',
    unbondedTokensRatio: 1,
    tvs: 0,
  });
});

test('mainnet TVS is derived from supply and bonded wei without negative complements', async () => {
  const getTvs = createEthereumTvsGetter({
    getTotalSupply: async () => '1000',
    getNodes: async () => [],
    getBondedWei: async () => '250',
  });

  assert.deepEqual(await getTvs(getChainParams('ethereum')), {
    totalSupply: '1000',
    bondedTokens: '250',
    unbondedTokens: '750',
    unbondedTokensRatio: 0.75,
    tvs: 0.25,
  });
});

test('an impossible mainnet bonded total drops the staking figures but keeps supply', async () => {
  const getTvs = createEthereumTvsGetter({
    getTotalSupply: async () => '1000',
    getNodes: async () => [],
    getBondedWei: async () => '1001',
  });

  assert.deepEqual(await getTvs(getChainParams('ethereum')), {
    totalSupply: '1000',
    bondedTokens: '0',
    unbondedTokens: '1000',
    unbondedTokensRatio: 1,
    tvs: 0,
  });
});

test('Sepolia keeps its existing bonded-token snapshot without using mainnet supply', async () => {
  const getTvs = createEthereumTvsGetter({
    getTotalSupply: async () => {
      throw new Error('mainnet supply must not be requested for Sepolia');
    },
    getNodes: async () => [createNode('250')],
    getBondedWei: async () => {
      throw new Error('the Beacon stream must not be used for Sepolia');
    },
  });

  assert.deepEqual(await getTvs(getChainParams('ethereum-sepolia')), {
    totalSupply: '0',
    bondedTokens: '250',
    unbondedTokens: '0',
    unbondedTokensRatio: 0,
    tvs: 0,
  });
});
