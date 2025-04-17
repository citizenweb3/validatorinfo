import { getTranslations } from 'next-intl/server';

import PageTitle from '@/components/common/page-title';
import { NextPageWithLocale } from '@/i18n';
import SpreadModal from '@/app/about/modals/spread-modal';
import SubDescription from '@/components/sub-description';

interface PageProps {}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const LibraryPage: NextPageWithLocale<PageProps> = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'LibraryPage' });

  return (
    <div>
      <PageTitle text={t('title')} />
      <div className="ml-8 mt-3 font-sfpro text-base">{t('description')}</div>
      <div className="flex flex-col items-center justify-center">
        <SpreadModal />
      </div>
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
    </div>
  );
};

export default LibraryPage;
