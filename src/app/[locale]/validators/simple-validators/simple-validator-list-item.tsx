'use client';

import { Chain } from '@prisma/client';
import { FC } from 'react';

import ValidatorListItemChains from '@/app/main-validators/validator-list/validator-list-item/validator-list-item-chains';
import ValidatorListItemLinks from '@/app/main-validators/validator-list/validator-list-item/validator-list-item-links';
import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';
import TableAvatar from '@/components/common/table/table-avatar';
import { ValidatorWithNodes } from '@/services/validator-service';

interface OwnProps {
  validator: ValidatorWithNodes;
  chains: Chain[];
}

const SimpleValidatorListItem: FC<OwnProps> = ({ validator, chains }) => {
  // @ts-ignore filter removes undefined items
  const validatorChains: (Chain & { valoper: string })[] = validator.nodes
    .map((n) => {
      const el = chains.find((c) => c.id === n.chainId);
      return { ...el, valoper: n.operatorAddress };
    })
    .filter((c) => typeof c !== 'undefined');

  return (
    <BaseTableRow>
      <BaseTableCell className="group/avatar w-1/3 px-2 py-2 font-sfpro hover:text-highlight">
        <TableAvatar icon={validator.url} name={validator.moniker} href={`/validators/${validator.id}/networks`} />
      </BaseTableCell>
      <BaseTableCell className="px-3">
        <ValidatorListItemLinks validator={validator} />
      </BaseTableCell>
      <BaseTableCell className="px-3">
        <ValidatorListItemChains chains={validatorChains} validator={validator} />
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default SimpleValidatorListItem;
