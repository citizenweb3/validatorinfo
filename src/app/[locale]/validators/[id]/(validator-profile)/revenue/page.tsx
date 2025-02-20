import { getTranslations } from 'next-intl/server';

import GlobalRevenue from '@/app/validators/[id]/(validator-profile)/revenue/global-revenue';
import RewardsGeneratedChart from '@/app/validators/[id]/(validator-profile)/revenue/rewards-generated-chart';
import RumorsLink from '@/app/validators/[id]/(validator-profile)/revenue/rumors-link';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/common/sub-title';
import ToolTip from '@/components/common/tooltip';
import { Locale, NextPageWithLocale } from '@/i18n';
import validatorService from '@/services/validator-service';

interface PageProps {
  params: NextPageWithLocale & { id: string };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'ValidatorRevenuePage' });

  return {
    title: t('title'),
  };
}

const ValidatorRevenuePage: NextPageWithLocale<PageProps> = async ({ params }) => {
  const { locale, id } = params;
  const validatorId = parseInt(id);
  const t = await getTranslations({ locale, namespace: 'ValidatorRevenuePage' });

  const validator = await validatorService.getById(validatorId);
  const validatorMoniker = validator ? validator.moniker : 'Validator';

  return (
    <div className="mb-20">
      <PageTitle prefix={`${validatorMoniker}:`} text={t('title')} />
      <div className="flex flex-row items-center justify-between">
        <GlobalRevenue id={validatorId} />
        <RumorsLink id={validatorId} locale={locale} />
      </div>
      <div className="mt-6">
        <ToolTip tooltip={t('tooltip rewards generated')} direction={'top'}>
          <SubTitle text={t('rewards generated')} size="h2" />
        </ToolTip>
        <div className="mt-6 flex justify-center">
          <RewardsGeneratedChart />
        </div>
      </div>
    </div>
  );
};

export default ValidatorRevenuePage;
