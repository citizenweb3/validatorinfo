'use server';

import { FC } from 'react';

import TableSortItems from '@/components/common/table/table-sort-items';

interface OwnProps {
  name: string;
  sortField?: string;
  colspan?: number;
  defaultSelected?: boolean;
}

const TableHeaderItem: FC<OwnProps> = ({ sortField, name, colspan = 1, defaultSelected = false }) => {
  return (
    <th colSpan={colspan}>
      <TableSortItems name={name} field={sortField} defaultSelected={defaultSelected} />
    </th>
  );
};

export default TableHeaderItem;
