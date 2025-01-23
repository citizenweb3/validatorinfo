import { getTranslations } from 'next-intl/server';

import MetricsChartLine from '@/app/validators/[identity]/(profile)/metrics/metrics-chart';
import MetricsBlocks from '@/app/validators/[identity]/(profile)/metrics/metrics-blocks/metrics-blocks';
import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import ValidatorService from '@/services/validator-service';

interface PageProps {
  params: NextPageWithLocale & { identity: string };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'ValidatorMetricsPage' });

  return {
    title: t('title'),
  };
}

const ValidatorMetricsPage: NextPageWithLocale<PageProps> = async ({ params }) => {
  const { locale, identity } = params;
  const t = await getTranslations({ locale, namespace: 'ValidatorMetricsPage' });

  const validator = await ValidatorService.getValidatorByIdentity(identity);
  const validatorMoniker = validator ? validator.moniker : 'Validator';

  return (
    <div className="mb-20">
      <PageTitle prefix={`${validatorMoniker}:`} text={t('title')} />
      <MetricsBlocks identity={identity} />
      <MetricsChartLine />
    </div>
  );
};

export default ValidatorMetricsPage;
