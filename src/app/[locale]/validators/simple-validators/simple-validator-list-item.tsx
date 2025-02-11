'use client';

import { Validator } from '@prisma/client';
import Link from 'next/link';
import { FC } from 'react';

import TableAvatar from '@/components/common/table/table-avatar';

interface OwnProps {
  validator: Validator;
}

const SimpleValidatorListItem: FC<OwnProps> = ({ validator }) => {
  const size = 'h-12 w-12 min-w-12 min-h-12 mx-auto';

  return (
    <tr className="group font-handjet hover:bg-bgHover ">
      <td className="group/avatar w-1/3 border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <TableAvatar icon={validator.url} name={validator.moniker} href={`/validators/${validator.id}/networks`} />
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        {validator.website ? (
          <Link href={validator.website} className={`${size}`} target="_blank">
            <div className={`${size} bg-web bg-contain bg-no-repeat hover:bg-web_h`} />
          </Link>
        ) : (
          <div className={`${size}`}>
            <div className={`${size} bg-web bg-contain bg-no-repeat opacity-20`} />
          </div>
        )}
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        {validator.github ? (
          <Link href={validator.github} className={size} target="_blank">
            <div className={`${size} bg-github bg-contain bg-no-repeat hover:bg-github_h`} />
          </Link>
        ) : (
          <div className={`${size}`}>
            <div className={`${size} bg-github bg-contain bg-no-repeat opacity-20`} />
          </div>
        )}
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        {validator.twitter ? (
          <Link href={validator.twitter} className={size} target="_blank">
            <div className={`${size} bg-x bg-contain bg-no-repeat hover:bg-x_h`} />
          </Link>
        ) : (
          <div className={`${size}`}>
            <div className={`${size} bg-x bg-contain bg-no-repeat opacity-20`} />
          </div>
        )}
      </td>
    </tr>
  );
};

export default SimpleValidatorListItem;
