import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import Description from '@/components/common/description';
import UnderDevelopment from '@/components/common/under-development';
import PageTitle from '@/components/common/page-title';
import { NextPageWithLocale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MiningPoolsPage: NextPageWithLocale = async ({ params: { locale } }) => {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'MiningPoolsPage' });
  const underDevelopment = await getTranslations({ locale, namespace: 'UnderDevelopment' });

  return (
    <div className="flex flex-col gap-4">
      <div className="whitespace-nowrap">
        <PageTitle text={t('title')} />
      </div>
      <Description text={t('description')} className="m-4 max-w-4xl" />
      <UnderDevelopment
        title={underDevelopment('title')}
        description={underDevelopment('description')}
      />
    </div>
  );
};

export default MiningPoolsPage;
