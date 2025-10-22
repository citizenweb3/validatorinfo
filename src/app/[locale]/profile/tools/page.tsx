import { getTranslations } from 'next-intl/server';

import PageTitle from '@/components/common/page-title';
import SubDescription from '@/components/sub-description';
import { NextPageWithLocale } from '@/i18n';

interface PageProps {}

const ProfileToolsPage: NextPageWithLocale<PageProps> = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'ProfilePage.Tools' });

  return (
    <div>
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
    </div>
  );
};

export default ProfileToolsPage;
