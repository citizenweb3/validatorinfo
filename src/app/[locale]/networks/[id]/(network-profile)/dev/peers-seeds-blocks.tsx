import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import Image from 'next/image';
import icons from '@/components/icons';
import RoundedButton from '@/components/common/rounded-button';
import { parseCommaList } from '@/utils/parse-comma-list';
import { parseJsonDict } from '@/utils/parse-json-dict';
import { ChainWithParams } from '@/services/chain-service';

interface OwnProps {
  chain: ChainWithParams | null;
}

const PeersSeedsBlocks: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkDevInfo');

  const peersList = parseCommaList(chain?.params?.peers);
  const seedsList = parseCommaList(chain?.params?.seeds);
  const binariesDict = parseJsonDict(chain?.params?.binaries);
  const binariesList = Object.values(binariesDict);

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
        <MetricsCardItem title={t('commits p/month')}
                         data={12}
                         className={'pt-2.5'}
                         dataClassName={'mt-5'}
                         isModal />
        <MetricsCardItem title={t('peers')}
                         data={peersList?.length ?? 12}
                         className={'pt-2.5'}
                         dataClassName={'mt-5'}
                         isModal
                         modalItem={peersList} />
        <MetricsCardItem title={t('seeds')}
                         data={seedsList?.length ?? 12}
                         className={'pt-2.5'}
                         dataClassName={'mt-5'}
                         isModal
                         modalItem={seedsList} />
      </div>
      <div className="flex w-full flex-row justify-center gap-6 mt-8">
        <MetricsCardItem title={t('binary versions')}
                         data={binariesList?.length ?? 12}
                         className={'pt-2.5'}
                         dataClassName={'mt-5'}
                         isModal
                         modalItem={binariesList} />
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
