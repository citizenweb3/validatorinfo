import { FC } from 'react';
import Link from 'next/link';

interface OwnProps {
  label: string;
  value: string;
  href?: string;
}

const MetricPair: FC<OwnProps> = ({ label, value, href = '' }) => {
  return (
    <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover">
      <div
        className="flex w-7/12 items-center border-b border-r border-bgSt py-7 pl-7 pr-4 font-sfpro text-5xl sm:py-5 sm:pl-5 sm:text-3xl md:py-5 md:pl-10 md:pr-3 md:text-lg">
        {label}
      </div>
      <Link href={href}
            className="flex w-5/12 items-center gap-4 border-b border-bgSt py-7 pl-5 pr-5 font-handjet text-5xl hover:text-highlight sm:gap-3 sm:py-5 sm:pl-4 sm:text-3xl md:gap-2 md:py-5 md:pl-6 md:pr-4 md:text-lg hover:cursor-pointer hover:underline">
        {value}
      </Link>

    </div>
  );
};

export default MetricPair;