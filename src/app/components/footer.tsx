import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import icons from '@/components/icons';

interface OwnProps {}

const Header: FC<OwnProps> = ({}) => {
  const size = 'h-9 w-9 min-w-9 min-h-9';
  return (
    <div className="my-4 flex justify-end space-x-1">
      <Link href="https://www.citizenweb3.com/about" className={size} target="_blank">
        <Image src={icons.CW3Icon} alt="control" className={size} />
      </Link>
      <Link href="https://github.com/citizenweb3/validatorinfo" className={size} target="_blank">
        <Image src={icons.GithubIcon} alt="Citizen Web 3 github" className={size} />
      </Link>
      <Link href="https://twitter.com/therealvalidatorinfo" className={size} target="_blank">
        <Image src={icons.XIcon} alt="Citizen Web 3 X" className={size} />
      </Link>
    </div>
  );
};

export default Header;
