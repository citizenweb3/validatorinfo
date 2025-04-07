import NodeTxs from '@/app/validators/[id]/[operatorAddress]/tx_summary/txs-table/node-txs';
import { Locale, NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import validatorService from '@/services/validator-service';
import { getTranslations } from 'next-intl/server';
import SubDescription from '@/components/sub-description';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { id: string; operatorAddress: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'TotalTxsPage' });

  return {
    title: t('title'),
  };
}

const defaultPerPage = 1;

const TxSummaryPage: NextPageWithLocale<PageProps> = async ({ params: { locale, id, operatorAddress }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'TxSummaryPage' });

  const validatorId = parseInt(id);
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';

  const { validatorNodesWithChainData: list } = await validatorService.getValidatorNodesWithChains(validatorId);
  const node = list.find((item) => item.operatorAddress === operatorAddress);

  return (
    <div className="mb-14">
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <NodeTxs chainId={node?.chainId ?? 1}
               page={'TxSummaryPage'}
               perPage={perPage}
               currentPage={currentPage}
               sort={{ sortBy, order }} />
    </div>);
};

export default TxSummaryPage;
