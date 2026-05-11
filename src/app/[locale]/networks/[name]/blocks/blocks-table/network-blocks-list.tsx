import { getTranslations } from 'next-intl/server';
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
  const t = await getTranslations('NetworkStatistics');
  const { blocks, totalPages } = await BlocksService.getBlocksByChainName(name, currentPage, perPage);

  const supportsBlocks = ['aztec', 'logos-testnet', 'cosmoshub'].includes(name.toLowerCase());
  if (blocks.length === 0 && !supportsBlocks) {
    return (
      <tbody>
        <tr>
          <td colSpan={4} className="py-8 text-center">
            <div className="font-sfpro text-lg">{t('under development')}</div>
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
            <div className="font-sfpro text-lg">{t('no blocks found')}</div>
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
          <TablePagination pageLength={totalPages} hideLastPage />
        </td>
      </tr>
    </tbody>
  );
};

export default NetworkBlocksList;
