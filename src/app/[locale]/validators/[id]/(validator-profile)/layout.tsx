import { unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import ValidatorProfile from '@/app/validators/[id]/(validator-profile)/validator-profile/validator-profile';
import CollapsePageHeader from '@/components/common/collapse-page-header';
import ProfileLayoutWrapper from '@/components/common/page-header-visibility-wrapper';
import TabList from '@/components/common/tabs/tab-list';
import { getValidatorProfileTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';

export default async function ValidatorProfileLayout({
  children,
  params: { locale, id },
}: Readonly<{
  children: ReactNode;
  params: { locale: Locale; id: string };
}>) {
  const validatorId = parseInt(id);
  unstable_setRequestLocale(locale);
  const validatorProfileTabs = getValidatorProfileTabs(validatorId);

  return (
    <ProfileLayoutWrapper>
      <CollapsePageHeader>
        <ValidatorProfile id={validatorId} locale={locale} />
      </CollapsePageHeader>
      <TabList page="ValidatorProfileHeader" tabs={validatorProfileTabs} />
      {children}
    </ProfileLayoutWrapper>
  );
}
