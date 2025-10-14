import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';

import TxInformation from '@/app/networks/[name]/tx/[hash]/tx-information';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { getTxInformationTabs } from '@/components/common/tabs/tabs-data';
import SubDescription from '@/components/sub-description';
import { Locale } from '@/i18n';
import chainService from '@/services/chain-service';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'TxInformationPage' });

  return {
    title: t('title'),
  };
}

export default async function TxInformationLayout({
  children,
  params: { locale, name, hash },
}: Readonly<{
  children: ReactNode;
  params: { locale: Locale; name: string; hash: string };
}>) {
  const t = await getTranslations({ locale, namespace: 'TxInformationPage' });
  const chain = await chainService.getByName(name);
  const txInformationTabs = getTxInformationTabs(name, hash);
  const cursor =
    'h-7 min-h-7 w-7 min-w-7 bg-contain bg-no-repeat bg-cursor group-hover:bg-cursor_h group-active:bg-cursor_a';

  return (
    <div className="">
      <PageTitle
        prefix={
          <a href={`/networks/${chain?.name}/overview`} className="group flex flex-row text-highlight hover:underline">
            {chain?.prettyName ?? 'Network'}
            <div className={cursor} />
          </a>
        }
        text={t('title').replace(/^.*?Blockchain /, 'Blockchain ')}
      />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <TxInformation chain={chain} hash={hash} />
      {children}
      <div className="mt-5 w-1/3">
        <TabList tabs={txInformationTabs} page={'TxInformationPage'} />
      </div>
    </div>
  );
}
