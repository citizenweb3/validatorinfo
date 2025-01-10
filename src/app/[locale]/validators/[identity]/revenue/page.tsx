import { getTranslations } from 'next-intl/server';

import GlobalRevenue from '@/app/validators/[identity]/revenue/global-revenue';
import RewardsGeneratedChart from '@/app/validators/[identity]/revenue/rewards-generated-chart';
import RumorsLink from '@/app/validators/[identity]/revenue/rumors-link';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/common/sub-title';
import { NextPageWithLocale } from '@/i18n';
import ValidatorService from '@/services/validator-service';

interface PageProps {
  params: NextPageWithLocale & { identity: string };
}

const ValidatorRevenuePage: NextPageWithLocale<PageProps> = async ({ params }) => {
  const { locale, identity } = params;
  const t = await getTranslations({ locale, namespace: 'ValidatorRevenuePage' });

  const validator = await ValidatorService.getValidatorByIdentity(identity);
  const validatorMoniker = validator ? validator.moniker : "Validator";


  return (
    <div>
      <PageTitle prefix={`${validatorMoniker}:`} text={t('title')} />
      <div className="flex flex-row items-center justify-between">
        <GlobalRevenue identity={identity} />
        <RumorsLink identity={identity} locale={locale} />
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
