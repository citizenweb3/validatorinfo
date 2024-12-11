import { FC } from 'react';

import QuoteItem from '@/components/header/quote-item';
import HeaderInfoService from '@/services/headerInfo-service';

interface OwnProps {}

export const dynamic = 'force-dynamic';

const data = {
  validators: '1277',
  ecosystems: '1',
  tvl: '$74.6B',
  list: [
    {
      name: 'POW',
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

const Quotes: FC<OwnProps> = async () => {
  const headerInfo = await HeaderInfoService.getValidatorsAndChains();
  return (
    <div className="flex flex-grow flex-row items-center space-x-20 scrollbar-none">
      <QuoteItem name="Validators" value={headerInfo.validators} href="/validators" />
      <QuoteItem name="Ecosystems" value={data.ecosystems} href="/networks" />
      <div className="flex items-center active:h-16">
        <QuoteItem name="TVL" value={data.tvl} href="#" />
      </div>
      <div className="!-mr-14">
        <QuoteItem name="Dominance" href="" />
      </div>
      {data.list.map((item) => (
        <QuoteItem key={item.name} name={item.name} value={item.value} grow={item.grow} href="/global_pos" />
      ))}
    </div>
  );
};

export default Quotes;
