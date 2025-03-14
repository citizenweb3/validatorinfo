'use client';

import { useTranslations } from 'next-intl';
import { FC, Suspense, useState } from 'react';
import RoundedButton from '@/components/common/rounded-button';
import { PagesProps } from '@/types';

interface OwnProps<T> extends PagesProps {
  items: T;
  Table: FC<{ items: T }>;
}

function TableDropdown<T>({ page, items, Table }: OwnProps<T>) {
  const t = useTranslations(page);
  const [isOpened, setIsOpened] = useState(false);

  const handleToggle = () => setIsOpened((prev) => !prev);

  return (
    <div>
      <div className="mb-8 flex items-center justify-end">
        <RoundedButton onClick={handleToggle} className="text-lg">
          {isOpened ? t('hide dropdown') : t('show dropdown')}
        </RoundedButton>
      </div>
      {isOpened && (
        <Suspense fallback={<div>Loading...</div>}>
          <Table items={items} />
        </Suspense>
      )}
    </div>
  );
}

export default TableDropdown;
