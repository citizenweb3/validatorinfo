import { Validator } from '@prisma/client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FC } from 'react';

import Tooltip from '@/components/common/tooltip';

interface OwnProps {
  validator: Validator;
}

const ValidatorListItemLinks: FC<OwnProps> = ({ validator }) => {
  const t = useTranslations('common');
  let size = 'h-12 w-12 min-w-12 min-h-12';

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center justify-center -space-x-3">
        {validator?.website ? (
          <Link href={validator.website} className={`${size}`} target="_blank">
            <div className={`${size} bg-web bg-contain bg-no-repeat hover:bg-web_h`} />
          </Link>
        ) : (
          <Tooltip tooltip={t('noWebLink')} direction="top">
            <div className={`${size}`}>
              <div className={`${size} bg-web bg-contain bg-no-repeat opacity-40`} />
            </div>
          </Tooltip>
        )}
        {validator.github ? (
          <Link href={validator.github} className={size} target="_blank">
            <div className={`${size} bg-github bg-contain bg-no-repeat hover:bg-github_h`} />
          </Link>
        ) : (
          <Tooltip tooltip={t('noGitLink')} direction="top">
            <div className={`${size}`}>
              <div className={`${size} bg-github bg-contain bg-no-repeat opacity-40`} />
            </div>
          </Tooltip>
        )}
        {validator.twitter ? (
          <Link href={validator.twitter} className={size} target="_blank">
            <div className={`${size} bg-x bg-contain bg-no-repeat hover:bg-x_h`} />
          </Link>
        ) : (
          <Tooltip tooltip={t('noTwitterLink')} direction="top">
            <div className={`${size}`}>
              <div className={`${size} bg-x bg-contain bg-no-repeat opacity-40`} />
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default ValidatorListItemLinks;
