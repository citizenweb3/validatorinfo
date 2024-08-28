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
      <PageTitle prefix="About" text="Validator Info" />
      <div className="my-3 flex justify-center">
        <Image src="/img/logo.png" alt="logo" width={186} height={174} className="w-32" priority />
      </div>
      <TabList page="AboutPage" tabs={aboutTabs} />
      {children}
    </div>
  );
}
