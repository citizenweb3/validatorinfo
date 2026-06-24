import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import MiningPoolBlocksTable from '@/app/mining-pools/[poolSlug]/(mining-pool-profile)/mining-pool-blocks-table';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/common/sub-title';
import db from '@/db';
import { Locale, NextPageWithLocale } from '@/i18n';
import moneroService from '@/services/monero-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: { poolSlug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale, poolSlug } }: { params: { locale: Locale; poolSlug: string } }) {
  const t = await getTranslations({ locale, namespace: 'MiningPoolDetail' });
  const pool = await db.miningPool.findFirst({ where: { slug: poolSlug }, select: { name: true } });

  return { title: pool ? `${pool.name} — ${t('metaTitle')}` : t('metaTitle') };
}

const BLOCKS_PER_PAGE = 25;

const MiningPoolBlocksPage: NextPageWithLocale<PageProps> = async ({ params: { locale, poolSlug }, searchParams: q }) => {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'MiningPoolDetail' });

  const pool = await db.miningPool.findFirst({
    where: { slug: poolSlug },
    include: { chain: true },
  });

  if (!pool) notFound();
  if (!pool.isVerified) notFound();

  const isMonero = pool.chain.name === 'monero';
  const totalCount = isMonero ? await moneroService.getMoneroPoolBlocksCount(pool.chainId, pool.id) : 0;
  const pageLength = Math.max(1, Math.ceil(totalCount / BLOCKS_PER_PAGE));
  const currentPage = Math.min(Math.max(parseInt((q.p as string) || '1', 10) || 1, 1), pageLength);
  const sortBy: 'height' | 'timestamp' = q.sortBy === 'height' ? 'height' : 'timestamp';
  const order: 'asc' | 'desc' = q.order === 'asc' ? 'asc' : 'desc';

  const blocks = isMonero
    ? await moneroService.getMoneroPoolRecentBlocks(
        pool.chainId,
        pool.id,
        BLOCKS_PER_PAGE,
        (currentPage - 1) * BLOCKS_PER_PAGE,
        sortBy,
        order,
      )
    : [];

  return (
    <div className="mb-24 flex flex-col gap-8">
      <PageTitle prefix={pool.name} text={t('blocksTitle')} />
      <section>
        <SubTitle text={t('recentBlocksTitle')} />
        <p className="mt-2 font-sfpro text-base opacity-80">{t('recentBlocksDescription')}</p>

        {blocks.length === 0 ? (
          <div className="mt-4 bg-table_row p-6 font-sfpro text-base opacity-70">{t('recentBlocksEmpty')}</div>
        ) : (
          <MiningPoolBlocksTable blocks={blocks} chainName={pool.chain.name} pageLength={pageLength} />
        )}
      </section>
    </div>
  );
};

export default MiningPoolBlocksPage;
