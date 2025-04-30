import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[id]/(network-profile)/networkProfileExample';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import Image from 'next/image';
import icons from '@/components/icons';
import RoundedButton from '@/components/common/rounded-button';

interface OwnProps {
}

const PeersSeedsBlocks: FC<OwnProps> = async () => {
  const t = await getTranslations('NetworkDevInfo');

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-x-10 text-base mb-8">
        <div className="border-b border-bgSt pl-1 pb-4">
          <div className="text-highlight text-lg mb-2 ml-2">{t('pre-vote')}</div>
          <div className="flex items-center">
            <Image src={icons.GreenSquareIcon} alt={`green icon`} width={30} height={30} />
            <div>{t('pre vote synchronized')}</div>
          </div>
          <div className="flex items-center">
            <Image src={icons.YellowSquareIcon} alt={`yellow icon`} width={30} height={30} />
            <div>{t('pre vote different')}</div>
          </div>
          <div className="flex items-center">
            <Image src={icons.RedSquareIcon} alt={`red icon`} width={30} height={30} />
            <div>{t('pre vote not submitted')}</div>
          </div>
        </div>
        <div className="border-b border-bgSt pl-4 pb-4">
          <div className="text-highlight text-lg mb-2 ml-2">{t('pre-commit')}</div>
          <div className="flex items-center">
            <Image src={icons.GreenSquareIcon} alt={`green icon`} width={30} height={30} />
            <div>{t('pre commit synchronized')}</div>
          </div>
          <div className="flex items-center">
            <Image src={icons.YellowSquareIcon} alt={`yellow icon`} width={30} height={30} />
            <div>{t('pre commit different')}</div>
          </div>
          <div className="flex items-center">
            <Image src={icons.RedSquareIcon} alt={`red icon`} width={30} height={30} />
            <div>{t('pre commit not submitted')}</div>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-row justify-center gap-6">
        {networkProfileExample.peersAndSeeds.map((item) => (
          <MetricsCardItem key={item.title}
                           title={t(item.title as 'peers')}
                           data={item.data}
                           className={'pt-2.5'}
                           dataClassName={'mt-5'}
                           isModal />
        ))}
      </div>
      <div className="flex w-full flex-row justify-center gap-6 mt-8">
        <MetricsCardItem title={t('binary versions')}
                         data={'12'}
                         className={'pt-2.5'}
                         dataClassName={'mt-5'}
                         isModal />
      </div>
      <div className="flex justify-end -mt-11">
        <RoundedButton className="text-lg" contentClassName="px-14">
          {t('Submit App Info')}
        </RoundedButton>
      </div>
    </div>

  );
};

export default PeersSeedsBlocks;
