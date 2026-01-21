import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';
import NetworkTxsList from '@/app/networks/[name]/tx/txs-table/network-txs-list';
import { isAztecChainName } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
  name: string;
  chainName: string;
}

const NetworkTxs: FC<OwnProps> = async ({ name, chainName, page, perPage, sort, currentPage }) => {
  const t = await getTranslations('TotalTxsPage');

  if (isAztecChainName(chainName)) {
    return (
      <div className="mt-12">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-table_header">
              <TableHeaderItem page={page} name="Tx Hash" sortField="tx" />
              <TableHeaderItem page={page} name="Type of Tx" sortField="type" />
              <TableHeaderItem page={page} name="Block Height" sortField="block height" />
              <TableHeaderItem page={page} name="Timestamp" sortField="timestamp" defaultSelected />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="font-sfpro text-base text-white/70">
                    {t('transactionsWillAppear')}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Tx Hash" sortField="tx" />
            <TableHeaderItem page={page} name="Type of Tx" sortField="type" />
            <TableHeaderItem page={page} name="Block Height" sortField="block height" />
            <TableHeaderItem page={page} name="Timestamp" sortField="timestamp" defaultSelected />
          </tr>
        </thead>
        <NetworkTxsList name={name} perPage={perPage} sort={sort} currentPage={currentPage} />
      </table>
    </div>
  );
};

export default NetworkTxs;
