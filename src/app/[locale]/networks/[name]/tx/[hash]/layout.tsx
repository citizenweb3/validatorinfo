import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';
import TabList from '@/components/common/tabs/tab-list';
import { getTxInformationTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';
import chainService from '@/services/chain-service';
import PageTitle from '@/components/common/page-title';
import TxInformation from '@/app/networks/[name]/tx/[hash]/tx-information';
import SubDescription from '@/components/sub-description';


export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'TxInformationPage' });

  return {
    title: t('title'),
  };
}

export default async function TxInformationLayout({ children, params: { locale, name, hash } }: Readonly<{
  children: ReactNode;
  params: { locale: Locale; name: string, hash: string };
}>) {
  const t = await getTranslations({ locale, namespace: 'TxInformationPage' });
  const chain = await chainService.getByName(name);
  const txInformationTabs = getTxInformationTabs(name, hash);

  return (
    <div className="">
      <PageTitle
        prefix={
          <a
            href={`/networks/${chain?.name}/overview`}
            className="text-highlight hover:underline"
          >
            {chain?.prettyName ?? 'Network'}
          </a>
        }
        text={t('title').replace(/^.*?Blockchain /, 'Blockchain ')}
      />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <TxInformation chain={chain} hash={hash} />
      {children}
      <div className="w-1/3 mt-5">
        <TabList tabs={txInformationTabs} page={'TxInformationPage'} />
      </div>
    </div>
  );
};
