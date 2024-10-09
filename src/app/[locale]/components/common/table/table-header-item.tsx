'use server';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import TableSortItems from '@/components/common/table/table-sort-items';
import Tooltip from '@/components/common/tooltip';

interface OwnProps {
  name: string;
  sortable?: boolean;
  colspan?: number;
}

const TableHeaderItem: FC<OwnProps> = ({ name, sortable = false, colspan = 1 }) => {
  const t = useTranslations('HomePage.Table');
  return (
    <th colSpan={colspan}>
      <div className="flex flex-row items-center justify-center py-3">
        {sortable && <TableSortItems />}
        <Tooltip tooltip={`${t(`${name}.hint` as 'Validator.hint')}`} direction="top">
          <div className="w-fit text-wrap text-sm">
            <div className="text-nowrap font-bold">&nbsp;{t(`${name}.name` as 'Validator.name')}</div>
          </div>
        </Tooltip>
      </div>
    </th>
  );
};

export default TableHeaderItem;
