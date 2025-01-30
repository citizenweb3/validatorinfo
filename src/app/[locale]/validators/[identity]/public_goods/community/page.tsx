import { getTranslations } from 'next-intl/server';

import CommunitiesList from '@/app/validators/[identity]/public_goods/community/communities-list';
import RoundedButton from '@/components/common/rounded-button';
import { NextPageWithLocale } from '@/i18n';

interface PageProps {
  params: NextPageWithLocale & { identity: string };
}

const PublicGoodsCommunityPage: NextPageWithLocale<PageProps> = async ({ params }) => {
  const { locale, identity } = params;
  const t = await getTranslations({ locale, namespace: 'PublicGoodsCommunityPage' });

  return (
    <div className="mb-64">
      <div className="mb-4 ml-4 mt-12 font-sfpro text-base">{t('description')}</div>
      <div className="flex justify-end">
        <RoundedButton href={''} className="font-handjet text-base font-light">
          {t('submit new info')}
        </RoundedButton>
      </div>
      <CommunitiesList />
    </div>
  );
};

export default PublicGoodsCommunityPage;
