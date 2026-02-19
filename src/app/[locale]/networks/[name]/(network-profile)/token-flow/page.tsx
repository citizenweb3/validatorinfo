import { getTranslations } from 'next-intl/server';

import PageTitle from '@/components/common/page-title';
import UnderDevelopment from '@/components/common/under-development';
import SubDescription from '@/components/sub-description';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';

export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { name: string };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'NetworkTokenomics' });

  return {
    title: t('Token Flow'),
  };
}

const TokenFlowPage: NextPageWithLocale<PageProps> = async ({ params: { locale, name } }) => {
  const t = await getTranslations({ locale, namespace: 'NetworkTokenomics' });
  const chain = await chainService.getByName(name);

  return (
    <div className="mb-6">
      <PageTitle prefix={chain?.prettyName ?? 'Network'} text={t('Token Flow')} />
      <SubDescription text={t('token flow description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <div className="mt-10">
        <UnderDevelopment
          title={t('token flow chart title')}
          description={t('token flow chart description')}
          size="lg"
        />
      </div>
    </div>
  );
};

export default TokenFlowPage;
