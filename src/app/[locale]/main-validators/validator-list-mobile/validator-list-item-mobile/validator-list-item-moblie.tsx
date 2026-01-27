'use client';

import { Chain } from '@prisma/client';
import { FC } from 'react';

import ValidatorListItemLinksMobile from '@/app/main-validators/validator-list-mobile/validator-list-item-mobile/validator-list-item-links-mobile';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import TableAvatar from '@/components/common/table/table-avatar';
import { ValidatorWithNodes } from '@/services/validator-service';

interface OwnProps {
  validator: ValidatorWithNodes;
  chains: Chain[];
}

const ValidatorListItemMobile: FC<OwnProps> = ({ chains, validator }) => {
  return (
    <BaseTableRow>
      <BaseTableCell className="w-[25%] px-2 py-2 font-sfpro hover:text-highlight sm:w-[30%]">
        <TableAvatar
          textClassName="md:max-w-36 sm:max-w-30"
          icon={validator.url}
          name={validator.moniker}
          href={`/validators/${validator.id}/networks`}
        />
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2">
        <ValidatorListItemLinksMobile validator={validator} />
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default ValidatorListItemMobile;
