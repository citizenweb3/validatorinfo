import Image from 'next/image';

import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { aboutTabs } from '@/components/common/tabs/tabs-data';

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <PageTitle prefix="About" text="Validator Info" />
      <div className="my-3 flex justify-center">
        <Image src="/img/logo.svg" alt="logo" width={129} height={118} className="w-32" priority />
      </div>
      <TabList tabs={aboutTabs} />
      {children}
    </div>
  );
}
