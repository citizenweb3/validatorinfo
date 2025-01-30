import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { FC } from 'react';

import Button from '@/components/common/button';
import icons from '@/components/icons';

interface OwnProps {}

const HeaderActionButtons: FC<OwnProps> = () => {
  const t = useTranslations('Header');

  return (
    <div className="mt-2 grid grid-cols-2 gap-8 text-base">
      <Button component="link" href="/ai" tooltip={t('Explore the AI Rabbit whole')}>
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
        <span className="-my-1.5 pl-8 font-handjet font-light">{t('Hi, World!')}</span>
      </Button>
      <Button component="link" href={`/validators/lucky`}>
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
        <span className="-my-1.5 pl-8 font-handjet font-light">{t('Lucky!?')}</span>
      </Button>
    </div>
  );
};

export default HeaderActionButtons;
