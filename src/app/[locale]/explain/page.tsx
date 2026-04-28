import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import Description from '@/components/common/description';
import UnderDevelopment from '@/components/common/under-development';
import PageTitle from '@/components/common/page-title';
import { NextPageWithLocale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ExplainPage: NextPageWithLocale = async ({ params: { locale } }) => {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ExplainPage' });
  const underDevelopment = await getTranslations({ locale, namespace: 'UnderDevelopment' });

  return (
    <div className="flex flex-col gap-4">
      <PageTitle text={t('title')} />
      <Description text={t('description')} className="m-4 max-w-4xl" />
      <UnderDevelopment
        title={underDevelopment('title')}
        description={underDevelopment('description')}
      />
    </div>
  );
};

export default ExplainPage;
