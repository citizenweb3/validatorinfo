import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import CollapsePageHeader from '@/components/common/collapse-page-header';
import PageHeaderVisibilityWrapper from '@/components/common/page-header-visibility-wrapper';
import TabList from '@/components/common/tabs/tab-list';
import { libraryTabs } from '@/components/common/tabs/tabs-data';
import Story from '@/components/story';
import { Locale } from '@/i18n';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'LibraryPage' });

  return {
    title: t('title'),
  };
}

export default async function NodeProfileLayout({
  children,
  params: { locale },
}: Readonly<{ children: ReactNode; params: { locale: Locale } }>) {
  unstable_setRequestLocale(locale);

  return (
    <div>
      <PageHeaderVisibilityWrapper>
        <CollapsePageHeader>
          <Story src="library" alt="Pixelated, 90s game-style characters next to five bookcases" />
        </CollapsePageHeader>
        <TabList page="LibraryPage" tabs={libraryTabs} />
        {children}
      </PageHeaderVisibilityWrapper>
    </div>
  );
}
