'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FC, ReactNode } from 'react';

import BaseModal from '@/components/common/modal/base-modal';
import RoundedButton from '@/components/common/rounded-button';
import TextLink from '@/components/common/text-link';

interface OwnProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const TOOL_ITEMS = [
  { key: 'validatorInfo', href: 'https://validatorinfo.com' },
  { key: 'staking', href: 'https://staking.citizenweb3.com/' },
  { key: 'aiWorkforce', href: 'https://agents.citizenweb3.com' },
  { key: 'publicGoods', href: 'https://www.citizenweb3.com/' },
] as const;

const PUBLIC_GOODS_LINKS: Record<string, string> = {
  podcastLink: 'https://podcast.citizenweb3.com',
  societyLink: 'https://t.me/web_3_society',
  privacyLink: 'https://privacy.citizenweb3.com',
  bvcLink: 'https://bvc.citizenweb3.com/',
  indexerLink: 'https://github.com/citizenweb3/chain-data-indexer',
  bazaarLink: 'https://www.citizenweb3.com/bazaar',
  manuscriptsLink: 'https://citizenweb3.github.io/manuscripts/',
};

const richLink =
  (href: string) =>
  (chunks: ReactNode) => (
    <Link href={href} target="_blank" className="text-highlight underline hover:no-underline">
      {chunks}
    </Link>
  );

const publicGoodsRichValues = Object.fromEntries(
  Object.entries(PUBLIC_GOODS_LINKS).map(([tag, href]) => [tag, richLink(href)]),
);

const OurToolsModal: FC<OwnProps> = ({ isOpen, onOpen, onClose }) => {
  const t = useTranslations('AboutPage');

  return (
    <>
      <div className="ml-10 mt-5">
        <RoundedButton className="text-lg" onClick={onOpen}>
          {t('Our tools')}
        </RoundedButton>
      </div>
      <BaseModal
        title={t('Our tools')}
        isRelative={false}
        opened={isOpen}
        onClose={onClose}
        className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
      >
        <div className="w-max max-w-[80vw] space-y-8 p-10 pt-5">
          {TOOL_ITEMS.map(({ key, href }) => (
            <div key={key} className="space-y-2">
              <TextLink
                href={href}
                target="_blank"
                content={t(`Tools.${key}.title`)}
                className="font-handjet text-xl text-highlight"
              />
              <div className="whitespace-pre-line text-base">
                {key === 'publicGoods'
                  ? t.rich(`Tools.${key}.body`, publicGoodsRichValues)
                  : t(`Tools.${key}.body`)}
              </div>
            </div>
          ))}
        </div>
      </BaseModal>
    </>
  );
};

export default OurToolsModal;
