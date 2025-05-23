import { ValidatorVote } from '@/services/vote-service';

export const votesExample = [
  {
    chain: { id: 1, prettyName: 'Bostrom', ecosystem: 'Cosmos' },
    proposalDbId: 1,
    proposalId: '1',
    title: 'Proposal Title',
    vote: 'YES',
  },
  {
    chain: { id: 1, prettyName: 'Network', ecosystem: 'Cosmos' },
    proposalDbId: 2,
    proposalId: '2',
    title: 'Proposal Title',
    vote: 'NO',
  },
  {
    chain: { id: 1, prettyName: 'Network', ecosystem: 'Cosmos' },
    proposalDbId: 3,
    proposalId: '3',
    title: 'Proposal Title',
    vote: 'YES',
  },
  {
    chain: { id: 1, prettyName: 'Network', ecosystem: 'Cosmos' },
    proposalDbId: 4,
    proposalId: '4',
    title: 'Proposal Title',
    vote: 'NO',
  },
  {
    chain: { id: 1, prettyName: 'Network', ecosystem: 'Cosmos' },
    proposalDbId: 5,
    proposalId: '5',
    title: 'Proposal Title',
    vote: 'YES',
  },
  {
    chain: { id: 1, prettyName: 'Network', ecosystem: 'Cosmos' },
    proposalDbId: 1,
    proposalId: '1',
    title: 'Proposal Title',
    vote: 'ABSTAIN',
  },
  {
    chain: { id: 1, prettyName: 'Network', ecosystem: 'Cosmos' },
    proposalDbId: 2,
    proposalId: '2',
    title: 'Proposal Title',
    vote: 'VETO',
  },
  {
    chain: { id: 1, prettyName: 'Network', ecosystem: 'Cosmos' },
    proposalDbId: 3,
    proposalId: '3',
    title: 'Proposal Title',
    vote: 'NO',
  },
  {
    chain: { id: 1, prettyName: 'Network', ecosystem: 'Cosmos' },
    proposalDbId: 4,
    proposalId: '4',
    title: 'Proposal Title',
    vote: 'YES',
  },
  {
    chain: { id: 1, prettyName: 'Network', ecosystem: 'Cosmos' },
    proposalDbId: 5,
    proposalId: '5',
    title: 'Proposal Title',
    vote: 'NO',
  },
] as ValidatorVote[];

export const validatorExample = {
  id: 0,
  icon: 'https://s3.amazonaws.com/keybase_processed_uploads/558a3c554fecd6b0f9ff06e7ee6cc005_360_360.jpg',
  name: 'Citizen Web3',
  isFavorite: true,
  ecosystems: ['cosmos', 'polkadot'],
  battery: 100,
  links: {
    github: 'https://github.com/citizenweb3',
    x: 'https://twitter.com/citizen_web3',
  },
  metrics: {
    technicalScore: 90,
    socialScore: 78,
    governanceScore: 58,
    userScore: 48,
    TVS: 128,
    fans: 55000,
    amountOfAssets: 12,
  },
  rpcNodes: [
    {
      color: 'green',
      networks: 'Namada',
      url: 'https://rpc.namada.citizenweb3.com',
    },
    {
      color: 'red',
      networks: 'Namada',
      url: 'https://rpc.namada.citizenweb3.com',
    },
    {
      color: 'yellow',
      networks: 'Namada',
      url: 'https://rpc.namada.citizenweb3.com',
    },
  ],
  relayerNodes: [
    {
      color: 'green',
      networks: 'Cosmos Hub <-> Osmosis',
      url: '123456',
    },
    {
      color: 'red',
      networks: 'Cosmos Hub <-> Osmosis',
      url: '2423423',
    },
    {
      color: 'yellow',
      networks: 'Cosmos Hub <-> Osmosis',
      url: '4564564',
    },
  ],
  archiveNodes: [
    {
      color: 'green',
      networks: 'Namada',
      url: 'https://rpc.namada.citizenweb3.com',
    },
    {
      color: 'red',
      networks: 'Namada',
      url: 'https://rpc.namada.citizenweb3.com',
    },
    {
      color: 'yellow',
      networks: 'Namada',
      url: 'https://rpc.namada.citizenweb3.com',
    },
  ],
  othersNodes: [
    {
      color: 'green',
      networks: 'IPFS Node',
      url: '123.432.234.4',
    },
    {
      color: 'red',
      networks: 'Light Node',
      url: '123.432.234.4',
    },
  ],
  media: [
    {
      name: 'Citizen Web3 Podcast',
      approved: 88,
    },
    {
      name: 'Citizen Web3 Youtube Channel',
      approved: 78,
    },
    {
      name: 'Citizen Web3 Blog',
      approved: 91,
    },
  ],
};
