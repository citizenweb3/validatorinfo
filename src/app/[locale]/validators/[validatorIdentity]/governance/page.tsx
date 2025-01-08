import { getTranslations } from 'next-intl/server';

import ValidatorCreatedProposalsBar from '@/app/validators/[validatorIdentity]/governance/created-proposals-bar';
import ValidatorVotes from '@/app/validators/[validatorIdentity]/governance/validator-votes/validator-votes';
import MetricsChartLine from '@/app/validators/[validatorIdentity]/metrics/metrics-chart';
import MetricsList from '@/app/validators/[validatorIdentity]/metrics/metrics-list';
import RewardsGeneratedChart from '@/app/validators/[validatorIdentity]/revenue/rewards-generated-chart';
import { validatorExample } from '@/app/validators/[validatorIdentity]/validatorExample';
import PageTitle from '@/components/common/page-title';
import RoundedButton from '@/components/common/rounded-button';
import SubTitle from '@/components/common/sub-title';
import { NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/services/validator-service';

interface PageProps {
  params: NextPageWithLocale & { validatorIdentyty: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 1;

const ValidatorGovernancePage: NextPageWithLocale<PageProps> = async ({ params: { locale }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorGovernancePage' });
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';

  return (
    <div>
      <PageTitle prefix={`${validatorExample.name}:`} text={t('title')} />
      <div className="mb-20 mt-6">
        <SubTitle text={t('proposals')} size="h2" />
        <div className="mt-6 flex justify-center">
          <ValidatorCreatedProposalsBar />
        </div>
      </div>
      <div>
        <SubTitle text={t('news feed')} size="h2" />
        <div className="flex justify-end my-4">
          <RoundedButton href={''} className="font-handjet text-base">
            {t('similar options')}
          </RoundedButton>
        </div>
        <ValidatorVotes
          page={'ValidatorGovernancePage'}
          perPage={perPage}
          currentPage={currentPage}
          sort={{ sortBy, order }}
        />
      </div>
    </div>
  );
};

export default ValidatorGovernancePage;
