'use client';

import { Validator } from '@prisma/client';
import Link from 'next/link';
import { FC } from 'react';

import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';
import TableAvatar from '@/components/common/table/table-avatar';

interface OwnProps {
  validator: Validator;
}

const SimpleValidatorListItem: FC<OwnProps> = ({ validator }) => {
  const size = 'h-12 w-12 min-w-12 min-h-12 mx-auto';

  return (
    <BaseTableRow>
      <BaseTableCell className="group/avatar w-1/3 px-2 py-2 font-sfpro hover:text-highlight">
        <TableAvatar icon={validator.url} name={validator.moniker} href={`/validators/${validator.id}/networks`} />
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2">
        {validator.website ? (
          <Link href={validator.website} className={`${size}`} target="_blank">
            <div className={`${size} bg-web bg-contain bg-no-repeat hover:bg-web_h`} />
          </Link>
        ) : (
          <div className={`${size}`}>
            <div className={`${size} bg-web bg-contain bg-no-repeat opacity-20`} />
          </div>
        )}
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2">
        {validator.github ? (
          <Link href={validator.github} className={size} target="_blank">
            <div className={`${size} bg-github bg-contain bg-no-repeat hover:bg-github_h`} />
          </Link>
        ) : (
          <div className={`${size}`}>
            <div className={`${size} bg-github bg-contain bg-no-repeat opacity-20`} />
          </div>
        )}
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2">
        {validator.twitter ? (
          <Link href={validator.twitter} className={size} target="_blank">
            <div className={`${size} bg-x bg-contain bg-no-repeat hover:bg-x_h`} />
          </Link>
        ) : (
          <div className={`${size}`}>
            <div className={`${size} bg-x bg-contain bg-no-repeat opacity-20`} />
          </div>
        )}
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default SimpleValidatorListItem;
