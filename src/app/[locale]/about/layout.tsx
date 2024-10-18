import { unstable_setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { ReactNode } from 'react';

import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { aboutTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';

export default function AboutLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: { locale: Locale };
}>) {
  unstable_setRequestLocale(params.locale);
  return (
    <div>
      <div className="flex flex-shrink">
        <div className="flex flex-col">
          <PageTitle prefix="About" text="Validator Info" />
          <div className="my-2">
            <Image src="/img/stories/about.png" alt="logo" width={3010} height={208} className="w-full" priority />
          </div>
        </div>
        <div className="flex-grow" />
      </div>
      <TabList page="AboutPage" tabs={aboutTabs} />
      {children}
    </div>
  );
}
