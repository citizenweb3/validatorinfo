'use client';

import Link from 'next/link';
import { FC } from 'react';

import ValidatorListItemAvatar from '@/app/validators/validator-list/validator-list-item/validator-list-item-avatar';
import ValidatorListItemBattery from '@/app/validators/validator-list/validator-list-item/validator-list-item-battery';
import ValidatorListItemChains from '@/app/validators/validator-list/validator-list-item/validator-list-item-chains';
import ValidatorListItemFavorite from '@/app/validators/validator-list/validator-list-item/validator-list-item-favorite';
import ValidatorListItemLinks from '@/app/validators/validator-list/validator-list-item/validator-list-item-links';
import ValidatorListItemTVS from '@/app/validators/validator-list/validator-list-item/validator-list-item-tvs';
import { ValidatorItem } from '@/types';

interface OwnProps {
  validator: ValidatorItem;
}

const ValidatorList: FC<OwnProps> = ({ validator }) => {
  return (
    <tr className="group font-hackernoon hover:bg-bgHover ">
      <td className="border-b border-black py-2 active:border-bgSt">
        <ValidatorListItemFavorite isFavorite={validator.isFavorite} />
      </td>
      <td className="group/avatar border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <ValidatorListItemAvatar icon={validator.icon} name={validator.name} id={validator.id} />
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        <ValidatorListItemLinks links={validator.links} validatorId={validator.id} />
      </td>
      <td className="border-b border-black px-2 py-2">
        <ValidatorListItemBattery battery={validator.battery} id={validator.id} />
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`validators/${validator.id}/metrics`}
          className="flex items-center justify-center font-hackernoon text-sm"
        >
          {validator.scores.technical ?? '-'}
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`validators/${validator.id}/metrics`}
          className="flex items-center justify-center font-hackernoon text-sm"
        >
          {validator.scores.social ?? '-'}
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`validators/${validator.id}/metrics`}
          className="flex items-center justify-center font-hackernoon text-sm"
        >
          {validator.scores.governance ?? '-'}
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`validators/${validator.id}/metrics`}
          className="flex items-center justify-center font-hackernoon text-sm"
        >
          {validator.scores.user ?? '-'}
        </Link>
      </td>
      <td className="group/tvs border-b border-black px-2 py-2 active:border-bgSt">
        <ValidatorListItemTVS id={validator.id} />
      </td>
      <td className="border-b border-black px-2 py-2">
        <ValidatorListItemChains chains={validator.chains} />
      </td>
    </tr>
  );
};

export default ValidatorList;
