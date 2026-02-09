import { FC } from 'react';

import NetworkBlocksItem from '@/app/networks/[name]/blocks/blocks-table/network-blocks-items';
import TablePagination from '@/components/common/table/table-pagination';
import BlocksService from '@/services/blocks-service';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  name: string;
}

const NetworkBlocksList: FC<OwnProps> = async ({ name, perPage, currentPage = 1 }) => {
  const { blocks, totalPages } = await BlocksService.getBlocksByChainName(name, currentPage, perPage);

  if (blocks.length === 0 && name.toLowerCase() !== 'aztec') {
    return (
      <tbody>
        <tr>
          <td colSpan={4} className="py-8 text-center">
            <div className="text-gray-500 font-sfpro text-lg">Under Development</div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (blocks.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={4} className="py-8 text-center">
            <div className="text-gray-500 font-sfpro text-lg">No blocks found</div>
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {blocks.map((item) => (
        <NetworkBlocksItem key={item.hash} name={name} item={item} />
      ))}
      <tr>
        <td colSpan={4} className="pt-4">
          <TablePagination pageLength={totalPages} />
        </td>
      </tr>
    </tbody>
  );
};

export default NetworkBlocksList;
