'use client';

import { useTranslations } from 'next-intl';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import BaseModal from '@/components/common/modal/base-modal';
import TextLink from '@/components/common/text-link';

const ListItem = ({ children }: { children: ReactNode }) => (
  <li className="list-none text-base">
    <span className="mb-1 mr-3 inline-block h-1 w-1 rounded-full bg-white" />
    <span>{children}</span>
  </li>
);

const CoCreateButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslations('Header');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  const modalContent = (
    <>
      {isModalOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}
      <BaseModal
        title={t('Co-Create & Support')}
        isRelative={false}
        opened={isModalOpen}
        onClose={handleClose}
        className="left-1/2 top-20 -translate-x-1/2 transform"
      >
      <div className="w-max max-w-[80vw] p-10 pt-5">
        <p className="text-base">
          {t.rich('CoCreate.tagline', {
            github: (chunks) => (
              <TextLink href="https://github.com/citizenweb3/validatorinfo" content={chunks} target="_blank" />
            ),
          })}
        </p>
        <p className="text-base mb-5">
          {t('CoCreate.mission')}
        </p>
        <p className="text-base mb-5">
          {t.rich('CoCreate.description', {
            validator: (chunks) => (
              <TextLink href="https://www.citizenweb3.com/" content={chunks} target="_blank" />
            ),
            infrastructure: (chunks) => (
              <TextLink href="https://staking.citizenweb3.com/" content={chunks} target="_blank" />
            ),
          })}
        </p>

        <div>
          <p className="mb-4 text-base">{t('CoCreate.lookingFor')}</p>
          <ul className="space-y-2 pl-2 mb-5">
            <ListItem>{t('CoCreate.partners')}</ListItem>
            <ListItem>{t('CoCreate.interns')}</ListItem>
            <ListItem>{t('CoCreate.delegators')}</ListItem>
          </ul>
        </div>

        <p className="text-base">
          {t.rich('CoCreate.telegram', {
            tgLink: (chunks) => <TextLink href="https://t.me/citizenweb3" content={chunks} target="_blank" />,
          })}
        </p>

        <p className="text-base">
          {t.rich('CoCreate.support', {
            stakingLink: (chunks) => <TextLink href="https://staking.citizenweb3.com/" content={chunks} target="_blank" />,
          })}
        </p>
      </div>
    </BaseModal>
    </>
  );

  return (
    <>
      <button
        type="button"
        aria-label={t('Co-Create & Support')}
        onClick={handleOpen}
        className="group flex items-center justify-center border border-dashed border-redDottedLine bg-gradient-to-t from-[#181818] from-[26%] to-[rgba(62,62,62,0.3)] px-2.5 py-0.5 shadow-[0px_6px_6px_0px_black,0px_4px_4px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:border-solid hover:bg-bgHover active:scale-95 active:border-solid active:border-bgSt active:bg-background active:from-transparent active:to-transparent active:shadow-none"
      >
        <span className="text-dottedLine text-base text-gold-glow group-active:[text-shadow:none]">
          {t('Co-Create & Support')}
        </span>
      </button>

      {isMounted && createPortal(modalContent, document.body)}
    </>
  );
};

export default CoCreateButton;
