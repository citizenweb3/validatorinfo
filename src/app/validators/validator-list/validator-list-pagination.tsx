import Link from 'next/link';
import { FC } from 'react';

interface OwnProps {}

const ValidatorListPagination: FC<OwnProps> = ({}) => {
  return (
    <div className="flex flex-row items-center justify-end space-x-2">
      <Link href={'?p=1'}>
        <div className="h-1.5 w-2 rotate-90 cursor-pointer bg-[url('/img/icons/triangle.svg')] bg-contain hover:bg-[url('/img/icons/triangle-h.svg')]" />
      </Link>
      <span className="border-b border-highlight px-2 font-retro text-highlight">1</span>
      <Link href={'?p=1'} className="border-b border-bgSt px-2 font-retro hover:border-highlight hover:text-highlight">
        2
      </Link>
      <span className="border-b border-bgSt px-2 font-retro">...</span>
      <Link href={'?p=1'} className="border-b border-bgSt px-2 font-retro hover:border-highlight hover:text-highlight">
        15
      </Link>
      <Link href={'?p=1'}>
        <div className="h-1.5 w-2 -rotate-90 cursor-pointer bg-[url('/img/icons/triangle.svg')] bg-contain hover:bg-[url('/img/icons/triangle-h.svg')]" />
      </Link>
    </div>
  );
};

export default ValidatorListPagination;
