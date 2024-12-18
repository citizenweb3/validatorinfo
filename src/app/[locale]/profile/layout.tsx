import { unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import TabList from '@/components/common/tabs/tab-list';
import { profileTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';

export default async function AboutLayout({
  children,
  params: { locale },
}: Readonly<{
  children: ReactNode;
  params: { locale: Locale };
}>) {
  unstable_setRequestLocale(locale);
  return (
    <div>
      <TabList page="ProfilePage" tabs={profileTabs} />
      {children}
    </div>
  );
}
