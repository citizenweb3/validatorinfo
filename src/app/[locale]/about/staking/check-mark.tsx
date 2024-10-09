import Image from 'next/image';
import { FC } from 'react';

interface OwnProps {}

const CheckMark: FC<OwnProps> = ({}) => {
  return (
    <Image src="/img/icons/staking-check-mark.png" alt="check mark" width={152} height={130} className="mx-auto w-9" />
  );
};

export default CheckMark;
