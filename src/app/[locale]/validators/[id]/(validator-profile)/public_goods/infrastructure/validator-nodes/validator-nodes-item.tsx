import Image from 'next/image';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import TableAvatar from '@/components/common/table/table-avatar';
import icons from '@/components/icons';
import { InfrastructureNode } from '@/services/infrastructure-service';

interface OwnProps {
  node: InfrastructureNode;
}

const ValidatorNodesItem: FC<OwnProps> = ({ node }) => {
  const getHealthStatus = () => {
    if (!node.status) {
      return { color: 'yellow', label: '-', icon: icons.YellowSquareIcon };
    }
    if (node.status === 'inactive') {
      return { color: 'red', label: 'Inactive', icon: icons.RedSquareIcon };
    }
    return { color: 'green', label: 'Active', icon: icons.GreenSquareIcon };
  };

  const healthStatus = getHealthStatus();

  const formatResponseTime = (ms: number | null) => {
    if (ms === null || ms === undefined) return '—';
    return `${ms}ms`;
  };

  const formatLastChecked = (date: Date | null) => {
    if (!date) return '—';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const nodeLink = `/validators/${node.node.validatorId}/${node.node.operatorAddress}/validator_passport/authz/withdraw_rewards`;

  return (
    <tr className="group hover:bg-bgHover">
      <td className="border-b border-black px-2 py-3">
        <div className="flex items-center">
          <Image src={healthStatus.icon} alt={healthStatus.label} width={20} height={20} className="min-w-7" />
        </div>
      </td>

      <td className="border-b border-black px-2 py-3 text-left font-sfpro text-base">
        <TableAvatar icon={node.chain.logoUrl} name={node.chain.prettyName} href={nodeLink} />
      </td>

      <td className="border-b border-black px-2 py-3 text-center font-sfpro text-base">
        <div className="flex justify-center gap-x-4">
          {node.url}
          <CopyButton value={node.url} />
        </div>
      </td>

      <td className="border-b border-black px-2 py-3 text-center font-sfpro text-base">
        {formatResponseTime(node.responseTime)}
      </td>

      <td className="border-b border-black px-2 py-3 text-center font-sfpro text-base">
        {formatLastChecked(node.lastCheckedAt)}
      </td>
    </tr>
  );
};

export default ValidatorNodesItem;
