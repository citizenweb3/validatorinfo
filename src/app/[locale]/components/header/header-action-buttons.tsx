import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { FC } from 'react';

import Button from '@/components/common/button';

interface OwnProps {}

const HeaderActionButtons: FC<OwnProps> = () => {
  const t = useTranslations('Header');

  return (
    <div className="mt-2 flex flex-row items-center justify-center space-x-8 text-base">
      <Button component="link" href="/ai" tooltip={t('Explore the AI Rabbit whole')}>
        <Image
          src="/img/icons/rabbit.svg"
          alt="AI"
          width={24}
          height={24}
          priority
          className="absolute left-0 top-1/2 min-w-10 -translate-y-1/2 transform bg-contain group-hover/button:hidden"
        />
        <Image
          src="/img/icons/rabbit-h.svg"
          alt="AI"
          width={24}
          height={24}
          priority
          className="absolute left-0 top-1/2 hidden min-w-10 -translate-y-1/2 transform group-hover/button:block"
        />
        <span className="-my-1.5 pl-8">{t('Hi, World!')}</span>
      </Button>
      <Button component="link" href={`/validators/lucky`}>
        <Image
          src="/img/icons/lucky.svg"
          alt="AI"
          width={24}
          height={24}
          priority
          className="absolute left-0 top-1/2 min-w-9 -translate-y-1/2 transform bg-contain group-hover/button:hidden"
        />
        <Image
          src="/img/icons/lucky-h.svg"
          alt="AI"
          width={24}
          height={24}
          priority
          className="absolute left-0 top-1/2 hidden min-w-9 -translate-y-1/2 transform group-hover/button:block"
        />
        <span className="-my-1.5 pl-8">{t('Lucky!?')}</span>
      </Button>
    </div>
  );
};

export default HeaderActionButtons;
