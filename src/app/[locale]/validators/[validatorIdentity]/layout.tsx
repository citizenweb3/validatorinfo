import { unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';



import ValidatorProfile from '@/app/validators/[validatorIdentity]/validator-profile/validator-profile';
import TabList from '@/components/common/tabs/tab-list';
import { getValidatorProfileTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';


export default async function AboutLayout({
  children,
  params: { locale, validatorIdentity },
}: Readonly<{
  children: ReactNode;
  params: { locale: Locale; validatorIdentity: string };
}>) {
  unstable_setRequestLocale(locale);
  const validatorProfileTabs = getValidatorProfileTabs(validatorIdentity);
  return (
    <div>
      <ValidatorProfile identity={validatorIdentity} locale={locale} />
      <TabList page="ValidatorProfileHeader" tabs={validatorProfileTabs} />
      {children}
    </div>
  );
}
