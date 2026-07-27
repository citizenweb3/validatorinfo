'use server';

import { FC } from 'react';
import Tooltip from '@/components/common/tooltip';
import TableSortItems from '@/components/common/table/table-sort-items';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  name?: string;
  sortField?: string;
  colspan?: number;
  defaultSelected?: boolean;
  defaultOrder?: SortDirection;
  className?: string;
  tooltip?: string;
  children?: React.ReactNode;
}

const TableHeaderItem: FC<OwnProps> = ({
    page,
    sortField,
    name,
    className,
    colspan = 1,
    defaultSelected = false,
    defaultOrder,
    tooltip,
    children,
  }) => {
  return (
    <th
      className={`text-center bg-table_row bg-clip-padding shadow-[0_4px_4px_rgba(0,0,0,0.8)] border-x-2 border-transparent ${className || ''}`}
      colSpan={colspan}>
      {children ? (
        children
      ) : tooltip ? (
        <Tooltip tooltip={tooltip}>
          <span className="cursor-help">
            <TableSortItems
              page={page}
              name={name!}
              field={sortField}
              defaultSelected={defaultSelected}
              defaultOrder={defaultOrder}
            />
          </span>
        </Tooltip>
      ) : (
        <TableSortItems
          page={page}
          name={name!}
          field={sortField}
          defaultSelected={defaultSelected}
          defaultOrder={defaultOrder}
        />
      )}
    </th>
  );
};

export default TableHeaderItem;
