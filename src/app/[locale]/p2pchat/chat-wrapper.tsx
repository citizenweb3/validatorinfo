'use client';

import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';
import { toast } from 'react-toastify';

import Chat from '@/app/p2pchat/chat';
import RoundedButton from '@/components/common/rounded-button';

interface OwnProps {}

const ChatWrapper: FC<OwnProps> = ({}) => {
  const t = useTranslations('RumorsPage');
  const [isChatOpened, setIsChatOpened] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');

  return (
    <>
      <div className="flex flex-grow flex-col">
        {isChatOpened ? (
          <Chat username={username} />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="flex justify-center">
              <div className="border-b border-r border-bgSt p-4 text-lg font-black text-highlight">Username</div>
              <div className="border-b border-bgSt text-lg font-black text-highlight">
                <input
                  type="text"
                  className="bg-background p-4 font-black text-white"
                  placeholder="User1"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <RoundedButton
              className="mt-4 text-xl"
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
        )}
      </div>
    </>
  );
};

export default ChatWrapper;
