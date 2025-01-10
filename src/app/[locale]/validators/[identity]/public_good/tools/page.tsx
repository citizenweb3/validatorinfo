import { getTranslations } from 'next-intl/server';

import SubTitle from '@/components/common/sub-title';
import { NextPageWithLocale } from '@/i18n';
import RoundedButton from '@/components/common/rounded-button';
import ValidatorToolList from '@/app/validators/[identity]/public_good/tools/validator-tool-list';

interface PageProps {
  params: NextPageWithLocale & { identity: string };
}

const PublicGoodToolsPage: NextPageWithLocale<PageProps> = async ({ params }) => {
  const { locale, identity } = params;
  const t = await getTranslations({ locale, namespace: 'PublicGoodToolsPage' });

  return (
    <div>
      <div className="font-sfpro text-base mt-12 mb-7 ml-4">{t('description')}</div>
      <div className="flex justify-end mt-4">
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
