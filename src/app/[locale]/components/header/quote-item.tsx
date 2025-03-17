import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import Tooltip from '@/components/common/tooltip';

interface OwnProps {
  name: string;
  value?: string | number;
  href: string;
  grow?: boolean;
}

const QuoteItem: FC<OwnProps> = ({ name, value, grow, href }) => {
  const t = useTranslations('Header.Quotes');

  return (
    <Tooltip noWrap tooltip={t(`${name}.hint` as 'Validators.hint')}>
      <Link href={href} className="flex flex-row items-center text-sm">
        <span className="text-nowrap">{t(`${name}.name` as 'Validators.name')}</span>
        {typeof grow !== 'undefined' &&
          (grow ? (
            <Image src="/img/icons/grow.svg" alt="grow" className="w-3" width={8} height={6} />
          ) : (
            <Image src="/img/icons/fall.svg" alt="fall" className="w-3" width={8} height={6} />
          ))}
        {value && (
          <span
            className={`ml-1 font-handjet text-sm ${typeof grow === 'undefined' ? 'text-highlight' : grow ? 'text-secondary' : 'text-red'}`}
          >
            {value}
          </span>
        )}
      </Link>
    </Tooltip>
  );
};
export default QuoteItem;
