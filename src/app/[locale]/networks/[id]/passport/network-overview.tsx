import { Chain } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[id]/networkProfileExample';
import SubTitle from '@/components/common/sub-title';

interface OwnProps {
  chain: Chain;
}

const NetworkOverview: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkPassport');

  const formatData = (title: string, data: number | string) => {
    switch (title) {
      case 'unbonding time':
      case 'voting period':
      case 'slashing':
        return `${data}d`;
      case 'community tax':
      case '% of comm pool to total supply':
        return `${data}%`;
      case 'proposal creation cost':
        return `${data} ${chain.denom}`;
      case 'average block time':
        return `${data}s`;
      case 'comm pool value in usd':
        return data.toLocaleString('en-En');
      default:
        return data;
    }
  };

  return (
    <>
      <SubTitle text={t('Network Overview')} />
      {networkProfileExample.networkOverview.map((item) => (
        <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-base ">
            {t(`${item.title as 'active validators'}`)}
          </div>
          <div className="flex w-2/3 cursor-pointer items-center justify-between gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-base hover:text-highlight">
            {formatData(item.title, item.data)}
          </div>
        </div>
      ))}
    </>
  );
};

export default NetworkOverview;
