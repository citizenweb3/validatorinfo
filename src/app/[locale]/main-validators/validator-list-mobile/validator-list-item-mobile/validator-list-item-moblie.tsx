'use client';

import { Chain } from '@prisma/client';
import { FC } from 'react';

import ValidatorListItemLinksMobile from '@/app/main-validators/validator-list-mobile/validator-list-item-mobile/validator-list-item-links-mobile';
import TableAvatar from '@/components/common/table/table-avatar';
import { ValidatorWithNodes } from '@/services/validator-service';

interface OwnProps {
  validator: ValidatorWithNodes;
  chains: Chain[];
}

const ValidatorListItemMobile: FC<OwnProps> = ({ chains, validator }) => {
  return (
    <tr className="group font-handjet hover:bg-bgHover ">
      <td className="group/avatar w-[25%] border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt sm:w-[30%]">
        <TableAvatar
          textClassName="md:max-w-36 sm:max-w-30"
          icon={validator.url}
          name={validator.moniker}
          href={`/validators/${validator.id}/networks`}
        />
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        <ValidatorListItemLinksMobile validator={validator} />
      </td>
    </tr>
  );
};

export default ValidatorListItemMobile;
