import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { ReactNode } from 'react';

import PageTitle from '@/components/common/page-title';
import RoundedButton from '@/components/common/rounded-button';
import TabList from '@/components/common/tabs/tab-list';
import { profileTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';

export default async function AboutLayout({
  children,
  params: { locale },
}: Readonly<{
  children: ReactNode;
  params: { locale: Locale };
}>) {
  const t = await getTranslations({ locale, namespace: 'ProfilePage' });
  unstable_setRequestLocale(locale);
  return (
    <div>
      <div className="my-4 flex items-end justify-between">
        <div className="flex flex-shrink">
          <div className="flex flex-col">
            <PageTitle prefix="Welcome" text="User1" />
            <Image
              src="/img/avatars/default.png"
              alt="avatar"
              width={62}
              height={58}
              className="ml-20 mt-4 w-28"
              priority
            />
          </div>
          <div className="flex-grow" />
        </div>
        <RoundedButton className="text-xl" contentClassName="px-16">
          {t('validatorBtn')}
        </RoundedButton>
      </div>
      <TabList page="ProfilePage" tabs={profileTabs} />
      {children}
    </div>
  );
}
