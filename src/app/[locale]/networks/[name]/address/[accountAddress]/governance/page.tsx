import { getTranslations } from 'next-intl/server';

import NetworkImpactChart from '@/app/networks/[name]/address/[accountAddress]/governance/network-impact-chart';
import VotingHistoryTable from '@/app/networks/[name]/address/[accountAddress]/governance/voting-history/voting-history-table';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/common/sub-title';
import SubDescription from '@/components/sub-description';
import { NextPageWithLocale } from '@/i18n';

interface PageProps {
  params: NextPageWithLocale & { name: string; accountAddress: string };
}

const AccountGovernancePage: NextPageWithLocale<PageProps> = async ({ params: { locale, name } }) => {
  const t = await getTranslations({ locale, namespace: 'AccountPage.Governance' });

  return (
    <div className="mb-14">
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <div className="mt-8">
        <SubTitle text={t('network-impact-title')} size="h2" />
        <div className="mt-6 flex justify-center">
          <NetworkImpactChart />
        </div>
      </div>
      <div className="mt-12">
        <SubTitle text={t('voting-history-title')} size="h2" />
        <VotingHistoryTable chainName={name} page={'AccountPage.Governance'} />
      </div>
    </div>
  );
};

export default AccountGovernancePage;
