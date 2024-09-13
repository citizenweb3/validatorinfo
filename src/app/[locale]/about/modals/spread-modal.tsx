'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';
import RoundedButton from '@/components/common/rounded-button';

const size = 'h-24 w-24 min-w-24 min-h-24';

const SpreadModal = () => {
  const [isToolsOpened, setIsToolsOpened] = useState<boolean>(false);
  const t = useTranslations('AboutPage');

  return (
    <>
      <div className="">
        <RoundedButton className="text-lg" onClick={() => setIsToolsOpened(true)}>
          {t('Podcast.Spread the word')}
        </RoundedButton>
      </div>
      <BaseModal
        title={t('Podcast.Spread the word')}
        isRelative={false}
        opened={isToolsOpened}
        onClose={() => setIsToolsOpened(false)}
        className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
      >
        <div className="w-max max-w-[80vw] whitespace-pre-line px-10 pt-5 text-base">{t('Podcast.spreadText')}</div>
        <div className="my-4 flex justify-around">
          <Link href="https://www.citizenweb3.com/about" className={`${size}`} target="_blank">
            <div className={`${size} bg-facebook hover:bg-facebook_h bg-contain bg-no-repeat`} />
          </Link>
          <Link href="https://twitter.com/therealvalinfo" className={size} target="_blank">
            <div className={`${size} bg-reddit hover:bg-reddit_h bg-contain bg-no-repeat`} />
          </Link>
          <Link href="https://twitter.com/therealvalinfo" className={size} target="_blank">
            <div className={`${size} bg-x bg-contain bg-no-repeat hover:bg-x_h`} />
          </Link>
          <Link href="https://github.com/citizenweb3/validatorinfo" className={size} target="_blank">
            <div className={`${size} bg-tg hover:bg-tg_h bg-contain bg-no-repeat`} />
          </Link>
        </div>
      </BaseModal>
    </>
  );
};

export default SpreadModal;
