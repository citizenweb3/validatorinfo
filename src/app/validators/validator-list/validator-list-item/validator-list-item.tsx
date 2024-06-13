'use client';

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
    <>
      <tr className="h-3"></tr>
      <tr className="border border-bgSt border-t-transparent">
        <td className="px-2 py-2">
          <ValidatorListItemFavorite isFavorite={validator.isFavorite} />
        </td>
        <td className="px-2 py-2">
          <ValidatorListItemAvatar icon={validator.icon} name={validator.name} />
        </td>
        <td className="px-2 py-2">
          <ValidatorListItemLinks links={validator.links} validatorId={validator.id} />
        </td>
        <td className="px-2 py-2">
          <ValidatorListItemBattery battery={validator.battery} />
        </td>
        <td className="px-2 py-2">
          <div className="flex items-center justify-center text-sm">{validator.scores.technical ?? '-'}</div>
        </td>
        <td className="px-2 py-2">
          <div className="flex items-center justify-center text-sm">{validator.scores.social ?? '-'}</div>
        </td>
        <td className="px-2 py-2">
          <div className="flex items-center justify-center text-sm">{validator.scores.governance ?? '-'}</div>
        </td>
        <td className="px-2 py-2">
          <div className="flex items-center justify-center text-sm">{validator.scores.user ?? '-'}</div>
        </td>
        <td className="px-2 py-2">
          <ValidatorListItemTVS number={validator.tvs.number} />
        </td>
        <td className="px-2 py-2">
          <ValidatorListItemChains chains={validator.chains} />
        </td>
      </tr>
    </>
  );
};

export default ValidatorList;
