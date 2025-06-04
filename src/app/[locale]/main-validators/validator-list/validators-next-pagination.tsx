'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

import TriangleButton from '@/components/common/triangle-button';

const ValidatorsNextPagination: FC = ({}) => {
  const pathname = usePathname();
  return (
    <tr>
      <td colSpan={10} className="pt-4">
        <div className="flex flex-row items-center justify-end space-x-2">
          <Link
            href="/"
            onClick={() => {
              if (pathname === '/') {
                window.location.reload();
              }
            }}
            className="mt-2 md:mt-0 hover:text-shadowed group flex items-center border-b border-bgSt px-2 font-handjet md:text-base text-6xl hover:text-highlight active:border-none"
          >
            <div className="mr-2">NEXT</div> <TriangleButton direction="r" />
          </Link>
        </div>
      </td>
    </tr>
  );
};

export default ValidatorsNextPagination;
