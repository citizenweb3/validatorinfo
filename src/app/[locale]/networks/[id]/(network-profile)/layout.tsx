import { unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import NetworkProfileHeader from '@/app/networks/[id]/(network-profile)/network-profile-header/network-profile-header';
import TabList from '@/components/common/tabs/tab-list';
import { getNetworkProfileTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';

export default async function NetworkProfileLayout({
  children,
  params: { locale, id },
}: Readonly<{
  children: ReactNode;
  params: { locale: Locale; id: string };
}>) {
  unstable_setRequestLocale(locale);
  const chainId = parseInt(id);
  const networkProfileTabs = getNetworkProfileTabs(chainId);

  return (
    <div>
      <NetworkProfileHeader id={id} locale={locale} />
      <TabList page="NetworkProfileHeader" tabs={networkProfileTabs} />
      {children}
    </div>
  );
}
