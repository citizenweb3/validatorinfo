'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { FC, useCallback } from 'react';

import Button from '@/components/common/button';
import icons from '@/components/icons';
import { emitWindowEvent } from '@/hooks/useWindowEvent';
import { AI_CHAT_OPEN_EVENT, AiChatOpenEventDetail } from '@/components/ai-chat/ai-explain-button';

interface OwnProps {}

const HeaderActionButtons: FC<OwnProps> = () => {
  const t = useTranslations('Header');

  const handleAiClick = useCallback(() => {
    emitWindowEvent<AiChatOpenEventDetail>(AI_CHAT_OPEN_EVENT, { message: '' });
  }, []);

  return (
    <div className="mt-2 grid grid-cols-2 gap-8 text-base">
      <Button component="button" onClick={handleAiClick} tooltip={t('Explore the AI Rabbit hole')}>
        <Image
          src={icons.RabbitIcon}
          alt="AI"
          width={156}
          height={156}
          priority
          className="absolute left-1 top-1/2 w-9 -translate-y-1/2 transform bg-contain group-hover/button:hidden"
        />
        <Image
          src={icons.RabbitIconHovered}
          alt="AI"
          width={156}
          height={156}
          priority
          className="absolute left-1 top-1/2 hidden w-9 -translate-y-1/2 transform group-hover/button:block"
        />
        <span className="-my-1.5 pl-8 font-handjet font-semibold text-lg tracking-wide">{t('Hi, World!')}</span>
      </Button>
      <Button component="link" href={`/lucky`}>
        <Image
          src={icons.LuckyIcon}
          alt="AI"
          width={126}
          height={126}
          priority
          className="absolute left-2 top-1/2 w-7 -translate-y-1/2 transform bg-contain group-hover/button:hidden"
        />
        <Image
          src={icons.LuckyIconHovered}
          alt="AI"
          width={126}
          height={126}
          priority
          className="absolute left-2 top-1/2 hidden w-7 -translate-y-1/2 transform group-hover/button:block"
        />
        <span className="-my-1.5 pl-8 font-handjet font-semibold text-lg tracking-wide">{t('Lucky!?')}</span>
      </Button>
    </div>
  );
};

export default HeaderActionButtons;
