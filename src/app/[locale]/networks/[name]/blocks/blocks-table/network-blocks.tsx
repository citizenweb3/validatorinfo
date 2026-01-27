import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import NetworkBlocksList from '@/app/networks/[name]/blocks/blocks-table/network-blocks-list';
import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  name: string;
}

const NetworkBlocks: FC<OwnProps> = async ({ name, page, perPage, currentPage }) => {
  const t = await getTranslations('TotalBlocksPage.Table');

  return (
    <div className="mt-12">
      <BaseTable>
        <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name={t('Block Hash.name')} />
            <TableHeaderItem page={page} name={t('Block Height.name')} />
            <TableHeaderItem page={page} name={t('Timestamp.name')} />
            <TableHeaderItem page={page} name={t('Status.name')} />
          </tr>
        </thead>
        <NetworkBlocksList name={name} perPage={perPage} currentPage={currentPage} />
      </BaseTable>
    </div>
  );
};

export default NetworkBlocks;
