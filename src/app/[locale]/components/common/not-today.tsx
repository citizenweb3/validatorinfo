import Image from 'next/image';
import { FC } from 'react';

import icons from '@/components/icons';

const NotToday: FC = () => {
  return (
    <div className="relative mr-60 mt-5">
      <Image src={icons.NotToday} alt={'Error'} className="h-full w-full" />
    </div>
  );
};

export default NotToday;
