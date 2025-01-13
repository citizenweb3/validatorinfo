import { getTranslations } from 'next-intl/server';

import CommunitiesList from '@/app/validators/[identity]/public_good/community/communities-list';
import RoundedButton from '@/components/common/rounded-button';
import { NextPageWithLocale } from '@/i18n';

interface PageProps {
  params: NextPageWithLocale & { identity: string };
}

const PublicGoodCommunityPage: NextPageWithLocale<PageProps> = async ({ params }) => {
  const { locale, identity } = params;
  const t = await getTranslations({ locale, namespace: 'PublicGoodCommunityPage' });

  return (
    <div className="mb-72">
      <div className="mb-7 ml-4 mt-12 font-sfpro text-base">{t('description')}</div>
      <div className="mt-4 flex justify-end">
        <RoundedButton href={''} className="font-handjet text-base">
          {t('submit new info')}
        </RoundedButton>
      </div>
      <CommunitiesList />
    </div>
  );
};

export default PublicGoodCommunityPage;
