import Link from 'next/link';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import BaseTable from '@/components/common/table/base-table';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import TableHeaderItem from '@/components/common/table/table-header-item';
import TablePagination from '@/components/common/table/table-pagination';
import { MoneroPoolBlock } from '@/services/monero-service';
import cutHash from '@/utils/cut-hash';
import { formatTimestamp } from '@/utils/format-timestamp';

interface OwnProps {
  blocks: MoneroPoolBlock[];
  chainName: string;
  pageLength: number;
}

// Pool's attributed blocks, styled like the validator tx-summary table (sortable headers, underlined
// links, copy buttons) for design parity.
const MiningPoolBlocksTable: FC<OwnProps> = ({ blocks, chainName, pageLength }) => {
  return (
    <BaseTable className="my-4">
      <thead>
        <tr className="bg-table_header">
          <TableHeaderItem page="MiningPoolProfileHeader" name="Height" sortField="height" />
          <TableHeaderItem page="MiningPoolProfileHeader" name="Block Hash" />
          <TableHeaderItem page="MiningPoolProfileHeader" name="Timestamp" sortField="timestamp" defaultSelected />
        </tr>
      </thead>
      <tbody>
        {blocks.map((block) => {
          const timestamp = formatTimestamp(block.blockTimestamp);
          const blockLink = `/networks/${chainName}/blocks/${block.blockHash}`;

          return (
            <BaseTableRow key={block.blockHash}>
              <BaseTableCell className="w-1/3 px-2 py-2 hover:text-highlight">
                <Link href={blockLink} className="flex justify-center">
                  <div className="text-center font-handjet text-lg underline underline-offset-2">
                    {block.height.toLocaleString('en-US')}
                  </div>
                </Link>
              </BaseTableCell>
              <BaseTableCell className="w-1/3 px-2 py-2 hover:text-highlight">
                <div className="flex items-center justify-center gap-1">
                  <Link href={blockLink} className="flex justify-center">
                    <div className="text-center font-handjet text-lg underline underline-offset-3">
                      {cutHash({ value: block.blockHash })}
                    </div>
                  </Link>
                  <CopyButton value={block.blockHash} size="sm" />
                </div>
              </BaseTableCell>
              <BaseTableCell className="w-1/3 px-2 py-2 hover:text-highlight">
                <div className="flex justify-center">
                  <span className="text-center text-base">{timestamp}</span>
                  <CopyButton value={timestamp} size="sm" />
                </div>
              </BaseTableCell>
            </BaseTableRow>
          );
        })}
        <tr>
          <td colSpan={3} className="pt-4">
            <TablePagination pageLength={pageLength} />
          </td>
        </tr>
      </tbody>
    </BaseTable>
  );
};

export default MiningPoolBlocksTable;
