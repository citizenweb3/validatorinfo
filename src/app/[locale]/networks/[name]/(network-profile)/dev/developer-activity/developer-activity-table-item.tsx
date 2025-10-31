import Link from 'next/link';
import { FC } from 'react';

import ToolTip from '@/components/common/tooltip';
import { GithubRepositoryWithCommitCount } from '@/services/github-service';

interface OwnProps {
  item: GithubRepositoryWithCommitCount;
}

const DeveloperActivityTableItem: FC<OwnProps> = ({ item }) => {
  return (
    <tr className="group cursor-pointer hover:bg-bgHover">
      <td className="w-1/3 border-b border-black py-4 hover:text-highlight active:border-bgSt">
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
      </td>
      <td className="w-1/3 border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <div className="flex items-center justify-center font-handjet text-lg">{item.language}</div>
      </td>
      <td className="w-1/3 border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <div className="flex items-center justify-center font-handjet text-lg">
          {item.totalCommits.toLocaleString()}
        </div>
      </td>
    </tr>
  );
};

export default DeveloperActivityTableItem;
