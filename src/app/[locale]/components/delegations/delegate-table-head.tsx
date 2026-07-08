import { FC } from 'react';

import TableHeaderItem from '@/components/common/table/table-header-item';
import { PagesProps } from '@/types';

const DelegateTableHead: FC<PagesProps> = ({ page }) => (
  <thead>
    <tr className="bg-table_header">
      <TableHeaderItem page={page} name="Address" />
      <TableHeaderItem page={page} name="Amount" />
      <TableHeaderItem page={page} name="Happened" />
      <TableHeaderItem page={page} name="Tx Hash" />
      <TableHeaderItem page={page} name="Block Height" />
    </tr>
  </thead>
);

export default DelegateTableHead;
