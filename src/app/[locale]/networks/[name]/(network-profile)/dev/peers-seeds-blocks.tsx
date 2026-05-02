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

  const hasActivity = activity > 0;
  const hasPeers = peersList != null && peersList.length > 0;
  const hasSeeds = seedsList != null && seedsList.length > 0;
  const hasBinaries = binariesList.length > 0;

  return (
    <div className="my-20">
      <div className="flex w-full flex-row justify-center gap-6">
        <MetricsCardItem
          title={t('commits p/month')}
          data={hasActivity ? activity : 12}
          className={'pt-2.5 pb-4'}
          dataClassName={`mt-5 ${!hasActivity ? 'blur-sm' : ''}`}
        />
        <MetricsCardItem
          title={t('peers')}
          data={hasPeers ? peersList.length : 12}
          className={'pt-2.5 pb-4'}
          dataClassName={`mt-5 ${!hasPeers ? 'blur-sm' : ''}`}
          isModal={hasPeers}
          modalItem={hasPeers ? peersList : undefined}
        />
        <MetricsCardItem
          title={t('seeds')}
          data={hasSeeds ? seedsList.length : 12}
          className={'pt-2.5 pb-4'}
          dataClassName={`mt-5 ${!hasSeeds ? 'blur-sm' : ''}`}
          isModal={hasSeeds}
          modalItem={hasSeeds ? seedsList : undefined}
        />
        <MetricsCardItem
          title={t('binary versions')}
          data={hasBinaries ? binariesList.length : 12}
          className={'pt-2.5 pb-4'}
          dataClassName={`mt-5 ${!hasBinaries ? 'blur-sm' : ''}`}
          isModal={hasBinaries}
          modalItem={hasBinaries ? binariesList : undefined}
        />
      </div>
    </div>
  );
};

export default PeersSeedsBlocks;
