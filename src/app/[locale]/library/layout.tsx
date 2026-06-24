import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';

import TabList from '@/components/common/tabs/tab-list';
import { homeTabsHorizontal } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'LibraryPage' });

  return {
    title: t('title'),
  };
}

export default async function NodeProfileLayout(
  {
    children,
    params: { locale },
  }: Readonly<{ children: ReactNode; params: { locale: Locale } }>) {
  return (
    <div>
      <TabList page="HomePage" tabs={homeTabsHorizontal} />
      {children}
    </div>
  );
}
