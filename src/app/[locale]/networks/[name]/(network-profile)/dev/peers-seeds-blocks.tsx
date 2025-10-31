import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { FC } from 'react';

import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import RoundedButton from '@/components/common/rounded-button';
import icons from '@/components/icons';
import { ChainWithParams } from '@/services/chain-service';
import githubService, { DailyActivity } from '@/services/github-service';
import { parseCommaList } from '@/utils/parse-comma-list';
import { parseJsonDict } from '@/utils/parse-json-dict';

interface OwnProps {
  chain: ChainWithParams | null;
}

const getMonthlyCommits = (activity: DailyActivity[]): number => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  return activity
    .filter(
      (d) => d.date.getFullYear() === year && d.date.getMonth() === month && d.date.getDate() >= 1 && d.date <= now,
    )
    .reduce((sum, d) => sum + d.commits, 0);
};

const PeersSeedsBlocks: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkDevInfo');

  const peersList = parseCommaList(chain?.params?.peers);
  const seedsList = parseCommaList(chain?.params?.seeds);
  const binariesDict = parseJsonDict(chain?.params?.binaries);
  const binariesList = Object.values(binariesDict);
  const activityData = chain?.id ? await githubService.getActivityData(chain.id) : [];
  const activity = getMonthlyCommits(activityData);

  return (
    <div className="mt-4">
      <div className="mb-8 grid grid-cols-2 gap-x-10 text-base">
        <div className="border-b border-bgSt pb-4 pl-1">
          <div className="mb-2 ml-2 text-lg text-highlight">{t('pre-vote')}</div>
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
        <div className="border-b border-bgSt pb-4 pl-4">
          <div className="mb-2 ml-2 text-lg text-highlight">{t('pre-commit')}</div>
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
        <MetricsCardItem
          title={t('commits p/month')}
          data={activity}
          className={'pt-2.5'}
          dataClassName={'mt-5'}
        />
        <MetricsCardItem
          title={t('peers')}
          data={peersList?.length ?? 12}
          className={'pt-2.5'}
          dataClassName={'mt-5'}
          isModal
          modalItem={peersList}
        />
        <MetricsCardItem
          title={t('seeds')}
          data={seedsList?.length ?? 12}
          className={'pt-2.5'}
          dataClassName={'mt-5'}
          isModal
          modalItem={seedsList}
        />
      </div>
      <div className="mt-8 flex w-full flex-row justify-center gap-6">
        <MetricsCardItem
          title={t('binary versions')}
          data={binariesList?.length ?? 12}
          className={'pt-2.5'}
          dataClassName={'mt-5'}
          isModal
          modalItem={binariesList}
        />
      </div>
      <div className="-mt-11 flex justify-end">
        <RoundedButton className="text-lg" contentClassName="px-14">
          {t('Submit App Info')}
        </RoundedButton>
      </div>
    </div>
  );
};

export default PeersSeedsBlocks;
