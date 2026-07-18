import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateImpactBasisPoints,
  deriveGovernanceCharts,
  formatBasisPoints,
  isClosedGovernanceProposalStatus,
  isWeightedGovernanceVote,
  parseFinalTally,
} from '@/utils/account-governance';

test('final tally parser accepts the stored JSON string and AtomOne veto omission', () => {
  const tally = parseFinalTally(
    JSON.stringify({
      yes_count: '25009196827071000000000000000000000000000000000000',
      no_count: '5464156577',
      abstain_count: '11367493905',
    }),
  );

  assert.equal(tally?.yes, BigInt('25009196827071000000000000000000000000000000000000'));
  assert.equal(tally?.veto, BigInt(0));
  assert.equal(tally?.total, BigInt('25009196827071000000000000000000000000016831650482'));
});

test('final tally parser accepts an object and rejects unsafe shapes', () => {
  assert.deepEqual(
    parseFinalTally({
      yes_count: '10',
      no_count: '20',
      abstain_count: '30',
      no_with_veto_count: '40',
    }),
    { yes: BigInt(10), no: BigInt(20), abstain: BigInt(30), veto: BigInt(40), total: BigInt(100) },
  );

  assert.equal(parseFinalTally(null), null);
  assert.equal(parseFinalTally('{broken'), null);
  assert.equal(parseFinalTally({ yes_count: 10, no_count: '0', abstain_count: '0' }), null);
  assert.equal(parseFinalTally({ yes_count: '10', no_count: '-1', abstain_count: '0' }), null);
  assert.equal(parseFinalTally({ yes_count: '10', no_count: '0' }), null);
  assert.equal(parseFinalTally({ yes_count: '10', no_count: '0', abstain_count: '0', no_with_veto_count: null }), null);
});

test('impact math stays in BigInt and rejects impossible or unavailable values', () => {
  assert.equal(calculateImpactBasisPoints('5', BigInt(10_000)), BigInt(5));
  assert.equal(calculateImpactBasisPoints('505', BigInt(10_000)), BigInt(505));
  assert.equal(calculateImpactBasisPoints('10000', BigInt(10_000)), BigInt(10_000));
  assert.equal(calculateImpactBasisPoints('0', BigInt(10_000)), null);
  assert.equal(calculateImpactBasisPoints('10001', BigInt(10_000)), null);
  assert.equal(calculateImpactBasisPoints('1', BigInt(0)), null);
  assert.equal(calculateImpactBasisPoints('not-a-number', BigInt(10_000)), null);

  assert.equal(formatBasisPoints(BigInt(5)), '0.05%');
  assert.equal(formatBasisPoints(BigInt(505)), '5.05%');
  assert.equal(formatBasisPoints(BigInt(10_000)), '100.00%');
});

test('fixed Cosmos decimals only badge genuinely weighted votes', () => {
  assert.equal(isWeightedGovernanceVote('1.000000000000000000'), false);
  assert.equal(isWeightedGovernanceVote('0.600000000000000000'), true);
  assert.equal(isWeightedGovernanceVote(null), false);
  assert.equal(isWeightedGovernanceVote('invalid'), false);
});

test('chart derivation deduplicates pages and counts only joined closed proposals', () => {
  const charts = deriveGovernanceCharts(
    [
      { proposalId: '4', option: 'YES', isClosed: true },
      { proposalId: '4', option: 'YES', isClosed: true },
      { proposalId: '3', option: 'NO', isClosed: false },
      { proposalId: '2', option: 'ABSTAIN', isClosed: true },
      { proposalId: '1', option: 'UNSPECIFIED', isClosed: true },
    ],
    3,
  );

  assert.deepEqual(charts.options, { YES: 1, NO: 1, ABSTAIN: 1, VETO: 0 });
  assert.deepEqual(charts.participation, { voted: 3, notVoted: 0, totalClosedProposals: 3 });
  assert.equal(isClosedGovernanceProposalStatus('PROPOSAL_STATUS_PASSED'), true);
  assert.equal(isClosedGovernanceProposalStatus('PROPOSAL_STATUS_VOTING_PERIOD'), false);
});
