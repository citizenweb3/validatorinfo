import { unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import MiningPoolProfile from '@/app/mining-pools/[poolSlug]/(mining-pool-profile)/mining-pool-profile/mining-pool-profile';
import CollapsePageHeader from '@/components/common/collapse-page-header';
import ProfileLayoutWrapper from '@/components/common/page-header-visibility-wrapper';
import TabList from '@/components/common/tabs/tab-list';
import { getMiningPoolProfileTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';

export default async function MiningPoolProfileLayout({
  children,
  params: { locale, poolSlug },
}: Readonly<{
  children: ReactNode;
  params: { locale: Locale; poolSlug: string };
}>) {
  unstable_setRequestLocale(locale);
  const tabs = getMiningPoolProfileTabs(poolSlug);

  return (
    <ProfileLayoutWrapper>
      <CollapsePageHeader>
        <MiningPoolProfile slug={poolSlug} locale={locale} />
      </CollapsePageHeader>
      <TabList page="MiningPoolProfileHeader" tabs={tabs} />
      {children}
    </ProfileLayoutWrapper>
  );
}
