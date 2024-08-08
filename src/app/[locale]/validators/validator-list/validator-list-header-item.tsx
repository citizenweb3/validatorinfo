import { useTranslations } from 'next-intl';
import { FC } from 'react';

import ValidatorListSortItems from '@/app/validators/validator-list/validator-list-sort-items';

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
        <div className="w-fit text-wrap text-sm">
          <div className="text-nowrap font-bold">{t(name as 'Validator')}</div>
        </div>
      </div>
    </th>
  );
};

export default ValidatorListHeaderItem;
