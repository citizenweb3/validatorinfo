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

const ValidatorListItemGame: FC<OwnProps> = ({ chains, validator }) => {
  // @ts-ignore I don't know why, but it doesn't understand that filter removes undefined items
  const validatorChains: (Chain & { valoper: string })[] = validator.nodes
    .map((n) => {
      const el = chains.find((c) => c.id === n.chainId);
      return { ...el, valoper: n.operatorAddress };
    })
    .filter((c) => typeof c !== 'undefined');

  const rowStyle = 'px-3';
  const cellHoverStyle = 'relative hover:bg-[#272727] hover:shadow-[0_4px_12px_rgba(0,0,0,0.6),0_8px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] hover:rounded-sm hover:z-10 hover:scale-y-[1.05]';

  return (
    <tr className="group bg-table_row font-handjet shadow-md hover:bg-table_header">
      <td className={`group/avatar w-[20%] font-sfpro hover:text-highlight ${cellHoverStyle}`}>
        <div className="flex items-center">
          <div className="w-9 mr-2 -py flex items-center justify-center">
            <ValidatorListItemFavorite isFavorite={false} />
          </div>
          <TableAvatar
            textClassName="max-w-36"
            icon={validator.url}
            name={validator.moniker}
            href={`/validators/${validator.id}/networks`}
          />
        </div>
      </td>
      <td className={`${rowStyle} ${cellHoverStyle}`}>
        <ValidatorListItemLinks validator={validator} />
      </td>
      <td className={`${rowStyle} ${cellHoverStyle}`}>
        <ValidatorListItemChains chains={validatorChains} validator={validator} />
      </td>
    </tr>
  );
};

export default ValidatorListItemGame;
