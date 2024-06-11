import Image from 'next/image';
import { FC } from 'react';

const NotToday: FC = () => {
  return (
    <div className="relative mt-20">
      <Image src="/img/error.png" alt="Error" width={804} height={594} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
        <div className="bg-background px-9 py-16 shadow-3xl">
          <div className="text-4xl text-highlight">*Keep it calm!</div>
          <div className="text-3xl -mt-7 text-nowrap text-white">We are validating the situation!</div>
        </div>
      </div>
    </div>
  );
};

export default NotToday;
