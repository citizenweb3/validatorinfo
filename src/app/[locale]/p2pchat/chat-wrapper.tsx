'use client';

import { useTranslations } from 'next-intl';
import { FC, KeyboardEvent, useState } from 'react';
import { toast } from 'react-toastify';

import Chat from '@/app/p2pchat/chat';
import RoundedButton from '@/components/common/rounded-button';

interface OwnProps {}

const ChatWrapper: FC<OwnProps> = () => {
  const t = useTranslations('RumorsPage');
  const [isChatOpened, setIsChatOpened] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');

  return (
    <div className="flex flex-grow flex-col">
      {isChatOpened ? (
        <Chat username={username} />
      ) : (
        <div className="mt-20 flex items-center justify-center gap-24">
          <div className="flex flex-col items-center gap-6">
            <div className="flex bg-table_row bg-clip-padding shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
              <div className="border-r border-bgSt px-8 py-4 text-lg font-black text-highlight">
                Username
              </div>
              <input
                type="text"
                className="bg-transparent px-8 py-4 text-lg font-black text-white outline-none"
                placeholder="User1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    if (username) {
                      setIsChatOpened(true);
                    } else {
                      toast.error(t('noNameError'));
                    }
                  }
                }}
              />
            </div>
            <RoundedButton
              className="text-xl"
              onClick={() => {
                if (username) {
                  setIsChatOpened(true);
                } else {
                  toast.error(t('noNameError'));
                }
              }}
            >
              {t('Start')}
            </RoundedButton>
          </div>
          <div className="flex items-center gap-10 self-stretch">
            <div className="w-px self-stretch bg-bgSt" />
            <span className="font-handjet text-lg text-gray-500">{t('or')}</span>
            <div className="w-px self-stretch bg-bgSt" />
          </div>
          <div className="flex flex-col items-center gap-6">
            <p className="max-w-[330px] text-center font-handjet text-lg">
              {t('forumDescription')}
            </p>
            <RoundedButton
              className="text-xl"
              href="https://forum.validatorinfo.com"
              target="_blank"
            >
              {t('Visit Forum')}
            </RoundedButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWrapper;
