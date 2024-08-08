'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import Button from '@/components/common/button';
import BaseModal from '@/components/common/modal/base-modal';

const ListNumber = ({ number, text }: { number: number; text: string }) => (
  <li className="list-none text-base">
    <span className="font-hackernoon text-highlight">{number}) </span>
    <span className="text-justify">{text}</span>
  </li>
);

const OurToolsModal = () => {
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
        title={t('AboutPage.Our tools')}
        isRelative={false}
        opened={isToolsOpened}
        onClose={() => setIsToolsOpened(false)}
        className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
      >
        <div className="w-max max-w-[80vw] p-10 pt-5">
          {Array(5)
            .fill('')
            .map((_, index) => (
              <ListNumber key={index + 1} number={index + 1} text={t(`AboutPage.Tools.${index}`)} />
            ))}
        </div>
      </BaseModal>
    </>
  );
};

export default OurToolsModal;
