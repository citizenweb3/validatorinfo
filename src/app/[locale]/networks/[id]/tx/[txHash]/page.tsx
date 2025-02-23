import { getTranslations } from 'next-intl/server';
import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import TransactionInformation from '@/app/networks/[id]/tx/[txHash]/transaction-information';
import { getTxInformationTabs } from '@/components/common/tabs/tabs-data';
import TabList from '@/components/common/tabs/tab-list';

interface PageProps {
  params: NextPageWithLocale & { id: string; txHash: string };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'TxInformationPage' });

  return {
    title: t('title'),
  };
}

const TxInformationPage: NextPageWithLocale<PageProps> = async ({ params: { locale, id, txHash } }) => {
  const t = await getTranslations({ locale, namespace: 'TxInformationPage' });
  const chainId = parseInt(id);
  const chain = await chainService.getById(chainId);
  const txInformationTabs = getTxInformationTabs(chainId, txHash);


  return (
    <div className="mb-24">
      <PageTitle text={t('title')} />
      <TransactionInformation chain={chain ?? undefined} txHash={txHash} />
      <div className="w-1/3">
        <TabList tabs={txInformationTabs} page={'TxInformationPage'} />
      </div>
    </div>
  );
};

export default TxInformationPage;
