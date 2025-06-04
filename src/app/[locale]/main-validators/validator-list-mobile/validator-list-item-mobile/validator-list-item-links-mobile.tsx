import { Validator } from '@prisma/client';
import Link from 'next/link';
import { FC, useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';
import PlusButton from '@/components/common/plus-button';
import Tooltip from '@/components/common/tooltip';
import { useTranslations } from 'next-intl';

interface OwnProps {
  validator: Validator;
}

const ValidatorListItemLinksMobile: FC<OwnProps> = ({ validator }) => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const t = useTranslations('common');

  let size = 'h-40 w-40 min-w-40 min-h-40';

  return (
    <div className="flex items-center justify-center space-x-0.5">
      <>
        <div className="-mt-2.5">
          <PlusButton
            size="xl"
            isOpened={isModalOpened}
            onClick={() => {
              setIsModalOpened(!isModalOpened);
            }}
          />
        </div>
        {isModalOpened && (
          <BaseModal
            opened={true}
            onClose={() => setIsModalOpened(false)}
            isRelative
            className="absolute -top-6 right-0 z-40"
          >
            <div className="flex max-h-96 w-[30rem] flex-row flex-wrap items-center justify-center mt-14 mb-10 md:mt-0 md:mb-0">
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
          </BaseModal>
        )}
      </>
    </div>
  );
};

export default ValidatorListItemLinksMobile;
