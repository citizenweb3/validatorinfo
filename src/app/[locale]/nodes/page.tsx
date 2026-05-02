import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import Nodes from '@/app/nodes/nodes-list/nodes';
import CollapsiblePageHeader from '@/app/validators/collapsible-page-header';
import icons from '@/components/icons';
import ListFilters from '@/components/common/list-filters/list-filters';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { validatorsTabs } from '@/components/common/tabs/tabs-data';
import Tooltip from '@/components/common/tooltip';
import { Locale, NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import chainService from '@/services/chain-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'NodesPage' });

  return {
    title: t('title'),
  };
}

const defaultPerPage = 25;

const NodesPage: NextPageWithLocale<PageProps> = async ({ params: { locale }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'NodesPage' });
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'operatorAddress') ?? 'operatorAddress';
  const order = (q.order as SortDirection) ?? 'asc';
  const ecosystems: string[] = !q.ecosystems ? [] : typeof q.ecosystems === 'string' ? [q.ecosystems] : q.ecosystems;
  const networks: string[] = !q.networks ? [] : typeof q.networks === 'string' ? [q.networks] : q.networks;
  const nodeStatus: string[] = !q.node_status
    ? []
    : typeof q.node_status === 'string'
      ? [q.node_status]
      : q.node_status;

  const allChains = await chainService.getAllLight();

  const networksDropdown = allChains
    .filter((chain) => ecosystems.length === 0 || ecosystems.includes(chain.ecosystem))
    .map((chain) => ({
      value: chain.name,
      title: chain.prettyName,
    }));

  const allowedEcosystems =
    networks.length > 0
      ? Array.from(new Set(allChains.filter((chain) => networks.includes(chain.name)).map((c) => c.ecosystem)))
      : [];

  return (
    <div>
      <TabList page="ValidatorsPage" tabs={validatorsTabs} />
      <CollapsiblePageHeader description={t('description')}>
        <PageTitle text={t('title')} />
      </CollapsiblePageHeader>
      <div className="flex flex-row items-center justify-between gap-4">
        <ListFilters
          expanded
          isEcosystems
          isNetworks
          isNodeStatus
          isSetPositions
          isNetworkStage
          perPage={perPage}
          selectedEcosystems={ecosystems}
          selectedNetworks={networks}
          selectedNodeStatus={nodeStatus}
          networksDropdown={networksDropdown}
          allowedEcosystems={allowedEcosystems}
        />
        <Tooltip tooltip={t('show world node map')} direction="top">
          <Link href="" aria-label={t('show world node map')}>
            <Image
              src={icons.NetworkProfilePlanet}
              alt="Planet"
              width={70}
              height={70}
              className="opacity-70 hover:opacity-100"
            />
          </Link>
        </Tooltip>
      </div>
      <Nodes
        page="NodesPage"
        ecosystems={ecosystems}
        networks={networks}
        nodeStatus={nodeStatus}
        perPage={perPage}
        sort={{ sortBy, order }}
        currentPage={currentPage}
      />
    </div>
  );
};

export default NodesPage;
