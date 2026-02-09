import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FC } from 'react';

import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';
import Tooltip from '@/components/common/tooltip';

interface OwnProps {
  item: {
    name: string;
    approved: number;
  };
}

const ValidatorMediaItem: FC<OwnProps> = ({ item }) => {
  const t = useTranslations('PublicGoodsMediaPage');
  const iconsSize = 'h-10 w-10';
  return (
    <BaseTableRow>
      <BaseTableCell className="w-1/3 py-4 font-sfpro text-base hover:text-highlight">
        <Link href={''} className="">
          <div className="ml-2.5">{item.name}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/3 py-3 font-sfpro text-base">
        <div className="flex h-full items-stretch justify-center gap-4">
          <Tooltip noWrap tooltip={t('tooltip')} direction={'top'}>
            <div
              className={`${iconsSize} self-end bg-approved bg-contain bg-no-repeat hover:bg-approved_h active:bg-approved_a`}
            />
          </Tooltip>
          <Tooltip noWrap tooltip={t('tooltip')} direction={'top'}>
            <div
              className={`${iconsSize} self-start bg-disapproved bg-contain bg-no-repeat hover:bg-disapproved_h active:bg-disapproved_a`}
            />
          </Tooltip>
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-1/3 px-2 py-2 font-sfpro text-base">
        <div className="flex justify-end">
          <div>
            Approved by: <span className="font-handjet text-lg text-highlight">{item.approved}%</span>
          </div>
        </div>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default ValidatorMediaItem;
