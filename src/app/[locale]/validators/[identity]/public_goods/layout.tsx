import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { getValidatorPublicGoodTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';
import ValidatorService from '@/services/validator-service';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'ValidatorPublicGoodsPage' });

  return {
    title: t('title'),
  };
}

export default async function PublicGoodsLayout({
  children,
  params: { locale, identity },
}: Readonly<{
  children: ReactNode;
  params: { locale: Locale; identity: string };
}>) {
  unstable_setRequestLocale(locale);
  const validatorPublicGoodTabs = getValidatorPublicGoodTabs(identity);
  const t = await getTranslations({ locale, namespace: 'ValidatorPublicGoodsPage' });

  const validator = await ValidatorService.getValidatorByIdentity(identity);
  const validatorMoniker = validator ? validator.moniker : 'Validator';

  return (
    <div>
      <PageTitle prefix={`${validatorMoniker}:`} text={t('title')} />
      <div className="my-8 ml-4 font-sfpro text-base">{t('description')}</div>
      <TabList page="ValidatorPublicGoodsPage" tabs={validatorPublicGoodTabs} />
      {children}
    </div>
  );
}
