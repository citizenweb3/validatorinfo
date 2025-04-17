import { unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';
import TabList from '@/components/common/tabs/tab-list';
import { getAccountTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';
import Story from '@/components/story';

export default async function AccountLayout({
    children,
    params: { locale, id, accountAddress },
  }: Readonly<{
    children: ReactNode;
    params: { locale: Locale; id: string; accountAddress: string };
  }>) {
  unstable_setRequestLocale(locale);
  const chainId = parseInt(id);
  const accountTabs = getAccountTabs(chainId, accountAddress);

  return (
    <div>
      <Story
        src="account"
        alt="Pixelated, 90s game-style characters"
      />
      <TabList page="AccountPage" tabs={accountTabs} />
      {children}
    </div>
  );
}
