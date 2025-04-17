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

  const generateShareUrl = (platform: string) => {
    const url = encodeURIComponent('https://validatorinfo.com');
    const text = encodeURIComponent('ValidatorInfo awesome project!');

    switch (platform) {
      case 'x':
        return `https://x.com/intent/tweet?text=${text}&url=${url}`;
      case 'tg':
        return `https://t.me/share/url?url=${url}&text=${text}`;
      case 'reddit':
        return `https://www.reddit.com/submit?url=${url}&title=${text}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      default:
        return '#';
    }
  }

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
          <Link href={generateShareUrl('facebook')} className={`${size}`} target="_blank">
            <div className={`${size} bg-facebook bg-contain bg-no-repeat hover:bg-facebook_h`} />
          </Link>
          <Link href={generateShareUrl('reddit')}  className={size} target="_blank">
            <div className={`${size} bg-reddit bg-contain bg-no-repeat hover:bg-reddit_h`} />
          </Link>
          <Link href={generateShareUrl('x')} className={size} target="_blank">
            <div className={`${size} bg-x bg-contain bg-no-repeat hover:bg-x_h`} />
          </Link>
          <Link href={generateShareUrl('tg')}  className={size} target="_blank">
            <div className={`${size} bg-tg bg-contain bg-no-repeat hover:bg-tg_h`} />
          </Link>
        </div>
      </BaseModal>
    </>
  );
};

export default SpreadModal;
