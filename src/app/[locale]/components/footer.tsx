import Link from 'next/link';
import { FC } from 'react';

interface OwnProps {}

const Header: FC<OwnProps> = () => {
  const size = 'h-12 w-12 min-w-12 min-h-12';
  return (
    <div className="my-4 flex items-center justify-end space-x-1">
      <Link href="https://www.citizenweb3.com/about" className={`${size}`} target="_blank">
        <div className={`${size} bg-cw3 hover:bg-cw3_h bg-contain bg-no-repeat`} />
      </Link>
      <Link href="https://github.com/citizenweb3/validatorinfo" className={size} target="_blank">
        <div className={`${size} bg-github hover:bg-github_h bg-contain bg-no-repeat`} />
      </Link>
      <Link href="https://www.citizenweb3.com/about" className={size} target="_blank">
        <div className={`${size} bg-x hover:bg-x_h bg-contain bg-no-repeat`} />
      </Link>
    </div>
  );
};

export default Header;
