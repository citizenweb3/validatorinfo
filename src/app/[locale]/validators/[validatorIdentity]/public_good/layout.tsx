import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import ValidatorProfile from '@/app/validators/[validatorIdentity]/validator-profile/validator-profile';
import { validatorExample } from '@/app/validators/[validatorIdentity]/validatorExample';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { getValidatorProfileTabs, getValidatorPublicGoodTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';

export default async function AboutLayout({
  children,
  params: { locale, validatorIdentity },
}: Readonly<{
  children: ReactNode;
  params: { locale: Locale; validatorIdentity: string };
}>) {
  unstable_setRequestLocale(locale);
  const validatorPublicGoodTabs = getValidatorPublicGoodTabs(validatorIdentity);
  const t = await getTranslations({ locale, namespace: 'ValidatorPublicGoodPage' });

  return (
    <div>
      <PageTitle prefix={`${t('title')}:`} text={validatorExample.name} />
      <div className="font-sfpro text-base">{t('description')}</div>
      <TabList page="ValidatorPublicGoodPage" tabs={validatorPublicGoodTabs} />
      {children}
    </div>
  );
}
