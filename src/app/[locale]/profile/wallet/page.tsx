import { getTranslations } from 'next-intl/server';

import ChooseAsset from '@/app/profile/wallet/choose-asset';
import PageTitle from '@/components/common/page-title';
import RoundedButton from '@/components/common/rounded-button';
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
      <div className="mt-24">
        <ChooseAsset />
        <ChooseAsset />
      </div>
      <div className="flex justify-center">
        <RoundedButton className="text-lg">{t('Swap')}</RoundedButton>
      </div>
    </div>
  );
};

export default ProfileWalletPage;
