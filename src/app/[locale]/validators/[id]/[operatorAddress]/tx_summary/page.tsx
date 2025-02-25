import { getTranslations } from 'next-intl/server';

import NodePagesTitle from '@/app/validators/[id]/[operatorAddress]/node-pages-title';
import NodeTxs from '@/app/validators/[id]/[operatorAddress]/tx_summary/txs-table/node-txs';
import { Locale, NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import validatorService from '@/services/validator-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { id: string; operatorAddress: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'TxSummaryPage' });

  return {
    title: t('title'),
  };
}

const defaultPerPage = 1;

const TxSummaryPage: NextPageWithLocale<PageProps> = async ({
                                                              params: { locale, id, operatorAddress },
                                                              searchParams: q,
                                                            }) => {
  const validatorId = parseInt(id);
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';

  const { validatorNodesWithChainData: list } = await validatorService.getValidatorNodesWithChains(validatorId);
  const node = list.find((item) => item.operatorAddress === operatorAddress);
  console.log(node?.chainId);

  return (
    <div className="mb-14">
      <NodePagesTitle page={'TxSummaryPage'} locale={locale} node={node} />
      <NodeTxs chainId={node?.chainId ?? 1} page={'TxSummaryPage'} perPage={perPage} currentPage={currentPage}
               sort={{ sortBy, order }} />
    </div>
  );
};

export default TxSummaryPage;
