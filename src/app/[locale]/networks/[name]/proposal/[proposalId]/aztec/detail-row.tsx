import { FC } from 'react';
import Link from 'next/link';

interface OwnProps {
  label: string;
  value: string;
  href?: string;
  isExternal?: boolean;
}

const DetailRow: FC<OwnProps> = ({ label, value, href, isExternal }) => {
  const valueContent = href ? (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="flex items-center gap-1 hover:underline"
    >
      {value}
    </Link>
  ) : (
    value
  );

  return (
    <div className="mt-2 flex w-full hover:bg-bgHover">
      <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
        {label}
      </div>
      <div
        className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
        {valueContent}
      </div>
    </div>
  );
};

export default DetailRow;