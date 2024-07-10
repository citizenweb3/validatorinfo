import Link from 'next/link';
import { FC } from 'react';

interface OwnProps {
  currentPage?: number;
}

const pages = [1, 2, undefined, 15];

const ValidatorListPagination: FC<OwnProps> = ({ currentPage = 1 }) => {
  return (
    <div className="flex flex-row items-center justify-end space-x-2">
      {currentPage > 1 && (
        <Link href={`?p=${currentPage - 1}`}>
          <div className="h-1.5 w-2 rotate-90 cursor-pointer bg-[url('/img/icons/triangle.svg')] bg-contain hover:bg-[url('/img/icons/triangle-h.svg')]" />
        </Link>
      )}
      {pages.map((page, index) => (
        <Link key={index} href={page ? `?p=${page}` : '#'}>
          <div
            className={`${currentPage === page && 'text-highlight'} hover:text-shadowed border-b border-bgSt px-2 font-retro hover:text-highlight active:border-transparent`}
          />
        </Link>
      ))}
      {currentPage > 1 && (
        <Link href={`?p=${currentPage + 1}`}>
          <div className="h-1.5 w-2 -rotate-90 cursor-pointer bg-[url('/img/icons/triangle.svg')] bg-contain hover:bg-[url('/img/icons/triangle-h.svg')]" />
        </Link>
      )}
    </div>
  );
};

export default ValidatorListPagination;
