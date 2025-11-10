import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import DecentralizationBar from '@/app/web3stats/bars/decentralization-bar';
import ScalabilityBar from '@/app/web3stats/bars/scalability-bar';
import SecurityBar from '@/app/web3stats/bars/security-bar';
import Web3statsCharts from '@/app/web3stats/charts';
import TotalsList from '@/app/web3stats/totals/totals-list';
import CollapsePageHeader from '@/components/common/collapse-page-header';
import PageHeaderVisibilityWrapper from '@/components/common/page-header-visibility-wrapper';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/common/sub-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import TextLink from '@/components/common/text-link';
import Story from '@/components/story';
import SubDescription from '@/components/sub-description';
import { Locale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'GlobalPosPage' });
  return {
    title: t('Metadata.title'),
  };
}

export default async function GlobalPosPage({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'GlobalPosPage' });

  const cursor =
    'h-7 min-h-7 w-7 min-w-7 bg-contain bg-no-repeat bg-cursor group-hover:bg-cursor_h group-active:bg-cursor_a';

  const translations = {
    status: t('status'),
    dominance: t('dominance'),
    total: t('total'),
    cap: t('cap'),
  };

  return (
    <div className="flex flex-col">
      <PageHeaderVisibilityWrapper>
        <CollapsePageHeader>
          <Story
            src="global"
            alt="Pixelated, 90s game-style characters riding roller coaster of web3 charts and statistics"
          />
        </CollapsePageHeader>
        <TabList page="HomePage" tabs={mainTabs} />
      </PageHeaderVisibilityWrapper>
      <PageTitle
        text={t.rich('title', {
          ecosystemLink: (chunks) => (
            <TextLink
              className="group ml-2 flex"
              content={
                <>
                  {chunks}
                  <div className={cursor} />
                </>
              }
              href="/ecosystems"
              target="_blank"
            />
          ),
        })}
      />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <Suspense fallback={<div />}>
        <TotalsList />
      </Suspense>
      <div className="mt-20">
        <SubTitle text={t('status')} size="h2" />
      </div>
      <div className="mt-16 flex justify-between px-36">
        <DecentralizationBar />
        <ScalabilityBar />
        <SecurityBar />
      </div>
      <div>
        <Web3statsCharts translations={translations} />
      </div>
    </div>
  );
}
