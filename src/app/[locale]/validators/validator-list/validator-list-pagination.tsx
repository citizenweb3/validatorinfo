import Link from 'next/link';
import { FC } from 'react';

import TriangleButton from '@/components/common/triangle-button';

interface OwnProps {
  currentPage: number;
  pageLength: number;
  baseUrl: string;
}

const ValidatorListPagination: FC<OwnProps> = ({ baseUrl, currentPage, pageLength }) => {
  const pages: (number | undefined)[] = [];
  const url = baseUrl.replace(/p=\d+/, '').indexOf('?') !== -1 ? baseUrl + '&' : '?';

  if (currentPage > 1) {
    pages.push(1);
  }

  if (currentPage >= 3) {
    pages.push(undefined);
    pages.push(currentPage - 1);
  }

  pages.push(currentPage);

  if (currentPage <= pageLength - 2) {
    pages.push(currentPage + 1);
  }

  if (currentPage <= pageLength - 3) {
    pages.push(undefined);
  }

  if (currentPage < pageLength) {
    pages.push(pageLength);
  }

  return (
    <div className="flex flex-row items-center justify-end space-x-2">
      {currentPage > 1 && (
        <Link href={`${url}p=${currentPage - 1}`}>
          <TriangleButton direction="l" />
        </Link>
      )}
      {pages.map((page) => (
        <Link key={page} href={page ? `${url}p=${page}` : ''}>
          <div
            className={`${currentPage === page ? 'border-highlight text-highlight' : 'border-bgSt'} ${page && 'hover:text-shadowed hover:text-highlight active:border-none'}  border-b px-2 font-handjet text-base`}
          >
            {page ?? '...'}
          </div>
        </Link>
      ))}
      {currentPage < pageLength && (
        <Link href={`${url}p=${currentPage + 1}`}>
          <TriangleButton direction="r" />
        </Link>
      )}
    </div>
  );
};

export default ValidatorListPagination;
