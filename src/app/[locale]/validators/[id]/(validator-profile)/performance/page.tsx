import { getTranslations } from 'next-intl/server';

import DelegationFlowWidget from '@/app/validators/[id]/(validator-profile)/performance/delegation-flow-widget';
import PerformanceScoreCard from '@/app/validators/[id]/(validator-profile)/performance/performance-score-card';
import UptimeHeatmap from '@/app/validators/[id]/(validator-profile)/performance/uptime-heatmap';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/common/sub-title';
import ToolTip from '@/components/common/tooltip';
import { Locale, NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import validatorService from '@/services/validator-service';
import SubDescription from '@/components/sub-description';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { id: string };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'ValidatorPerformance' });

  return {
    title: t('title'),
  };
}

const generateUptimeData = () => {
  const data = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const hasData = Math.random() > 0.1;
    const uptime = hasData ? 85 + Math.random() * 15 : null;
    const missedBlocks = hasData ? Math.floor((100 - (uptime ?? 100)) * 10) : 0;
    data.push({ date: dateStr, uptime, missedBlocks });
  }
  return data;
};

const ValidatorPerformancePage: NextPageWithLocale<PageProps> = async ({ params: { locale, id } }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorPerformance' });

  const validatorId = parseInt(id);
  const validator = await validatorService.getById(validatorId);
  const validatorMoniker = validator ? validator.moniker : 'Validator';

  const sortBy: string = 'prettyName';
  const order: SortDirection = 'asc';
  const { validatorNodesWithChainData: list } = await validatorService.getValidatorNodesWithChains(
    validatorId,
    [],
    [],
    0,
    Number.MAX_SAFE_INTEGER,
    sortBy,
    order,
  );

  let totalDelegators = 0;
  for (const node of list) {
    if (node.delegatorsAmount) {
      totalDelegators += node.delegatorsAmount;
    }
  }

  const uptimeData = generateUptimeData();

  const avgUptime = uptimeData.filter((d) => d.uptime !== null);
  const uptimeScore = avgUptime.length > 0
    ? Math.round(avgUptime.reduce((sum, d) => sum + (d.uptime ?? 0), 0) / avgUptime.length)
    : 0;

  const governanceScore = Math.min(100, Math.round(list.length * 12 + 20));
  const avgCommission = list.length > 0
    ? list.reduce((sum, n) => sum + (n.commission ?? 0), 0) / list.length
    : 0;
  const commissionScore = Math.round(Math.max(0, 100 - avgCommission * 100));
  const slashScore = 95;

  return (
    <div className="mb-20">
      <PageTitle prefix={`${validatorMoniker}`} text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />

      <div className="mt-12 flex flex-col gap-16">
        <div>
          <ToolTip tooltip={t('tooltip performance score')} direction={'top'}>
            <SubTitle text={t('performance score')} size="h2" />
          </ToolTip>
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-lg bg-table_row p-6">
              <PerformanceScoreCard
                breakdown={{
                  uptime: uptimeScore,
                  governance: governanceScore,
                  commission: commissionScore,
                  slashHistory: slashScore,
                }}
              />
            </div>
          </div>
        </div>

        <div>
          <ToolTip tooltip={t('tooltip delegation flow')} direction={'top'}>
            <SubTitle text={t('delegation flow')} size="h2" />
          </ToolTip>
          <div className="mt-6">
            <DelegationFlowWidget
              totalDelegated={`$${(list.length * 125000).toLocaleString('en-US')}`}
              uniqueDelegators={totalDelegators}
              netDelegationChange={Math.round(totalDelegators * 0.05)}
              selfDelegationRatio={list.length > 0 ? 8.5 : 0}
            />
          </div>
        </div>

        <div>
          <ToolTip tooltip={t('tooltip uptime heatmap')} direction={'top'}>
            <SubTitle text={t('uptime heatmap')} size="h2" />
          </ToolTip>
          <div className="mt-6 flex justify-center overflow-x-auto">
            <UptimeHeatmap data={uptimeData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidatorPerformancePage;
