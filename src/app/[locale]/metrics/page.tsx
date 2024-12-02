import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import Letter from '@/app/metrics/letter';
import Letters from '@/app/metrics/letters';
import Switcher from '@/app/metrics/switcher';
import Story from '@/components/Story';
import PageTitle from '@/components/common/page-title';
import PlusButton from '@/components/common/plus-button';
import TabList from '@/components/common/tabs/tab-list';
import { validatorsTabs } from '@/components/common/tabs/tabs-data';
import { NextPageWithLocale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {}

const MetricsPage: NextPageWithLocale<PageProps> = async ({ params: { locale } }) => {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'MetricsPage' });

  return (
    <div>
      <Story src="metrics" />
      <TabList page="ValidatorsPage" tabs={validatorsTabs} />
      <PageTitle text={t('title')} />
      <Switcher />
      <Letters />
      <Letter letter="T" />

      <div className="mt-6">
        <div className="flex w-1/2 items-center justify-between border-b border-primary p-5 px-5 text-base font-bold">
          <div>{t('Token')}</div>
          <PlusButton size="sm" isOpened={false} />
        </div>
        <div className="flex w-1/2 items-center justify-between border-b border-primary p-5 px-5 text-base font-bold">
          <div>{t('Total Supply')}</div>
          <PlusButton size="sm" isOpened={false} />
        </div>
        <div className="flex w-1/2 items-center justify-between border-b border-primary p-5 px-5 text-base font-bold">
          <div>{t('TVL')}</div>
          <PlusButton size="sm" isOpened={false} />
        </div>
        <div className="flex w-1/2 items-center justify-between border-b border-primary p-5 px-5 text-base font-bold">
          <div>{t('TVS')}</div>
          <PlusButton size="sm" isOpened={false} />
        </div>
      </div>
    </div>
  );
};

export default MetricsPage;
