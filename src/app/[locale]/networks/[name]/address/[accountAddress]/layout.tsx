import { unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import ProfileLayoutWrapper from '@/components/common/page-header-visibility-wrapper';
import TabList from '@/components/common/tabs/tab-list';
import { getAccountTabs } from '@/components/common/tabs/tabs-data';
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
      <ProfileLayoutWrapper>
        <TabList page="AccountPage" tabs={accountTabs} />
        {children}
      </ProfileLayoutWrapper>
    </div>
  );
}
