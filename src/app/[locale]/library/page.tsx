import { getTranslations } from 'next-intl/server';

import CollapsiblePageHeader from '@/app/validators/collapsible-page-header';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/common/sub-title';
import { NextPageWithLocale } from '@/i18n';
import SpreadModal from '@/app/about/modals/spread-modal';

interface PageProps {
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const LibraryPage: NextPageWithLocale<PageProps> = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'LibraryPage' });

  return (
    <div>
      <CollapsiblePageHeader description={t('description')}>
        <PageTitle text={t('title')} />
      </CollapsiblePageHeader>
      <SubTitle text={t('UnderConstruction')} className={'my-4'} />
      <div className="blur-sm">
        <div className="ml-8 mt-3 mb-2 font-sfpro text-base">{t('description')}</div>
        <div className="flex flex-col items-end">
          <SpreadModal />
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
