'use client';

import { Chain } from '@prisma/client';
import Link from 'next/link';
import { FC } from 'react';
import TableAvatar from '@/components/common/table/table-avatar';
import { ValidatorWithNodes } from '@/services/validator-service';
import ValidatorListItemLinksMobile
  from '@/app/main-validators/validator-list-mobile/validator-list-item-mobile/validator-list-item-links-mobile';

interface OwnProps {
  validator: ValidatorWithNodes;
  chains: Chain[];
}

const ValidatorListItemMobile: FC<OwnProps> = ({ chains, validator }) => {
  return (
    <tr className="group font-handjet hover:bg-bgHover ">
      <td
        className="group/avatar w-[25%] sm:w-[20%] border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <TableAvatar
          textClassName="md:max-w-36 sm:max-w-30"
          icon={validator.url}
          name={validator.moniker}
          href={`/validators/${validator.id}/networks`}
        />
      </td>
      <td className="md:hidden border-b border-black px-2 py-2 text-7xl sm:text-5xl font-handjet text-center">
        90%
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`/validators/${validator.id}/metrics`}
          className="flex items-center justify-center font-handjet text-7xl sm:text-5xl"
        >
          -
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`/validators/${validator.id}/metrics`}
          className="flex items-center justify-center font-handjet text-7xl sm:text-5xl"
        >
          -
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`/validators/${validator.id}/metrics`}
          className="flex items-center justify-center font-handjet text-7xl sm:text-5xl"
        >
          -
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`/validators/${validator.id}/metrics`}
          className="flex items-center justify-center font-handjet text-7xl sm:text-5xl"
        >
          -
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        <ValidatorListItemLinksMobile validator={validator} />
      </td>
    </tr>
  );
};

export default ValidatorListItemMobile;
