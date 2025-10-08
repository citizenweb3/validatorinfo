import { unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import NetworkProfileHeader from '@/app/networks/[name]/(network-profile)/network-profile-header/network-profile-header';
import TabList from '@/components/common/tabs/tab-list';
import { getNetworkProfileTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';

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
    <div>
      <NetworkProfileHeader chainName={name} locale={locale} />
      <TabList page="NetworkProfileHeader" tabs={networkProfileTabs} />
      {children}
    </div>
  );
}
