import { unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import ValidatorProfile from '@/app/validators/[identity]/validator-profile/validator-profile';
import TabList from '@/components/common/tabs/tab-list';
import { getValidatorProfileTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';

export default async function AboutLayout({
  children,
  params: { locale, identity },
}: Readonly<{
  children: ReactNode;
  params: { locale: Locale; identity: string };
}>) {
  unstable_setRequestLocale(locale);
  const validatorProfileTabs = getValidatorProfileTabs(identity);

  return (
    <div>
      <ValidatorProfile identity={identity} locale={locale} />
      <TabList page="ValidatorProfileHeader" tabs={validatorProfileTabs} />
      {children}
    </div>
  );
}
