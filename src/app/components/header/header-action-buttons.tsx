import Image from 'next/image';
import { FC } from 'react';

import Button from '@/app/components/common/button';

interface OwnProps {}

const HeaderActionButtons: FC<OwnProps> = () => {
  return (
    <div className="mt-2 flex flex-row items-center justify-center space-x-8">
      <Button className="w-36 text-base" component="link" href="/ai">
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
        <span className="-my-1.5 pl-8 font-squarified">Hi, World!</span>
      </Button>
      <Button className="w-36 text-base" component="link" href={`/validators/${Math.floor(Math.random() * 1000) + 1}`}>
        <Image
          src="/img/icons/lucky.svg"
          alt="AI"
          width={24}
          height={24}
          priority
          className="absolute left-2 top-1/2 min-w-9 -translate-y-1/2 transform bg-contain group-hover/button:hidden"
        />
        <Image
          src="/img/icons/lucky-h.svg"
          alt="AI"
          width={24}
          height={24}
          priority
          className="absolute left-2 top-1/2 hidden min-w-9 -translate-y-1/2 transform group-hover/button:block"
        />
        <span className="-my-1.5 pl-6 font-squarified">Lucky!?</span>
      </Button>
    </div>
  );
};

export default HeaderActionButtons;
