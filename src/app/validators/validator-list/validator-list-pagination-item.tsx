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
          <div className="bg-triangle hover:bg-triangle_h active:bg-triangle_a h-1.5 w-2 rotate-90 cursor-pointer bg-contain" />
        </Link>
      )}
      {pages.map((page) => (
        <Link key={page} href={page ? `?p=${page}` : '#'}>
          <div
            className={`${currentPage === page && 'text-highlight'} hover:text-shadowed border-b border-bgSt px-2 font-retro hover:text-highlight active:border-transparent`}
          />
        </Link>
      ))}
      {currentPage > 1 && (
        <Link href={`?p=${currentPage + 1}`}>
          <div className="bg-triangle hover:bg-triangle_h active:triangle_a h-1.5 w-2 -rotate-90 cursor-pointer bg-contain" />
        </Link>
      )}
    </div>
  );
};

export default ValidatorListPagination;
