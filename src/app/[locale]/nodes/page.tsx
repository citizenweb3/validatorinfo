import { getTranslations } from 'next-intl/server';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { validatorsTabs } from '@/components/common/tabs/tabs-data';
import Story from '@/components/story';
import { Locale, NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import RoundedButton from '@/components/common/rounded-button';
import Nodes from '@/app/nodes/nodes-list/nodes';

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
  const nodeStatus: string[] = !q.node_status ? [] : typeof q.node_status === 'string' ? [q.node_status] : q.node_status;

  return (
    <div>
      <Story
        src="networks"
        alt="Pixelated, 90s game-style characters connecting web cables of web3 blockchain networks"
      />
      <TabList page="ValidatorsPage" tabs={validatorsTabs} />
      <PageTitle text={t('title')} />
      <div className="mb-3 mt-2 flex justify-end">
        <RoundedButton href={''} className="font-handjet text-lg">
          {t('show world node map')}
        </RoundedButton>
      </div>
      <Nodes
        page="NodesPage"
        ecosystems={ecosystems}
        nodeStatus={nodeStatus}
        perPage={perPage}
        sort={{ sortBy, order }}
        currentPage={currentPage}
      />
    </div>
  );
};

export default NodesPage;
