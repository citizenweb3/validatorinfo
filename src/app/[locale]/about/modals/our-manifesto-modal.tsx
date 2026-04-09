'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';
import BaseModalMobile from '@/components/common/modal/base-modal-mobile';
import RoundedButton from '@/components/common/rounded-button';

const OurManifestoModal = () => {
  const [isToolsOpened, setIsToolsOpened] = useState<boolean>(false);
  const t = useTranslations('AboutPage');

  return (
    <>
      <div className="ml-4 mt-3 md:ml-10 md:mt-5">
        <RoundedButton className="text-lg" onClick={() => setIsToolsOpened(true)}>
          {t('Our Manifesto')}
        </RoundedButton>
      </div>
      {isToolsOpened && (
        <div className="hidden md:block">
          <BaseModal
            title={t('Our Manifesto')}
            isRelative={false}
            opened={isToolsOpened}
            onClose={() => setIsToolsOpened(false)}
            className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
          >
            <div className="w-max max-w-[80vw] whitespace-pre-line p-10 pt-5 text-base">{t('Manifesto')}</div>
          </BaseModal>
        </div>
      )}
      {isToolsOpened && (
        <div className="block md:hidden">
          <BaseModalMobile
            title={t('Our Manifesto')}
            isRelative={false}
            opened={isToolsOpened}
            onClose={() => setIsToolsOpened(false)}
            className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
          >
            <div className="max-w-[90vw] whitespace-pre-line p-4 pt-3 text-base">{t('Manifesto')}</div>
          </BaseModalMobile>
        </div>
      )}
    </>
  );
};

export default OurManifestoModal;
