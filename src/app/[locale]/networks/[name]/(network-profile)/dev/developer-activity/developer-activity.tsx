import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import DeveloperActivityChart from '@/app/networks/[name]/(network-profile)/dev/developer-activity/developer-activity-chart';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';
import githubService from '@/services/github-service';
import { cn } from '@/utils/cn';

interface OwnProps {
  chain: ChainWithParamsAndTokenomics | null;
}

const DeveloperActivity: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkDevInfo.DeveloperActivity');

  if (!chain) {
    return null;
  }

  const { stats, activityData } = await githubService.getDeveloperActivity(chain.id);
  const metrics = [
    { key: 'stars', label: t('star'), value: stats.totalStars, highlighted: true },
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
      <div className="mx-4 mt-10 flex flex-wrap gap-y-4 md:mx-12">
        {metrics.map((metric, index) => {
          const tooltipId = `developer-metric-${metric.key}`;
          return (
            <div
              key={metric.key}
              className={cn(
                'flex min-w-48 flex-1 items-center px-4 first:pl-0',
                index < metrics.length - 1 && 'border-r border-bgSt',
              )}
            >
              <div
                className={cn('relative pr-2 font-sfpro text-lg', metric.highlighted && 'text-highlight')}
              >
                {metric.tooltip ? (
                  <span
                    className="group relative inline-flex cursor-help border-b border-dotted border-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight"
                    tabIndex={0}
                    aria-describedby={tooltipId}
                  >
                    {metric.label}:
                    <span
                      id={tooltipId}
                      role="tooltip"
                      className="invisible absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 bg-primary px-3 py-2 text-center font-sfpro text-sm font-normal text-white opacity-0 shadow-button transition-opacity group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100"
                    >
                      {metric.tooltip}
                    </span>
                  </span>
                ) : (
                  <span>{metric.label}:</span>
                )}
              </div>
              <div className="font-handjet text-xl">{metric.value ?? '—'}</div>
            </div>
          );
        })}
      </div>
      <div className="mx-12 mb-10">
        <DeveloperActivityChart activityData={activityData} />
      </div>
    </div>
  );
};

export default DeveloperActivity;
