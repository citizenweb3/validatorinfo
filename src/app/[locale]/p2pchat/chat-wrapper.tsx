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
        <div className="flex items-center justify-center gap-24 mt-20">
          <div className="flex flex-col items-center gap-10">
            <div className="flex justify-center">
              <div className="border-b border-r border-bgSt p-4 text-lg font-black text-highlight">
                Username
              </div>
              <div className="border-b border-bgSt text-lg font-black text-highlight">
                <input
                  type="text"
                  className="bg-background p-4 font-black text-white"
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
          <div className="flex flex-col items-center gap-3">
            <RoundedButton
              className="text-xl"
              href="https://forum.validatorinfo.com"
              target="_blank"
            >
              {t('Visit Forum')}
            </RoundedButton>
            <p className="max-w-[330px] text-center font-handjet text-lg mt-4">
              {t('forumDescription')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWrapper;
