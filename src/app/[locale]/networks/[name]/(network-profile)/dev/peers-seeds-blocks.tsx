import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
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
    <div className="my-20">
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
        <MetricsCardItem
          title={t('binary versions')}
          data={binariesList?.length ?? 12}
          className={'pt-2.5'}
          dataClassName={'mt-5'}
          isModal
          modalItem={binariesList}
        />
      </div>
    </div>
  );
};

export default PeersSeedsBlocks;
