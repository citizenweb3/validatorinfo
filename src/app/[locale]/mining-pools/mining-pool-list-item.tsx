'use client';

import { Chain, MiningPool } from '@prisma/client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import TableAvatar from '@/components/common/table/table-avatar';
import Tooltip from '@/components/common/tooltip';
import icons from '@/components/icons';
import { safeHref } from '@/utils/safe-href';

interface OwnProps {
  pool: MiningPool & { chain: Chain };
}

const WEB_SIZE = 'h-12 w-12 min-w-12 min-h-12';

// Identity row, mirroring SimpleValidatorListItem + ValidatorListItemLinks: Pool | Links | Networks.
const MiningPoolListItem: FC<OwnProps> = ({ pool }) => {
  const t = useTranslations('common');

  // Only treat http(s) links as real; anything else (e.g. javascript:) falls back to the "no link" state.
  const safeWebsite = safeHref(pool.website);
  const safeGithub = safeHref(pool.github);
  const safeTwitter = safeHref(pool.twitter);

  return (
    <BaseTableRow>
      <BaseTableCell className="group/avatar w-1/3 px-2 py-2 font-sfpro hover:text-highlight">
        <TableAvatar icon={pool.logoUrl} name={pool.name} href={`/mining-pools/${pool.slug}/networks`} />
      </BaseTableCell>

      <BaseTableCell className="px-3">
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center -space-x-3">
            {safeWebsite ? (
              <Link href={safeWebsite} className={WEB_SIZE} target="_blank" rel="noreferrer">
                <div className={`${WEB_SIZE} bg-web bg-contain bg-no-repeat hover:bg-web_h`} />
              </Link>
            ) : (
              <Tooltip tooltip={t('noWebLink')} direction="top">
                <div className={WEB_SIZE}>
                  <div className={`${WEB_SIZE} bg-web bg-contain bg-no-repeat opacity-40`} />
                </div>
              </Tooltip>
            )}
            {safeGithub ? (
              <Link href={safeGithub} className={WEB_SIZE} target="_blank" rel="noreferrer">
                <div className={`${WEB_SIZE} bg-github bg-contain bg-no-repeat hover:bg-github_h`} />
              </Link>
            ) : (
              <Tooltip tooltip={t('noGitLink')} direction="top">
                <div className={WEB_SIZE}>
                  <div className={`${WEB_SIZE} bg-github bg-contain bg-no-repeat opacity-40`} />
                </div>
              </Tooltip>
            )}
            {safeTwitter ? (
              <Link href={safeTwitter} className={WEB_SIZE} target="_blank" rel="noreferrer">
                <div className={`${WEB_SIZE} bg-x bg-contain bg-no-repeat hover:bg-x_h`} />
              </Link>
            ) : (
              <Tooltip tooltip={t('noTwitterLink')} direction="top">
                <div className={WEB_SIZE}>
                  <div className={`${WEB_SIZE} bg-x bg-contain bg-no-repeat opacity-40`} />
                </div>
              </Tooltip>
            )}
          </div>
        </div>
      </BaseTableCell>

      <BaseTableCell className="px-3">
        <div className="flex items-center justify-center space-x-0.5">
          <Tooltip tooltip={pool.chain.prettyName ?? pool.chain.name} direction="top">
            <Link href={`/networks/${pool.chain.name}/overview`}>
              <Image
                src={pool.chain.logoUrl || icons.AvatarIcon}
                alt={pool.chain.prettyName ?? pool.chain.name}
                width={24}
                height={24}
                className="h-6 min-h-6 w-6 min-w-6 rounded-full grayscale transition-all duration-300 hover:grayscale-0"
              />
            </Link>
          </Tooltip>
        </div>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default MiningPoolListItem;
