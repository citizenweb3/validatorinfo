import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import RoundedButton from '@/components/common/rounded-button';

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
    <div className="mb-20">
      <div className="flex flex-row justify-between items-end">
        <SubTitle text={t('Token Price')} />
        <RoundedButton className="flex text-lg" contentClassName="px-12">{t('Supply Concentration')}</RoundedButton>
      </div>
      <div className="flex flex-col mt-8">
        <div className="flex flex-row space-x-10 mt-6 mx-auto">
          <div className="flex items-center justify-between shadow-button space-x-24 py-1 pr-7 pl-2">
            <div className="font-sfpro text-lg">{`${denom} / USD:`}</div>
            <div className="font-handjet text-xl text-highlight justify-end">{`$${price}`}</div>
          </div>
          <div className="flex items-center justify-between shadow-button space-x-40 py-1 pr-7 pl-2">
            <div className="font-sfpro text-lg">ATH:</div>
            <div className="font-handjet text-xl text-highlight justify-end">$12.43K</div>
          </div>
          <div className="flex items-center justify-between shadow-button space-x-40 py-1 pr-7 pl-2">
            <div className="font-sfpro text-lg">ATL:</div>
            <div className="font-handjet text-xl text-highlight justify-end">$12.43K</div>
          </div>
        </div>
        <div className="flex flex-row mx-auto mt-8">
          {tableItems.map((item) => (
            <div key={item.title} className="flex flex-col justify-center items-center border-bgSt border-b border-r mx-8 px-6 font-handjet text-lg py-3">
              <div>{item.title}</div>
              <div style={{ color: item.color }}>{item.data}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkTokenPrice;
