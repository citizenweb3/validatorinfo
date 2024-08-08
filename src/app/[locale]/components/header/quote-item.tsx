import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface OwnProps {
  name: string;
  value: string | number;
  href: string;
  grow?: boolean;
}

const QuoteItem: FC<OwnProps> = ({ name, value, grow, href }) => {
  const t = useTranslations('Header.Quotes');

  return (
    <Link href={href} className="flex flex-row items-center text-sm">
      <span className="text-nowrap">{t(name as 'Validators')}:</span>
      {typeof grow !== 'undefined' &&
        (grow ? (
          <Image src="/img/icons/grow.svg" alt="grow" className="w-3" width={8} height={6} />
        ) : (
          <Image src="/img/icons/fall.svg" alt="fall" className="w-3" width={8} height={6} />
        ))}
      <span
        className={`font-hackernoon ml-1 ${typeof grow === 'undefined' ? 'text-highlight' : grow ? 'text-secondary' : 'text-red'}`}
      >
        {value}
      </span>
    </Link>
  );
};
export default QuoteItem;
