import { getTranslations } from 'next-intl/server';

import { NextPageWithLocale } from '@/i18n';
import PageTitle from '@/components/common/page-title';
import SubDescription from '@/components/sub-description';

interface PageProps {}

const ProfileBoardPage: NextPageWithLocale<PageProps> = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'ProfilePage.Board' });

  return (
    <div>
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
    </div>
  );
};

export default ProfileBoardPage;
