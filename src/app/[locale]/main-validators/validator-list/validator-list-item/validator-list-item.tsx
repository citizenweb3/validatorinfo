'use client';

import { Chain } from '@prisma/client';
import { FC } from 'react';

import ValidatorListItemChains from '@/app/main-validators/validator-list/validator-list-item/validator-list-item-chains';
import ValidatorListItemFavorite from '@/app/main-validators/validator-list/validator-list-item/validator-list-item-favorite';
import ValidatorListItemLinks from '@/app/main-validators/validator-list/validator-list-item/validator-list-item-links';
import TableAvatar from '@/components/common/table/table-avatar';
import { ValidatorWithNodes } from '@/services/validator-service';


interface OwnProps {
  validator: ValidatorWithNodes;
  chains: Chain[];
}

const ValidatorListItem: FC<OwnProps> = ({ chains, validator }) => {
  // @ts-ignore I don't know why, but it doesn't understand that filter removes undefined items
  const validatorChains: (Chain & { valoper: string })[] = validator.nodes
    .map((n) => {
      const el = chains.find((c) => c.id === n.chainId);
      return { ...el, valoper: n.operatorAddress };
    })
    .filter((c) => typeof c !== 'undefined');

  return (
    <tr className="group font-handjet hover:bg-bgHover ">
      <td className="w-9 border-b border-black py-2 active:border-bgSt">
        <ValidatorListItemFavorite isFavorite={false} />
      </td>
      <td className="group/avatar w-[20%] border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <TableAvatar
          textClassName="max-w-36"
          icon={validator.url}
          name={validator.moniker}
          href={`/validators/${validator.id}/networks`}
        />
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        <ValidatorListItemLinks validator={validator} />
      </td>
      <td className="border-b border-black px-2 py-2">
        <ValidatorListItemChains chains={validatorChains} validator={validator} />
      </td>
    </tr>
  );
};

export default ValidatorListItem;
