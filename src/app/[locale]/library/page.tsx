import { getTranslations } from 'next-intl/server';
import PageTitle from '@/components/common/page-title';
import { NextPageWithLocale } from '@/i18n';
import SubDescription from '@/components/sub-description';

interface PageProps {
}

const LibraryPage: NextPageWithLocale<PageProps> = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'LibraryPage' });

  return (
    <div>
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
    </div>
  );
};

export default LibraryPage;
