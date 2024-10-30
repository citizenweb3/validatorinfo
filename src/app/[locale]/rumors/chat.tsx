'use client';

import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { ChangeEvent, FC, useEffect, useState } from 'react';

import { socket } from '@/socket';
import { ChatMessage } from '@/types';

interface OwnProps {
  username: string;
}

const Chat: FC<OwnProps> = ({ username }) => {
  const t = useTranslations('RumorsPage');
  const [value, setValue] = useState('');
  const [usersInside, setUsersInside] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { name: 'Admin', text: 'Hey there! Welcome to our anon chat without history', date: new Date() },
  ]);

  useEffect(() => {
    const onBeforeUnload = () => {
      socket.emit('live', username);
    };
    window.addEventListener('onbeforeunload', onBeforeUnload);
    const onChatMessage = (message: ChatMessage) => {
      if (message.name !== username) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };

    const updateUsers = (users: string[]) => {
      setUsersInside(users);
    };

    socket.on('chat message', onChatMessage);
    socket.emit('enter', username);
    socket.on('actual-users', updateUsers);

    return () => {
      socket.emit('live', username);
      socket.off('chat message', onChatMessage);
      socket.off('actual-users', updateUsers);
      window.removeEventListener('onbeforeunload', onBeforeUnload);
    };
  }, []);

  const onTextChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <div className="mt-4 flex min-h-60 flex-grow items-stretch">
      <div className="flex h-full w-full items-stretch bg-bgHover shadow-chat">
        <div className="w-40 border-r border-bgSt" />
        <div className="flex flex-grow flex-col">
          <div className="flex flex-grow">
            <div className="flex flex-grow flex-col justify-end px-4 py-2">
              {messages.map((message) => (
                <div key={message.date.toString()} className="flex space-x-2 text-lg">
                  <div className="text-secondary">{format(message.date, 'HH:mm:ss')} |</div>
                  <div className="text-highlight">{message.name}:</div>
                  <div>{message.text}</div>
                </div>
              ))}
            </div>
            <div className="flex w-40 flex-col justify-end space-y-2 border-l border-bgSt p-4 text-base text-highlight">
              {usersInside.map((user) => (
                <div>{user}</div>
              ))}
            </div>
          </div>
          <input
            className="h-16 border-t border-bgSt bg-bgHover px-10 text-lg focus:outline-0 focus:ring-0"
            type="text"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && value) {
                socket.emit('chat message', { name: username, text: value.trim(), date: new Date() });
                setMessages((prevMessages) => [
                  ...prevMessages,
                  {
                    name: username,
                    text: value,
                    date: new Date(),
                  },
                ]);
                setValue('');
                return false;
              }
              return true;
            }}
            value={value}
            onChange={onTextChanged}
            placeholder="..."
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
