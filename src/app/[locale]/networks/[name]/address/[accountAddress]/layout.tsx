import { unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import TabList from '@/components/common/tabs/tab-list';
import { getAccountTabs } from '@/components/common/tabs/tabs-data';
import Story from '@/components/story';
import { Locale } from '@/i18n';

export default async function AccountLayout({
  children,
  params: { locale, name, accountAddress },
}: Readonly<{
  children: ReactNode;
  params: { locale: Locale; name: string; accountAddress: string };
}>) {
  unstable_setRequestLocale(locale);
  const accountTabs = getAccountTabs(name, accountAddress);

  return (
    <div>
      <Story src="account" alt="Pixelated, 90s game-style characters" />
      <TabList page="AccountPage" tabs={accountTabs} />
      {children}
    </div>
  );
}
