import { unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import NetworkProfileHeader from '@/app/networks/[name]/(network-profile)/network-profile-header/network-profile-header';
import CollapsePageHeader from '@/components/common/collapse-page-header';
import PageHeaderVisibilityWrapper from '@/components/common/page-header-visibility-wrapper';
import TabList from '@/components/common/tabs/tab-list';
import { getNetworkProfileTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NetworkProfileLayout({
  children,
  params: { locale, name },
}: Readonly<{
  children: ReactNode;
  params: { locale: Locale; name: string };
}>) {
  unstable_setRequestLocale(locale);
  const networkProfileTabs = getNetworkProfileTabs(name);

  return (
    <PageHeaderVisibilityWrapper>
      <CollapsePageHeader>
        <NetworkProfileHeader chainName={name} locale={locale} />
      </CollapsePageHeader>
      <TabList page="NetworkProfileHeader" tabs={networkProfileTabs} />
      {children}
    </PageHeaderVisibilityWrapper>
  );
}
