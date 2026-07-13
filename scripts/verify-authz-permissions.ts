import assert from 'node:assert/strict';

import { classifyGrantTab, mapAuthzGrantRow } from '@/services/authz-service';

const baseRow = {
  id: 1,
  granter: 'cosmos1granter',
  grantee: 'cosmos1grantee',
  authorizationType: '/cosmos.authz.v1beta1.GenericAuthorization',
  authorizationData: {},
  expiration: null,
};

const withdrawGrant = mapAuthzGrantRow({
  ...baseRow,
  msgTypeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission',
});
assert.equal(classifyGrantTab(withdrawGrant), 'withdraw_rewards');

const unjailGrant = mapAuthzGrantRow({
  ...baseRow,
  msgTypeUrl: '/cosmos.slashing.v1beta1.MsgUnjail',
});
assert.equal(classifyGrantTab(unjailGrant), 'unjail');

const voteGrant = mapAuthzGrantRow({
  ...baseRow,
  msgTypeUrl: '/atomone.gov.v1.MsgVoteWeighted',
});
assert.equal(classifyGrantTab(voteGrant), 'vote');

const sendGrant = mapAuthzGrantRow({
  ...baseRow,
  authorizationType: '/cosmos.bank.v1beta1.SendAuthorization',
  msgTypeUrl: null,
  authorizationData: { spend_limit: [{ denom: 'uatom', amount: '42' }] },
});
assert.equal(sendGrant.kind, 'send');
assert.equal(classifyGrantTab(sendGrant), 'transact');
if (sendGrant.kind === 'send') {
  assert.deepEqual(sendGrant.spendLimit, [{ denom: 'uatom', amount: '42' }]);
}

const stakeGrant = mapAuthzGrantRow({
  ...baseRow,
  authorizationType: '/cosmos.staking.v1beta1.StakeAuthorization',
  msgTypeUrl: null,
  authorizationData: {
    authorization_type: 'AUTHORIZATION_TYPE_DELEGATE',
    max_tokens: { denom: 'uatom', amount: '100' },
    deny_list: { address: ['cosmosvaloper1denied'] },
  },
});
assert.equal(classifyGrantTab(stakeGrant), 'transact');
if (stakeGrant.kind === 'stake') {
  assert.equal(stakeGrant.validators.mode, 'deny');
  assert.deepEqual(stakeGrant.validators.addresses, ['cosmosvaloper1denied']);
}

const unknownGrant = mapAuthzGrantRow({
  ...baseRow,
  authorizationType: '/custom.authz.UnknownAuthorization',
  msgTypeUrl: null,
  authorizationData: null,
});
assert.equal(unknownGrant.kind, 'unknown');
assert.equal(classifyGrantTab(unknownGrant), 'transact');

console.log('Authz permission mapper and classifier verification passed.');
