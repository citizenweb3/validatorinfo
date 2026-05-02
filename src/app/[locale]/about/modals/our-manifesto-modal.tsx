'use client';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import BaseModal from '@/components/common/modal/base-modal';
import RoundedButton from '@/components/common/rounded-button';

interface OwnProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const OurManifestoModal: FC<OwnProps> = ({ isOpen, onOpen, onClose }) => {
  const t = useTranslations('AboutPage');

  return (
    <>
      <div className="ml-10 mt-5">
        <RoundedButton className="text-lg" onClick={onOpen}>
          {t('Our Manifesto')}
        </RoundedButton>
      </div>
      <BaseModal
        title={t('Our Manifesto')}
        isRelative={false}
        opened={isOpen}
        onClose={onClose}
        className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
      >
        <div className="max-w-[80vw] space-y-6 p-10 pt-5 text-base md:max-w-[72vw]">
          <div className="whitespace-pre-line text-justify md:text-left">
            {t('Manifesto.intro')}
          </div>
          <blockquote className="border-l-2 border-highlight pl-6 italic text-white/80">
            {t('Manifesto.quote')}
          </blockquote>
          <div className="pl-6 text-sm text-white/60">{t('Manifesto.attribution')}</div>
          <div className="whitespace-pre-line text-justify md:text-left">
            {t('Manifesto.outro')}
          </div>
        </div>
      </BaseModal>
    </>
  );
};

export default OurManifestoModal;
