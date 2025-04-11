import { getTranslations } from 'next-intl/server';

import MetricsBlocks from '@/app/validators/[id]/(validator-profile)/metrics/metrics-blocks';
import MetricsChartLine from '@/app/validators/[id]/(validator-profile)/metrics/metrics-chart';
import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import validatorService from '@/services/validator-service';
import SubDescription from '@/components/sub-description';

interface PageProps {
  params: NextPageWithLocale & { id: string };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'ValidatorMetricsPage' });

  return {
    title: t('title'),
  };
}

const ValidatorMetricsPage: NextPageWithLocale<PageProps> = async ({ params }) => {
  const { locale, id } = params;
  const validatorId = parseInt(id);
  const t = await getTranslations({ locale, namespace: 'ValidatorMetricsPage' });

  const validator = await validatorService.getById(validatorId);
  const validatorMoniker = validator ? validator.moniker : 'Validator';

  return (
    <div className="mb-20">
      <PageTitle prefix={`${validatorMoniker}`} text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <MetricsBlocks id={validatorId} />
      <MetricsChartLine />
    </div>
  );
};

export default ValidatorMetricsPage;
