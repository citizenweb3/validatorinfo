import { getTranslations } from 'next-intl/server';

import GlobalRevenue from '@/app/validators/[validatorIdentity]/revenue/global-revenue';
import RewardsGeneratedChart from '@/app/validators/[validatorIdentity]/revenue/rewards-generated-chart';
import RumorsLink from '@/app/validators/[validatorIdentity]/revenue/rumors-link';
import { validatorExample } from '@/app/validators/[validatorIdentity]/validatorExample';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/common/sub-title';
import { NextPageWithLocale } from '@/i18n';

interface PageProps {
  params: NextPageWithLocale & { validatorIdentity: string };
}

const ValidatorRevenuePage: NextPageWithLocale<PageProps> = async ({ params }) => {
  const { locale, validatorIdentity } = params;
  const t = await getTranslations({ locale, namespace: 'ValidatorRevenuePage' });

  return (
    <div>
      <PageTitle prefix={`${validatorExample.name}:`} text={t('title')} />
      <div className="flex flex-row items-center justify-between">
        <GlobalRevenue identity={validatorIdentity} />
        <RumorsLink identity={validatorIdentity} locale={locale} />
      </div>
      <div className="mb-28 mt-5">
        <SubTitle text={t('rewards generated')} size="h2" />
        <div className="mt-6 flex justify-center">
          <RewardsGeneratedChart />
        </div>
      </div>
    </div>
  );
};

export default ValidatorRevenuePage;
