import { getTranslations } from 'next-intl/server';

import SkipSwap from '@/app/profile/wallet/skip-swap';
import PageTitle from '@/components/common/page-title';
import SubDescription from '@/components/sub-description';
import { NextPageWithLocale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {}

const ProfileWalletPage: NextPageWithLocale<PageProps> = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'ProfilePage.Wallet' });

  return (
    <div>
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <SkipSwap />
    </div>
  );
};

export default ProfileWalletPage;
