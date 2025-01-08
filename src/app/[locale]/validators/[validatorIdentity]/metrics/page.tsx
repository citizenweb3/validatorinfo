import { getTranslations } from 'next-intl/server';
import MetricsList from '@/app/validators/[validatorIdentity]/metrics/metrics-list';
import { validatorExample } from '@/app/validators/[validatorIdentity]/validatorExample';
import PageTitle from '@/components/common/page-title';
import { NextPageWithLocale } from '@/i18n';
import MetricsChartLine from '@/app/validators/[validatorIdentity]/metrics/metrics-chart';

interface PageProps {
  params: NextPageWithLocale & { validatorIdentity: string };
}

const ValidatorMetricsPage: NextPageWithLocale<PageProps> = async ({ params }) => {
  const { locale, validatorIdentity } = params;
  const t = await getTranslations({ locale, namespace: 'ValidatorMetricsPage' });

  return (
    <div>
      <PageTitle prefix={`${validatorExample.name}:`} text={t('title')} />
      <MetricsList />
      <MetricsChartLine />
    </div>
  );
};

export default ValidatorMetricsPage;
