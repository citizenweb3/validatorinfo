import { headers } from 'next/headers';
import Link from 'next/link';
import { FC, ReactNode } from 'react';

import TriangleButton from '@/components/common/triangle-button';

interface OwnProps {
  pageLength: number;
}

interface PageElement {
  href: string;
  name: string | number | ReactNode;
}

const TablePagination: FC<OwnProps> = ({ pageLength }) => {
  const searchString = headers().get('x-current-search');
  const sp = new URLSearchParams(searchString ?? '');

  const currentPage = parseInt(sp.get('p') ?? '1');

  const pages: PageElement[] = [];

  if (currentPage > 1) {
    if (currentPage === 2) {
      sp.set('p', '1');
    } else {
      sp.set('p', (currentPage - 1).toString());
    }
    pages.push({ href: sp.toString(), name: <TriangleButton direction="l" /> });
  }

  if (currentPage > 1) {
    sp.set('p', '1');
    pages.push({ href: sp.toString(), name: 1 });
  }

  if (currentPage >= 3) {
    pages.push({ href: '', name: '...' });
    sp.set('p', `${currentPage - 1}`);
    pages.push({ href: sp.toString(), name: currentPage - 1 });
  }

  sp.set('p', `${currentPage}`);
  pages.push({ href: '', name: currentPage });

  if (currentPage <= pageLength - 2) {
    sp.set('p', `${currentPage + 1}`);
    pages.push({ href: sp.toString(), name: currentPage + 1 });
  }

  if (currentPage <= pageLength - 3) {
    pages.push({ href: '', name: '...' });
  }

  if (currentPage < pageLength) {
    sp.set('p', `${pageLength}`);
    pages.push({ href: sp.toString(), name: pageLength });
  }

  if (currentPage < pageLength) {
    sp.set('p', (currentPage + 1).toString());
    pages.push({ href: sp.toString(), name: <TriangleButton direction="r" /> });
  }

  if (pageLength < 2) {
    return <div className="h-8" />;
  }

  return (
    <div className="flex flex-row items-center justify-end space-x-2">
      {pages.map((page) => {
        const content = (
          <div
            className={`${currentPage === page.name ? 'border-highlight text-highlight' : 'border-bgSt'} ${page.href && 'hover:text-shadowed hover:text-highlight active:border-none'}  border-b px-2 font-handjet text-base`}
          >
            {page.name}
          </div>
        );

        return page.href ? (
          <Link key={page.href + page.name} href={`?${page.href}`}>
            {content}
          </Link>
        ) : (
          content
        );
      })}
    </div>
  );
};

export default TablePagination;
