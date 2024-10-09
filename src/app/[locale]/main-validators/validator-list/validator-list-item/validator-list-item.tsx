'use client';

import Link from 'next/link';
import { FC, useMemo, useState } from 'react';

import ValidatorListItemBattery from '@/app/main-validators/validator-list/validator-list-item/validator-list-item-battery';
import ValidatorListItemChains from '@/app/main-validators/validator-list/validator-list-item/validator-list-item-chains';
import ValidatorListItemFavorite from '@/app/main-validators/validator-list/validator-list-item/validator-list-item-favorite';
import ValidatorListItemLinks from '@/app/main-validators/validator-list/validator-list-item/validator-list-item-links';
import ValidatorListItemTVS from '@/app/main-validators/validator-list/validator-list-item/validator-list-item-tvs';
import TableAvatar from '@/components/common/table/table-avatar';
import { Chain, ValidatorItem } from '@/types';

interface OwnProps {
  validator: ValidatorItem;
  chains: Chain[];
}

const ValidatorListItem: FC<OwnProps> = ({ chains, validator }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const validatorChains = useMemo(
    () => validator.chainNames.map((cn) => chains.find((c) => c.name === cn) || cn),
    [chains, validator],
  );

  return (
    <tr className="group font-handjet hover:bg-bgHover ">
      <td className="border-b border-black py-2 active:border-bgSt">
        <ValidatorListItemFavorite isFavorite={false} />
      </td>
      <td className="group/avatar border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <TableAvatar
          textClassName="max-w-36"
          icon={validator.logoUrl}
          name={validator.moniker}
          href={`/validators/${validator.operatorAddress}`}
        />
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        <ValidatorListItemLinks links={validator?.links} id={validator.operatorAddress} />
      </td>
      <td className="border-b border-black px-2 py-2">
        <ValidatorListItemBattery battery={99} id={validator.operatorAddress} />
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`validators/${validator.operatorAddress}/metrics`}
          className="flex items-center justify-center font-handjet text-lg"
        >
          -
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`validators/${validator.operatorAddress}/metrics`}
          className="flex items-center justify-center font-handjet text-lg"
        >
          -
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`validators/${validator.operatorAddress}/metrics`}
          className="flex items-center justify-center font-handjet text-lg"
        >
          -
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`validators/${validator.operatorAddress}/metrics`}
          className="flex items-center justify-center font-handjet text-lg"
        >
          -
        </Link>
      </td>
      <td className="group/tvs border-b border-black px-2 py-2 active:border-bgSt">
        <ValidatorListItemTVS id={validator.operatorAddress} activeId={activeId} setActiveId={setActiveId} />
      </td>
      <td className="border-b border-black px-2 py-2">
        <ValidatorListItemChains chains={validatorChains} />
      </td>
    </tr>
  );
};

export default ValidatorListItem;
