import Link from 'next/link';
import { FC } from 'react';

interface OwnProps {}

const Header: FC<OwnProps> = ({}) => {
  const size = 'h-12 w-12 min-w-12 min-h-12';
  return (
    <div className="my-4 flex items-center justify-end space-x-1">
      <Link href="https://www.citizenweb3.com/about" className={`${size}`} target="_blank">
        <div
          className={`${size} bg-[url('/img/icons/cw3.svg')] bg-contain bg-no-repeat hover:bg-[url('/img/icons/cw3-h.svg')]`}
        />
      </Link>
      <Link href="https://github.com/citizenweb3/validatorinfo" className={size} target="_blank">
        <div
          className={`${size} bg-[url('/img/icons/github.svg')] bg-contain bg-no-repeat hover:bg-[url('/img/icons/github-h.svg')]`}
        />
      </Link>
      <Link href="https://www.citizenweb3.com/about" className={size} target="_blank">
        <div
          className={`${size} bg-[url('/img/icons/x.svg')] bg-contain bg-no-repeat hover:bg-[url('/img/icons/x-h.svg')]`}
        />
      </Link>
    </div>
  );
};

export default Header;
