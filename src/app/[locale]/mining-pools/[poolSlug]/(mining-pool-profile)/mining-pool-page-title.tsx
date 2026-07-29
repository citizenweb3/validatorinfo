import Link from 'next/link';
import { FC } from 'react';

import PageTitle from '@/components/common/page-title';

interface OwnProps {
  chainName: string;
  chainPrettyName: string;
  poolName: string;
  poolSlug: string;
  preposition: string;
  text: string;
}

const cursorClassName =
  'h-7 min-h-7 w-7 min-w-7 bg-contain bg-no-repeat bg-cursor group-hover:bg-cursor_h group-active:bg-cursor_a';

const MiningPoolPageTitle: FC<OwnProps> = ({ chainName, chainPrettyName, poolName, poolSlug, preposition, text }) => {
  return (
    <PageTitle
      prefix={
        <div className="flex flex-row">
          <Link href={`/mining-pools/${poolSlug}/networks`} className="group">
            <span className="flex flex-row">
              <span className="group-hover:text-oldPalette-white group-active:text-3xl">{poolName}</span>
              <span aria-hidden className={cursorClassName} />
            </span>
          </Link>
          <span className="mx-2">{preposition}</span>
          <Link href={`/networks/${chainName}/overview`} className="group">
            <span className="flex flex-row">
              <span className="group-hover:text-oldPalette-white group-active:text-3xl">{chainPrettyName}</span>
              <span aria-hidden className={`${cursorClassName} mr-1`} />
            </span>
          </Link>
          <span aria-hidden>:</span>
        </div>
      }
      text={text}
    />
  );
};

export default MiningPoolPageTitle;
