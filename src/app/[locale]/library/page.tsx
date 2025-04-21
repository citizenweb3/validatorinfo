import { getTranslations } from 'next-intl/server';

import PageTitle from '@/components/common/page-title';
import { NextPageWithLocale } from '@/i18n';
import SpreadModal from '@/app/about/modals/spread-modal';

interface PageProps {}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const LibraryPage: NextPageWithLocale<PageProps> = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'LibraryPage' });

  return (
    <div>
      <PageTitle text={t('title')} />
      <div className="ml-8 mt-3 mb-2 font-sfpro text-base">{t('description')}</div>
      <div className="flex flex-col items-end">
        <SpreadModal />
      </div>
    </div>
  );
};

export default LibraryPage;
