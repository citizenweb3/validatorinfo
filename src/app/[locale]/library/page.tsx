import { getTranslations } from 'next-intl/server';
import PageTitle from '@/components/common/page-title';
import { NextPageWithLocale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
}

const LibraryPage: NextPageWithLocale<PageProps> = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'LibraryPage' });

  return (
    <div>
      <PageTitle text={t('title')} />
      <div className="ml-8 mt-3 font-sfpro text-base">{t('description')}</div>
    </div>
  );
};

export default LibraryPage;
