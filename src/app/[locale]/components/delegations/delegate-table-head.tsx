import { FC } from 'react';

import TableHeaderItem from '@/components/common/table/table-header-item';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  sortable?: boolean;
}

const DelegateTableHead: FC<OwnProps> = ({ page, sortable = false }) => (
  <thead>
    <tr className="bg-table_header">
      <TableHeaderItem page={page} name="Address" />
      <TableHeaderItem
        page={page}
        name="Amount"
        {...(sortable ? { sortField: 'amount', defaultSelected: true, defaultOrder: 'desc' as const } : {})}
      />
      <TableHeaderItem page={page} name="Happened" {...(sortable ? { sortField: 'happened' } : {})} />
      <TableHeaderItem page={page} name="Tx Hash" />
      <TableHeaderItem page={page} name="Block Height" />
    </tr>
  </thead>
);

export default DelegateTableHead;
