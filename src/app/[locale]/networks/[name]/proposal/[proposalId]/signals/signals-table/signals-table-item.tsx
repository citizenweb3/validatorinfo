import { FC } from 'react';

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
    <tr className="group hover:bg-bgHover">
      <td
        className="w-2/5 border-b border-black py-2 pl-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <TableAvatar
          icon={signaler.validatorUrl ?? icons.AvatarIcon}
          name={signaler.moniker ?? signaler.address}
          href={validatorLink ?? ''}
        />
      </td>
      <td className="w-1/5 border-b border-black py-2 text-center font-handjet text-lg hover:text-highlight">
        {round}
      </td>
      <td className="w-2/5 border-b border-black py-2 text-center font-handjet text-lg hover:text-highlight">
        {new Date(timestamp).toLocaleString()}
      </td>
    </tr>
  );
};

export default SignalsTableItem;
