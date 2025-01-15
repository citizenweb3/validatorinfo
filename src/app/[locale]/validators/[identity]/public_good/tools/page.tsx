import { getTranslations } from 'next-intl/server';

import ValidatorToolList from '@/app/validators/[identity]/public_good/tools/validator-tool-list';
import RoundedButton from '@/components/common/rounded-button';
import SubTitle from '@/components/common/sub-title';
import { NextPageWithLocale } from '@/i18n';

interface PageProps {
  params: NextPageWithLocale & { identity: string };
}

const PublicGoodToolsPage: NextPageWithLocale<PageProps> = async ({ params }) => {
  const { locale, identity } = params;
  const t = await getTranslations({ locale, namespace: 'PublicGoodToolsPage' });

  return (
    <div className="mb-20">
      <div className="mb-7 ml-4 mt-12 font-sfpro text-base">{t('description')}</div>
      <div className="mt-4 flex justify-end">
        <RoundedButton href={''} className="font-handjet text-base">
          {t('submit new info')}
        </RoundedButton>
      </div>
      <SubTitle text={t('tool list')} size="h2" />
      <ValidatorToolList />
    </div>
  );
};

export default PublicGoodToolsPage;
