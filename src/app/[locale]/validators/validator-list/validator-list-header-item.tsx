'use server';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import ValidatorListSortItems from '@/app/validators/validator-list/validator-list-sort-items';
import Tooltip from '@/components/common/tooltip';

interface OwnProps {
  name: string;
  sortable?: boolean;
}

const ValidatorListHeaderItem: FC<OwnProps> = ({ name, sortable = false }) => {
  const t = useTranslations('HomePage.Table');
  return (
    <th>
      <div className="flex flex-row items-center justify-center py-3">
        {sortable && <ValidatorListSortItems />}
        <Tooltip tooltip={`${t(`${name}.hint` as 'Validator.hint')}`} direction="top">
          <div className="w-fit text-wrap text-sm">
            <div className="text-nowrap font-bold">{t(`${name}.name` as 'Validator.name')}</div>
          </div>
        </Tooltip>
      </div>
    </th>
  );
};

export default ValidatorListHeaderItem;
