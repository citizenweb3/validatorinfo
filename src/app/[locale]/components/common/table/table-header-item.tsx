'use server';

import { FC } from 'react';

import TableSortItems from '@/components/common/table/table-sort-items';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  name: string;
  sortField?: string;
  colspan?: number;
  defaultSelected?: boolean;
  className?: string;
}

const TableHeaderItem: FC<OwnProps> = ({ page, sortField, name, className, colspan = 1, defaultSelected = false }) => {
  return (
    <th className={className} colSpan={colspan}>
      <TableSortItems page={page} name={name} field={sortField} defaultSelected={defaultSelected} />
    </th>
  );
};

export default TableHeaderItem;
