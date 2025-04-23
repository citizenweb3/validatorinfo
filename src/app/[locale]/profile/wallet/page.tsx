import { getTranslations } from 'next-intl/server';

import PageTitle from '@/components/common/page-title';
import { NextPageWithLocale } from '@/i18n';
import ChooseAsset from '@/app/profile/wallet/choose-asset';
import RoundedButton from '@/components/common/rounded-button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {}

const ProfileWalletPage: NextPageWithLocale<PageProps> = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'ProfilePage.Wallet' });

  return (
    <div>
      <PageTitle text={t('title')} />
      <div className="mt-24">
        <ChooseAsset />
        <ChooseAsset />
      </div>
      <div className="flex justify-center">
        <RoundedButton className="text-lg">{t('Connect Wallet')}</RoundedButton>
      </div>
    </div>
  );
};

export default ProfileWalletPage;
