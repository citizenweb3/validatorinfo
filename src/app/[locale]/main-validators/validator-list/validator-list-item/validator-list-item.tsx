'use client';

import { Chain } from '@prisma/client';
import Link from 'next/link';
import { FC, useState } from 'react';

import ValidatorListItemBattery from '@/app/main-validators/validator-list/validator-list-item/validator-list-item-battery';
import ValidatorListItemChains from '@/app/main-validators/validator-list/validator-list-item/validator-list-item-chains';
import ValidatorListItemFavorite from '@/app/main-validators/validator-list/validator-list-item/validator-list-item-favorite';
import ValidatorListItemLinks from '@/app/main-validators/validator-list/validator-list-item/validator-list-item-links';
import ValidatorListItemTVS from '@/app/main-validators/validator-list/validator-list-item/validator-list-item-tvs';
import TableAvatar from '@/components/common/table/table-avatar';
import { ValidatorWithNodes } from '@/services/validator-service';

interface OwnProps {
  validator: ValidatorWithNodes;
  chains: Chain[];
}

const ValidatorListItem: FC<OwnProps> = ({ chains, validator }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  // @ts-ignore I don't know why, but it doesn't understand that filter removes undefined items
  const validatorChains: (Chain & { valoper: string })[] = validator.nodes
    .map((n) => {
      const el = chains.find((c) => c.chainId === n.chainId);
      return { ...el, valoper: n.operator_address };
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
          href={`/validators/${validator.identity}`}
        />
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        <ValidatorListItemLinks links={undefined} id={validator.identity} />
      </td>
      <td className="border-b border-black px-2 py-2">
        <ValidatorListItemBattery battery={99} id={validator.identity} />
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`validators/${validator.identity}/metrics`}
          className="flex items-center justify-center font-handjet text-lg"
        >
          -
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`validators/${validator.identity}/metrics`}
          className="flex items-center justify-center font-handjet text-lg"
        >
          -
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`validators/${validator.identity}/metrics`}
          className="flex items-center justify-center font-handjet text-lg"
        >
          -
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`validators/${validator.identity}/metrics`}
          className="flex items-center justify-center font-handjet text-lg"
        >
          -
        </Link>
      </td>
      <td className="group/tvs border-b border-black px-2 py-2 active:border-bgSt">
        <ValidatorListItemTVS id={validator.identity} activeId={activeId} setActiveId={setActiveId} />
      </td>
      <td className="border-b border-black px-2 py-2">
        <ValidatorListItemChains chains={validatorChains} />
      </td>
    </tr>
  );
};

export default ValidatorListItem;
