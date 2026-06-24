import { Prisma } from '@prisma/client';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import CollapsiblePageHeader from '@/app/validators/collapsible-page-header';
import MiningPoolListItem from '@/app/mining-pools/mining-pool-list-item';
import PageHeaderVisibilityWrapper from '@/components/common/page-header-visibility-wrapper';
import PageTitle from '@/components/common/page-title';
import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import TablePagination from '@/components/common/table/table-pagination';
import TabList from '@/components/common/tabs/tab-list';
import { validatorsTabs } from '@/components/common/tabs/tabs-data';
import db from '@/db';
import { NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';

import MiningPoolsFilters from './mining-pools-filters';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const VALID_PER_PAGE = [25, 50, 100];
const DEFAULT_PER_PAGE = 25;

const parseOrder = (raw: string | string[] | undefined): SortDirection => {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === 'desc' ? 'desc' : 'asc';
};

const parsePerPage = (raw: string | string[] | undefined): number => {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = value ? parseInt(value, 10) : NaN;
  if (Number.isFinite(parsed) && VALID_PER_PAGE.includes(parsed)) return parsed;
  return DEFAULT_PER_PAGE;
};

// Global mining-pool directory — pool IDENTITY only (Pool | Links | Networks), mirroring the
// /validators simple list. Only real (verified) pools; the synthetic "unknown/solo" bucket is a
// stats-only aggregate, not a listable pool. Per-window technical stats are network-scoped.
const MiningPoolsPage: NextPageWithLocale<PageProps> = async ({ params: { locale }, searchParams: q }) => {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'MiningPoolsList' });

  const order = parseOrder(q.order);
  const perPage = parsePerPage(q.pp);
  const requestedPage = parseInt((q.p as string) || '1', 10) || 1;

  // Identity directory: only real (verified) pools. No network filter — pools currently live on a
  // single chain (Monero), so a chain dropdown would be a useless one-option control.
  const where: Prisma.MiningPoolWhereInput = { isVerified: true };

  const totalCount = await db.miningPool.count({ where });
  const pageLength = Math.max(1, Math.ceil(totalCount / perPage));
  const currentPage = Math.min(Math.max(requestedPage, 1), pageLength);

  const pools = await db.miningPool.findMany({
    where,
    include: { chain: true },
    orderBy: { name: order },
    skip: (currentPage - 1) * perPage,
    take: perPage,
  });

  return (
    <div className="mb-24">
      <PageHeaderVisibilityWrapper>
        <TabList page="ValidatorsPage" tabs={validatorsTabs} />
      </PageHeaderVisibilityWrapper>
      <CollapsiblePageHeader description={t('description')}>
        <PageTitle text={t('title')} />
      </CollapsiblePageHeader>

      <MiningPoolsFilters perPage={perPage} />

      <div className="mt-6">
        <BaseTable className="mb-4">
          <thead>
            <tr className="bg-table_header">
              <TableHeaderItem page="MiningPoolsList" name="Pool" sortField="name" defaultSelected />
              <TableHeaderItem page="MiningPoolsList" name="Links" />
              <TableHeaderItem page="MiningPoolsList" name="Networks" />
            </tr>
          </thead>
          <tbody>
            {pools.map((pool) => (
              <MiningPoolListItem key={pool.id} pool={pool} />
            ))}
            <tr>
              <td colSpan={3} className="pt-4">
                <TablePagination pageLength={pageLength} />
              </td>
            </tr>
          </tbody>
        </BaseTable>
      </div>
    </div>
  );
};

export default MiningPoolsPage;
