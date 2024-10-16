'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';
import RoundedButton from '@/components/common/rounded-button';

const OurManifestoModal = () => {
  const [isToolsOpened, setIsToolsOpened] = useState<boolean>(false);
  const t = useTranslations('AboutPage');

  return (
    <>
      <div className="ml-10 mt-5">
        <RoundedButton className="text-lg" onClick={() => setIsToolsOpened(true)}>
          {t('Our Manifesto')}
        </RoundedButton>
      </div>
      <BaseModal
        title={t('Our Manifesto')}
        isRelative={false}
        opened={isToolsOpened}
        onClose={() => setIsToolsOpened(false)}
        className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
      >
        <div className="w-max max-w-[80vw] whitespace-pre-line p-10 pt-5 text-base">{t('Manifesto')}</div>
      </BaseModal>
    </>
  );
};

export default OurManifestoModal;
