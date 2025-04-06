import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';
import TabList from '@/components/common/tabs/tab-list';
import { libraryTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';
import Story from '@/components/story';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'LibraryPage' });

  return {
    title: t('title'),
  };
}

export default async function NodeProfileLayout(
  { children, params: { locale } }: Readonly<{ children: ReactNode; params: { locale: Locale } }>) {
  unstable_setRequestLocale(locale);

  return (
    <div>
      <Story src="library" alt="Pixelated, 90s game-style characters next to five bookcases" />
      <TabList page="LibraryPage" tabs={libraryTabs} />
      {children}
    </div>
  );
}
