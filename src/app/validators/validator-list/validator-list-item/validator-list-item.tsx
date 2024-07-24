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
    <tr className="group border-b border-black font-retro hover:border-bgSt hover:text-highlight">
      <td className="py-2">
        <ValidatorListItemFavorite isFavorite={validator.isFavorite} />
      </td>
      <td className="px-2 py-2 font-source">
        <ValidatorListItemAvatar icon={validator.icon} name={validator.name} id={validator.id} />
      </td>
      <td className="px-2 py-2">
        <ValidatorListItemLinks links={validator.links} validatorId={validator.id} />
      </td>
      <td className="px-2 py-2">
        <ValidatorListItemBattery battery={validator.battery} id={validator.id} />
      </td>
      <td className="px-2 py-2">
        <Link href={`validators/${validator.id}/metrics`} className="flex items-center justify-center text-sm">
          {validator.scores.technical ?? '-'}
        </Link>
      </td>
      <td className="px-2 py-2">
        <Link href={`validators/${validator.id}/metrics`} className="flex items-center justify-center text-sm">
          {validator.scores.social ?? '-'}
        </Link>
      </td>
      <td className="px-2 py-2">
        <Link href={`validators/${validator.id}/metrics`} className="flex items-center justify-center text-sm">
          {validator.scores.governance ?? '-'}
        </Link>
      </td>
      <td className="px-2 py-2">
        <Link href={`validators/${validator.id}/metrics`} className="flex items-center justify-center text-sm">
          {validator.scores.user ?? '-'}
        </Link>
      </td>
      <td className="px-2 py-2">
        <ValidatorListItemTVS id={validator.id} />
      </td>
      <td className="px-2 py-2">
        <ValidatorListItemChains chains={validator.chains} />
      </td>
    </tr>
  );
};

export default ValidatorList;
