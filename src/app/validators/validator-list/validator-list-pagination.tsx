import { headers } from 'next/headers';
import Link from 'next/link';
import { FC } from 'react';

import TriangleButton from '@/components/common/triangle-button';

interface OwnProps {}

const ValidatorListPagination: FC<OwnProps> = () => {
  const headersList = headers();
  // read the custom x-url header
  const search = headersList.get('x-current-search') ?? '';
  let currentPage = 1;
  if (search) {
    currentPage = parseInt(new URLSearchParams(search).get('p') ?? '1');
  }

  const pageLength = 100;

  const pages: (number | undefined)[] = [];

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
        <Link href={`?p=${currentPage - 1}`}>
          <TriangleButton direction="l" />
        </Link>
      )}
      {pages.map((page) => (
        <Link key={page} href={page ? `?p=${page}` : ''}>
          <div
            className={`${currentPage === page ? 'border-highlight text-highlight' : 'border-bgSt'} ${page && 'hover:text-shadowed hover:text-highlight active:border-none'}  border-b px-2 font-retro`}
          >
            {page ?? '...'}
          </div>
        </Link>
      ))}
      {currentPage < pageLength && (
        <Link href={`?p=${currentPage + 1}`}>
          <TriangleButton direction="r" />
        </Link>
      )}
    </div>
  );
};

export default ValidatorListPagination;
