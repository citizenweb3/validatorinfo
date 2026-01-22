import { FC } from 'react';

import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import TableAvatar from '@/components/common/table/table-avatar';
import icons from '@/components/icons';
import { SignalDisplay } from '@/services/aztec-signal-service';

interface OwnProps {
  signal: SignalDisplay;
}

const SignalsTableItem: FC<OwnProps> = ({ signal }) => {
  const { signaler, round, timestamp } = signal;
  const validatorLink = signaler.validatorId ? `/validators/${signaler.validatorId}/${signaler.address}/validator_passport/authz/withdraw_rewards` : null;

  return (
    <BaseTableRow>
      <BaseTableCell className="w-2/5 py-2 pl-2 font-sfpro text-base hover:text-highlight">
        <TableAvatar
          icon={signaler.validatorUrl ?? icons.AvatarIcon}
          name={signaler.moniker ?? signaler.address}
          href={validatorLink ?? ''}
        />
      </BaseTableCell>
      <BaseTableCell className="w-1/5 py-2 text-center font-handjet text-lg hover:text-highlight">
        {round}
      </BaseTableCell>
      <BaseTableCell className="w-2/5 py-2 text-center font-handjet text-lg hover:text-highlight">
        {new Date(timestamp).toLocaleString()}
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default SignalsTableItem;
