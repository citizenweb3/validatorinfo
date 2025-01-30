import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface OwnProps {
  link: string;
  icon: string;
  title: string;
}

const PartnerItem: FC<OwnProps> = ({ link, icon, title }) => (
  <Link href={link} target="_blank" className="group flex flex-col items-center justify-center">
    <Image
      src={icon}
      alt={title}
      width={261}
      height={261}
      className="w-[5.5rem] cursor-pointer rounded-full shadow-3xl group-hover:shadow-2xl"
    />
    <div className="text-black-shadowed group-hover:text-shadowed mt-2 text-center font-handjet text-lg font-light">
      {title}
    </div>
  </Link>
);

export default PartnerItem;
