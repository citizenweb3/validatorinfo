'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import Button from '@/components/common/button';
import BaseModal from '@/components/common/modal/base-modal';

const OurManifestoModal = () => {
  const [isToolsOpened, setIsToolsOpened] = useState<boolean>(false);
  const t = useTranslations();

  return (
    <>
      <div className="ml-10 mt-5">
        <Button className="text-lg" onClick={() => setIsToolsOpened(true)}>
          {t('Common.Learn More')}
        </Button>
      </div>
      <BaseModal
        title={t('AboutPage.Our Manifesto')}
        isRelative={false}
        opened={isToolsOpened}
        onClose={() => setIsToolsOpened(false)}
        className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
      >
        <div className="w-max max-w-[80vw] whitespace-pre-line p-10 pt-5 text-base">{t('AboutPage.Manifesto')}</div>
      </BaseModal>
    </>
  );
};

export default OurManifestoModal;
