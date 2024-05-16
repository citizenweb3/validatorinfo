import Image from 'next/image';
import { FC } from 'react';

import Button from '@/app/components/common/button';

interface OwnProps {}

const HeaderActionButtons: FC<OwnProps> = ({}) => {
  return (
    <div className="mt-3 flex h-6 flex-row items-center space-x-8">
      <Button className="border-hover-highlight bg-gradient-to-b !from-highlight !to-highlight">
        <Image src="/img/icons/rabbit.png" alt="AI" width={24} height={24} className="h-6 w-6" />
      </Button>
      <Button className="border-hover-highlight bg-gradient-to-b !from-highlight !to-highlight">
        <Image src="/img/icons/luck.png" alt="AI" width={18} height={18} className="m-0.5 h-5 w-5" />
      </Button>
    </div>
  );
};

export default HeaderActionButtons;
