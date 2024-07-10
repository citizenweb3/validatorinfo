import { ValidatorItem } from '@/types';

export const getValidators = async (chains?: string[]): Promise<ValidatorItem[]> => {
  const vals = [
    {
      id: 0,
      icon: 'https://s3.amazonaws.com/keybase_processed_uploads/7b27f515e1c483b57de8b78f235fed05_360_360.jpg',
      name: 'Citizen Web 3',
      isFavorite: true,
      ecosystems: ['cosmos', 'polkadot'],
      battery: 100,
      links: {
        github: 'https://github.com/citizenweb3',
        x: 'https://twitter.com/citizen_web3',
      },
      scores: {
        technical: 98,
        social: 99,
        governance: 99,
        user: 97,
      },
      tvs: {
        number: 15000000,
      },
      chains: [
        { id: 1, name: 'Cosmos Hub', icon: 'https://votingpower.org/logos/cosmoshub.svg' },
        { id: 2, name: 'Evmos', icon: 'https://votingpower.org/logos/evmos.svg' },
        { id: 3, name: 'LikeCoin', icon: 'https://votingpower.org/logos/likecoin.svg' },
        { id: 4, name: 'BitCanna', icon: 'https://votingpower.org/logos/bitcanna.svg' },
        { id: 5, name: 'Gravity Bridge', icon: 'https://votingpower.org/logos/gravitybridge.svg' },
      ],
    },
    {
      id: 1,
      icon: 'https://s3.amazonaws.com/keybase_processed_uploads/a36cb442d15672ecd180b29c698a2505_360_360.jpg',
      isFavorite: true,
      name: 'Posthuman',
      ecosystems: ['cosmos'],
      battery: 67,
      links: {
        github: 'https://github.com/Validator-POSTHUMAN',
      },
      scores: {
        technical: 87,
        social: 98,
        governance: 79,
        user: 99,
      },
      tvs: {
        number: 9000000,
      },
      chains: [{ id: 1, name: 'Cosmos Hub', icon: 'https://votingpower.org/logos/cosmoshub.svg' }],
    },
    {
      id: 2,
      icon: 'https://s3.amazonaws.com/keybase_processed_uploads/d56ce0bdda17f73d4aa895d1626e2505_360_360.jpg',
      name: 'Polkachu',
      ecosystems: ['cosmos', 'ethereum'],
      scores: {
        technical: 88,
        social: 77,
        governance: 67,
        user: 22,
      },
      links: {},
      battery: 28,
      tvs: {
        number: 7000000,
      },
      chains: [{ id: 1, name: 'Cosmos Hub', icon: 'https://votingpower.org/logos/cosmoshub.svg' }],
    },
    {
      id: 3,
      icon: 'https://s3.amazonaws.com/keybase_processed_uploads/c1bfe4c1d4f6c8f8d66baa152d50e805_360_360.jpg',
      name: 'Allnodes',
      isFavorite: false,
      ecosystems: ['cosmos', 'polkadot'],
      battery: 56,
      links: {
        github: 'https://github.com/citizenweb3',
        x: 'https://twitter.com/citizen_web3',
      },
      scores: {
        technical: 98,
        social: 99,
        governance: 99,
        user: 97,
      },
      tvs: {
        number: 15000000,
      },
      chains: [
        { id: 1, name: 'Cosmos Hub', icon: 'https://votingpower.org/logos/cosmoshub.svg' },
        { id: 2, name: 'Evmos', icon: 'https://votingpower.org/logos/evmos.svg' },
        { id: 3, name: 'LikeCoin', icon: 'https://votingpower.org/logos/likecoin.svg' },
        { id: 4, name: 'BitCanna', icon: 'https://votingpower.org/logos/bitcanna.svg' },
        { id: 5, name: 'Gravity Bridge', icon: 'https://votingpower.org/logos/gravitybridge.svg' },
      ],
    },
    {
      id: 4,
      name: 'Cosmostation',
      ecosystems: ['cosmos'],
      scores: {
        technical: 66,
        social: 99,
        governance: 99,
        user: 55,
      },
      battery: 72,
      links: {
        github: 'https://github.com/Validator-POSTHUMAN',
      },
      tvs: {
        number: 9000000,
      },
      chains: [{ id: 1, name: 'Cosmos Hub', icon: 'https://votingpower.org/logos/cosmoshub.svg' }],
    },
    {
      id: 5,
      icon: 'https://s3.amazonaws.com/keybase_processed_uploads/fa01e6109b3fd4579c4bdd445d75ad05_360_360.jpg',
      name: 'Everstake',
      ecosystems: ['cosmos', 'ethereum'],
      scores: {},
      links: {},
      tvs: {
        number: 7000000,
      },
      chains: [{ id: 1, name: 'Cosmos Hub', icon: 'https://votingpower.org/logos/cosmoshub.svg' }],
    },
    {
      id: 6,
      icon: 'https://s3.amazonaws.com/keybase_processed_uploads/d56ce0bdda17f73d4aa895d1626e2505_360_360.jpg',
      name: 'Polkachu',
      ecosystems: ['cosmos', 'ethereum'],
      scores: {
        technical: 88,
        social: 77,
        governance: 67,
        user: 22,
      },
      links: {},
      battery: 28,
      tvs: {
        number: 7000000,
      },
      chains: [{ id: 1, name: 'Cosmos Hub', icon: 'https://votingpower.org/logos/cosmoshub.svg' }],
    },
    {
      id: 7,
      icon: 'https://s3.amazonaws.com/keybase_processed_uploads/c1bfe4c1d4f6c8f8d66baa152d50e805_360_360.jpg',
      name: 'Allnodes',
      isFavorite: false,
      ecosystems: ['cosmos', 'polkadot'],
      battery: 56,
      links: {
        github: 'https://github.com/citizenweb3',
        x: 'https://twitter.com/citizen_web3',
      },
      scores: {
        technical: 98,
        social: 99,
        governance: 99,
        user: 97,
      },
      tvs: {
        number: 15000000,
      },
      chains: [
        { id: 1, name: 'Cosmos Hub', icon: 'https://votingpower.org/logos/cosmoshub.svg' },
        { id: 2, name: 'Evmos', icon: 'https://votingpower.org/logos/evmos.svg' },
        { id: 3, name: 'LikeCoin', icon: 'https://votingpower.org/logos/likecoin.svg' },
        { id: 4, name: 'BitCanna', icon: 'https://votingpower.org/logos/bitcanna.svg' },
        { id: 5, name: 'Gravity Bridge', icon: 'https://votingpower.org/logos/gravitybridge.svg' },
      ],
    },
    {
      id: 8,
      icon: 'https://s3.amazonaws.com/keybase_processed_uploads/909034c1d36c1d1f3e9191f668007805_360_360.jpeg',
      name: 'Cosmostation',
      ecosystems: ['cosmos'],
      scores: {
        technical: 66,
        social: 99,
        governance: 99,
        user: 55,
      },
      battery: 72,
      links: {
        github: 'https://github.com/Validator-POSTHUMAN',
      },
      tvs: {
        number: 9000000,
      },
      chains: [{ id: 1, name: 'Cosmos Hub', icon: 'https://votingpower.org/logos/cosmoshub.svg' }],
    },
    {
      id: 9,
      icon: 'https://s3.amazonaws.com/keybase_processed_uploads/fa01e6109b3fd4579c4bdd445d75ad05_360_360.jpg',
      name: 'Everstake',
      ecosystems: ['cosmos', 'ethereum'],
      scores: {},
      links: {},
      tvs: {
        number: 7000000,
      },
      chains: [{ id: 1, name: 'Cosmos Hub', icon: 'https://votingpower.org/logos/cosmoshub.svg' }],
    },
  ];

  if (chains?.length) {
    return vals.filter((v) => v.ecosystems.some((e: string) => chains.indexOf(e) !== -1));
  }

  return Promise.resolve(vals);
};
