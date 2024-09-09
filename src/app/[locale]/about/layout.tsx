import { unstable_setRequestLocale } from 'next-intl/server';
import Image from 'next/image';

import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { aboutTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';

export default function AboutLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: Locale };
}>) {
  unstable_setRequestLocale(params.locale);
  return (
    <div>
      <div className="flex flex-shrink">
        <div className="flex flex-col items-center">
          <PageTitle prefix="About" text="Validator Info" />
          <div className="my-3 flex">
            <Image src="/img/logo2.png" alt="logo" width={327} height={327} className="w-32" priority />
          </div>
        </div>
        <div className="flex-grow" />
      </div>
      <TabList page="AboutPage" tabs={aboutTabs} />
      {children}
    </div>
  );
}
