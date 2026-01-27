import Link from 'next/link';
import { FC } from 'react';

import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import ToolTip from '@/components/common/tooltip';
import { GithubRepositoryWithCommitCount } from '@/services/github-service';

interface OwnProps {
  item: GithubRepositoryWithCommitCount;
}

const DeveloperActivityTableItem: FC<OwnProps> = ({ item }) => {
  return (
    <BaseTableRow>
      <BaseTableCell className="w-1/3 py-4 hover:text-highlight">
        <div className="flex items-center justify-center font-sfpro text-base">
          <ToolTip tooltip={item.description ?? ''} direction={'top'}>
            <Link
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-colors hover:text-highlight"
            >
              {item.name}
            </Link>
          </ToolTip>
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-1/3 px-2 py-2 hover:text-highlight">
        <div className="flex items-center justify-center font-handjet text-lg">{item.language}</div>
      </BaseTableCell>
      <BaseTableCell className="w-1/3 px-2 py-2 hover:text-highlight">
        <div className="flex items-center justify-center font-handjet text-lg">
          {item.totalCommits.toLocaleString()}
        </div>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default DeveloperActivityTableItem;
