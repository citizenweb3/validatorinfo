import { getTranslations } from 'next-intl/server';

import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import PeersSeedsBlocks from '@/app/networks/[id]/(network-profile)/dev/peers-seeds-blocks';
import DevInfoParameters from '@/app/networks/[id]/(network-profile)/dev/dev-info-parameters';
import DeveloperActivity from '@/app/networks/[id]/(network-profile)/dev/developer-activity/developer-activity';
import SubDescription from '@/components/sub-description';

interface PageProps {
  params: NextPageWithLocale & { id: string };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'NetworkDevInfo' });

  return {
    title: t('title'),
  };
}


const NetworkDevInfoPage: NextPageWithLocale<PageProps> = async ({
    params: { locale, id },
  }) => {
  const t = await getTranslations({ locale, namespace: 'NetworkDevInfo' });
  const chainId = parseInt(id);
  const chain = await chainService.getById(chainId);

  return (
    <div>
      <PageTitle prefix={chain?.prettyName ?? 'Network'} text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <PeersSeedsBlocks />
      <DevInfoParameters chain={chain ?? undefined} />
      <DeveloperActivity />
    </div>
  );
};

export default NetworkDevInfoPage;
