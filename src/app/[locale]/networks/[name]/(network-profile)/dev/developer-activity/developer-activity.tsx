import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import DeveloperActivityChart from '@/app/networks/[name]/(network-profile)/dev/developer-activity/developer-activity-chart';
import SubTitle from '@/components/common/sub-title';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';
import githubService from '@/services/github-service';

interface OwnProps {
  chain: ChainWithParamsAndTokenomics | null;
}

const DeveloperActivity: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkDevInfo.DeveloperActivity');

  if (!chain) {
    return null;
  }

  const stats = await githubService.getStats(chain.id);
  const activityData = await githubService.getActivityData(chain.id);

  return (
    <div className="mt-14">
      <SubTitle text={t('Subtitle')} />
      <div className="ml-12 mt-10 flex flex-row">
        <div className="flex flex-row items-center border-r border-bgSt pr-7">
          <div className="pr-2 font-sfpro text-lg text-highlight">{t('star')}:</div>
          <div className="font-handjet text-xl">{stats.totalStars}</div>
        </div>
        <div className="ml-4 flex flex-row items-center border-r border-bgSt pr-7">
          <div className="pr-2 font-sfpro text-lg">{t('forked')}:</div>
          <div className="font-handjet text-xl">{stats.totalForks}</div>
        </div>
        <div className="ml-4 flex flex-row items-center border-r border-bgSt pr-7">
          <div className="pr-2 font-sfpro text-lg">{t('repositories')}:</div>
          <div className="font-handjet text-xl">{stats.repositoryCount}</div>
        </div>
        <div className="ml-4 flex flex-row items-center">
          <div className="pr-2 font-sfpro text-lg">{t('most active repo')}:</div>
          <div className="font-handjet text-xl">{stats.mostActiveRepoCommits}</div>
        </div>
      </div>
      <div className="mx-12 mb-10">
        <DeveloperActivityChart activityData={activityData} />
      </div>
    </div>
  );
};

export default DeveloperActivity;
