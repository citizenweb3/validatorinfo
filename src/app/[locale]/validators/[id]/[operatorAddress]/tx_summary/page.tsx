import NodeTxs from '@/app/validators/[id]/[operatorAddress]/tx_summary/txs-table/node-txs';
import { Locale, NextPageWithLocale } from '@/i18n';
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

const TxSummaryPage: NextPageWithLocale<PageProps> = async ({ params: { locale, id, operatorAddress }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'TxSummaryPage' });

  const validatorId = parseInt(id);
  // Cursor-in-URL pagination: ?c=<cursor token>&w=<window>. Cold load lands exactly on that window.
  const cursorToken = typeof q.c === 'string' ? q.c : undefined;
  const windowIndex = q.w ? parseInt(q.w as string, 10) : 0;

  const { validatorNodesWithChainData: list } = await validatorService.getValidatorNodesWithChains(validatorId);
  const node = list.find((item) => item.operatorAddress === operatorAddress);

  return (
    <div className="mb-14">
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <NodeTxs chainName={node?.chain.name ?? 'cosmoshub'}
               page={'TxSummaryPage'}
               accountAddress={node?.accountAddress ?? null}
               operatorAddress={operatorAddress}
               cursorToken={cursorToken}
               windowIndex={Number.isFinite(windowIndex) ? windowIndex : 0} />
    </div>
  );
};

export default TxSummaryPage;
