import { FC } from 'react';

import QuoteItem from '@/components/header/quote-item';

interface OwnProps {}

const data = {
  validators: '1277',
  ecosystems: '200',
  tvl: '$74.6B',
  list: [
    {
      name: 'Dominance POW',
      grow: false,
      value: '24.7%',
    },
    {
      name: 'Cosmos',
      grow: true,
      value: '30.5%',
    },
    {
      name: 'ETH',
      grow: true,
      value: '42.5%',
    },
    {
      name: 'Polkadot',
      grow: true,
      value: '21.9%',
    },
  ],
};

const Quotes: FC<OwnProps> = () => {
  return (
    <div className="flex flex-grow flex-row space-x-12 overflow-auto scrollbar-none">
      <QuoteItem name="Validators" value={data.validators} href="/validators" />
      <QuoteItem name="Ecosystems" value={data.ecosystems} href="/networks" />
      <QuoteItem name="TVL" value={data.tvl} href="/global_pos" />
      {data.list.map((item) => (
        <QuoteItem key={item.name} name={item.name} value={item.value} grow={item.grow} href="/global_pos" />
      ))}
    </div>
  );
};

export default Quotes;
