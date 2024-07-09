import Image from 'next/image';
import { FC } from 'react';

import Button from '@/app/components/common/button';

interface OwnProps {}

const HeaderActionButtons: FC<OwnProps> = ({}) => {
  return (
    <div className="mt-4 flex h-6 flex-row items-center justify-center space-x-8">
      <Button className="text-base" component="link" href="/ai">
        <Image src="/img/icons/rabbit.png" alt="AI" width={24} height={24} className="w-6" />
        <span className="pl-2.5 font-squarified">Hi, World!</span>
      </Button>
      <Button className="text-base" component="link" href={`/validators/${Math.floor(Math.random() * 1000) + 1}`}>
        <Image src="/img/icons/luck.png" alt="AI" width={18} height={18} className="m-0.5 w-5" />
        <span className="pl-2.5 font-squarified">Lucky!?</span>
      </Button>
    </div>
  );
};

export default HeaderActionButtons;
