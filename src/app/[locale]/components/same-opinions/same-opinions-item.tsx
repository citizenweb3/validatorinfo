import { FC } from 'react';

import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import TableAvatar from '@/components/common/table/table-avatar';
import icons from '@/components/icons';
import { SameOpinionValidator } from '@/services/vote-service';

interface OwnProps {
  item: SameOpinionValidator;
}

const SameOpinionsItem: FC<OwnProps> = ({ item }) => {
  const nodeLink = item.validatorId ? `/validators/${item.validatorId}/${item.operatorAddress}/voting_summary` : '';

  return (
    <BaseTableRow>
      <BaseTableCell className="group/avatar flex items-center px-2 py-2 font-sfpro hover:text-highlight">
        <TableAvatar icon={item.icon ?? icons.AvatarIcon} name={item.moniker} href={nodeLink} />
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-handjet text-lg hover:text-highlight">
        <div className="text-center">{item.matchedPercent.toFixed(2)}%</div>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-handjet text-lg">
        <div className="text-center">{item.commonProposals}</div>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-handjet text-lg hover:text-highlight">
        <div className="text-center">{item.wilsonScore.toFixed(2)}</div>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default SameOpinionsItem;
