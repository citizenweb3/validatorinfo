'use client';

import { useTranslations } from 'next-intl';
import { ReactNode, useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';
import RoundedButton from '@/components/common/rounded-button';
import TextLink from '@/components/common/text-link';

const ListItem = ({ text }: { text: ReactNode }) => (
  <li className="list-none text-base">
    <span className="mb-1 mr-3 inline-block h-1 w-1 rounded-full bg-white" />
    <span className="text-justify">{text}</span>
  </li>
);

const OurToolsModal = () => {
  const [isToolsOpened, setIsToolsOpened] = useState<boolean>(false);
  const t = useTranslations('AboutPage');
  return (
    <>
      <div className="ml-10 mt-5">
        <RoundedButton className="text-lg" onClick={() => setIsToolsOpened(true)}>
          {t('Our tools')}
        </RoundedButton>
      </div>
      <BaseModal
        title={t('Our tools')}
        isRelative={false}
        opened={isToolsOpened}
        onClose={() => setIsToolsOpened(false)}
        className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
      >
        <div className="w-max max-w-[80vw] space-y-4 p-10 pt-5">
          <ListItem
            text={t.rich(`Tools.0`, {
              link: (text) => <TextLink content={text} href="https://www.citizenweb3.com/episodes" target="_blank" />,
            })}
          />
          <ListItem
            text={t.rich(`Tools.1`, {
              link: (text) => <TextLink content={text} href="https://t.me/web_3_society" target="_blank" />,
            })}
          />
          <ListItem
            text={t.rich(`Tools.2`, {
              link: (text) => <TextLink content={text} href="https://www.citizenweb3.com/staking" target="_blank" />,
            })}
          />
          <ListItem
            text={t.rich(`Tools.3`, {
              link: (text) => <TextLink content={text} href="https://bvc.citizenweb3.com/" target="_blank" />,
            })}
          />
          <ListItem text={t(`Tools.4`)} />
        </div>
      </BaseModal>
    </>
  );
};

export default OurToolsModal;
