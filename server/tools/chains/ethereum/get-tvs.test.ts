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
  let nodesRequested = false;
  const getTvs = createEthereumTvsGetter({
    getTotalSupply: async () => null,
    getNodes: async () => {
      nodesRequested = true;
      return [];
    },
  });

  assert.equal(await getTvs(getChainParams('ethereum')), null);
  assert.equal(nodesRequested, false);
});

test('an empty mainnet Beacon result preserves the previous TVS snapshot', async () => {
  const getTvs = createEthereumTvsGetter({
    getTotalSupply: async () => '1000',
    getNodes: async () => [],
  });

  assert.equal(await getTvs(getChainParams('ethereum')), null);
});

test('mainnet TVS is derived from supply and bonded wei without negative complements', async () => {
  const getTvs = createEthereumTvsGetter({
    getTotalSupply: async () => '1000',
    getNodes: async () => [createNode('250')],
  });

  assert.deepEqual(await getTvs(getChainParams('ethereum')), {
    totalSupply: '1000',
    bondedTokens: '250',
    unbondedTokens: '750',
    unbondedTokensRatio: 0.75,
    tvs: 0.25,
  });
});

test('an impossible mainnet bonded total cannot overwrite the previous snapshot', async () => {
  const getTvs = createEthereumTvsGetter({
    getTotalSupply: async () => '1000',
    getNodes: async () => [createNode('1001')],
  });

  assert.equal(await getTvs(getChainParams('ethereum')), null);
});

test('Sepolia keeps its existing bonded-token snapshot without using mainnet supply', async () => {
  const getTvs = createEthereumTvsGetter({
    getTotalSupply: async () => {
      throw new Error('mainnet supply must not be requested for Sepolia');
    },
    getNodes: async () => [createNode('250')],
  });

  assert.deepEqual(await getTvs(getChainParams('ethereum-sepolia')), {
    totalSupply: '0',
    bondedTokens: '250',
    unbondedTokens: '0',
    unbondedTokensRatio: 0,
    tvs: 0,
  });
});
