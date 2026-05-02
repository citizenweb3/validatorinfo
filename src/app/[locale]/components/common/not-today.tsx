import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

const NotToday: FC = () => {
  return (
    <>
      <div className="hidden md:block" data-no-explain>
        <div className="relative mx-auto mt-20">
          <Image
            src="/img/not-found.png"
            alt="Keep calm! We are validating the situation!"
            width={6032}
            height={2739}
            className=""
            priority
          />
          <div className="absolute left-[15%] top-[30%]">
            <Link
              href="/"
              className="group/button inline-flex min-w-9 items-center justify-center border border-b-0 border-bgSt bg-background px-10 py-2 font-handjet text-lg tracking-normal text-white shadow-button [border-image:linear-gradient(to_bottom,#4FB848,transparent)_1] hover:bg-bgHover hover:text-highlight active:-mb-1 active:mt-1 active:border-0 active:text-highlight active:shadow-[inset_0_4px_6px_rgba(0,0,0,0.6),inset_4px_0_6px_rgba(0,0,0,0.3),inset_-4px_0_6px_rgba(0,0,0,0.3)] active:[border-image:none]"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
      <div className="block md:hidden">
        <div className="relative px-4 pt-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/icons/not-today-mobile.svg"
            alt="Keep calm! We are validating the situation!"
            className="h-auto w-full"
          />
          <div className="absolute left-1/2 top-[40%] -translate-x-1/2">
            <Link
              href="/"
              className="group/button inline-flex min-w-9 items-center justify-center border border-b-0 border-bgSt bg-background px-40 py-8 font-handjet text-7xl tracking-normal text-white shadow-button [border-image:linear-gradient(to_bottom,#4FB848,transparent)_1] hover:bg-bgHover hover:text-highlight active:-mb-1 active:mt-1 active:border-0 active:text-highlight active:shadow-[inset_0_4px_6px_rgba(0,0,0,0.6),inset_4px_0_6px_rgba(0,0,0,0.3),inset_-4px_0_6px_rgba(0,0,0,0.3)] active:[border-image:none]"
            >
              Go Home
            </Link>
          </div>
        </div>
        <div className="h-8 bg-bgSt" />
      </div>
    </>
  );
};

export default NotToday;
