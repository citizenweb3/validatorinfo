import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';

interface OwnProps {
  denom?: string;
  price?: number;
}

const NetworkTokenPrice: FC<OwnProps> = async ({ denom, price }) => {
  const t = await getTranslations('NetworkTokenomics');

  const tableItems = [
    {
      title: '24H',
      data: 23.87,
      color: '#4FB848',
    },
    {
      title: '1M',
      data: 23.87,
      color: '#EB1616',
    },
    {
      title: '1Y',
      data: 23.87,
      color: '#4FB848',
    },
  ];

  return (
    <div className="mt-4">
      <SubTitle text={t('Token Price')} />
      <div className="flex flex-row justify-between gap-x-5 mt-5">
        <div className="flex flex-row w-2/3 gap-x-10 items-start mt-6">
          <div className="flex items-center justify-between shadow-button basis-1/3 py-1">
            <div className="font-sfpro text-lg ml-2">{`${denom} / USD:`}</div>
            <div className="font-handjet text-xl text-highlight justify-end mr-8">{`$${price}`}</div>
          </div>
          <div className="flex items-center justify-between shadow-button basis-1/3 py-1">
            <div className="font-sfpro text-lg ml-2">ATH:</div>
            <div className="font-handjet text-xl text-highlight justify-end mr-8">$12.43K</div>
          </div>
          <div className="flex items-center justify-between shadow-button basis-1/3 py-1">
            <div className="font-sfpro text-lg ml-2">ATL:</div>
            <div className="font-handjet text-xl text-highlight justify-end mr-8">$12.43K</div>
          </div>
        </div>
        <div className="flex flex-row w-1/3 ml-3">
          {tableItems.map((item) => (
            <div key={item.title} className="basis-1/3 border-bgSt border-b border-r mx-6 font-handjet text-lg py-5">
              <div className="flex items-center justify-center">{item.title}</div>
              <div className="flex items-center justify-center" style={{ color: item.color }}>{item.data}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkTokenPrice;
