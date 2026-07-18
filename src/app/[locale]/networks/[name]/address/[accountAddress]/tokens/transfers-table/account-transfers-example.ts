import type { TransferFeedItem } from '@/services/transfer-feed-service';

// Static preview rows for chains without a per-address transfer indexer (mirrors the
// transactions tab's mock table convention).
export const accountTransfersExample: TransferFeedItem[] = [
  {
    height: '9135986',
    txHash: '5F5E6612AB90C1D34E7F80236F8A10474C93321B88F0AD6E12C34D56E78F36F8',
    msgIndex: 0,
    fromAddr: 'cosmos1exampleaddressmockpreview0000000000',
    toAddr: 'cosmos1counterpartymockpreview000000000000',
    denom: 'uatom',
    amount: '12500000',
    time: '2026-06-24T20:06:38Z',
  },
  {
    height: '9135318',
    txHash: 'A7CC3155EE0912D77B61034FD07708B6339AC2E14577D2B90C34AF1E56D770B6',
    msgIndex: 0,
    fromAddr: 'cosmos1counterpartymockpreview000000000000',
    toAddr: 'cosmos1exampleaddressmockpreview0000000000',
    denom: 'uatom',
    amount: '3000000',
    time: '2026-06-24T19:01:59Z',
  },
  {
    height: '9135224',
    txHash: '90A8261BC734DD02E15F4A8890C22ED1745B3306AA918E45D02C17BB44FC20ED',
    msgIndex: 1,
    fromAddr: 'cosmos1exampleaddressmockpreview0000000000',
    toAddr: 'cosmos1counterpartymockpreview000000000000',
    denom: 'uatom',
    amount: '450000',
    time: '2026-06-24T18:52:53Z',
  },
];
