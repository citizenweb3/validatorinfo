import { getLocale, getTranslations } from 'next-intl/server';
import { FC } from 'react';

import DeveloperActivityChart from '@/app/networks/[name]/(network-profile)/dev/developer-activity/developer-activity-chart';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import Tooltip from '@/components/common/tooltip';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';
import githubService from '@/services/github-service';

interface OwnProps {
  chain: ChainWithParamsAndTokenomics | null;
}

const DeveloperActivity: FC<OwnProps> = async ({ chain }) => {
  const [t, locale] = await Promise.all([
    getTranslations('NetworkDevInfo.DeveloperActivity'),
    getLocale(),
  ]);

  if (!chain) {
    return null;
  }

  const { stats, activityData } = await githubService.getDeveloperActivity(chain.id);
  const metrics = [
    { key: 'stars', label: t('star'), value: stats.totalStars },
    { key: 'forks', label: t('forked'), value: stats.totalForks },
    { key: 'repositories', label: t('repositories'), value: stats.repositoryCount },
    { key: 'most-active', label: t('most active repo'), value: stats.mostActiveRepoCommits },
    { key: 'open-prs', label: t('open prs'), value: stats.openPrs },
    {
      key: 'open-issues',
      label: t('open issues'),
      value: stats.openIssues,
      tooltip: t('open issues tooltip'),
    },
    {
      key: 'active-maintainers',
      label: t('active maintainers'),
      value: stats.activeMaintainers,
      tooltip: t('active maintainers tooltip'),
    },
  ];

  return (
    <div>
      <div className="mx-4 mt-10 grid grid-cols-1 gap-6 xs:grid-cols-2 md:mx-12 md:grid-cols-3 xl:grid-cols-4">
        {metrics.map((metric) => {
          const card = (
            <MetricsCardItem
              title={metric.label}
              data={metric.value === null ? '—' : metric.value.toLocaleString(locale)}
              className="!mx-0 !w-full min-h-28 px-4 py-4"
              titleClassName="min-h-12"
              dataClassName="mt-3 text-2xl"
            />
          );

          return metric.tooltip ? (
            <Tooltip key={metric.key} tooltip={metric.tooltip} direction="top">
              {card}
            </Tooltip>
          ) : (
            <div key={metric.key}>{card}</div>
          );
        })}
      </div>
      <div className="mx-4 mb-10 mt-12 md:mx-12">
        <DeveloperActivityChart activityData={activityData} />
      </div>
    </div>
  );
};

export default DeveloperActivity;
