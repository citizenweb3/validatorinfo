import Image from 'next/image';
import Link from 'next/link';

import SubTitle from '@/components/common/sub-title';

export default function Home() {
  const size = 'h-16 w-16 min-w-16 min-h-16';
  return (
    <div className="border-b border-bgSt py-4">
      <SubTitle text="Contacts" />
      <div className="my-4 flex w-3/4 justify-around">
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
      <div className="mt-8 flex flex-row items-center">
        <Image src="/img/icons/email.svg" alt="email" width={16} height={16} className="mr-1 h-4 w-4" />
        <Link href="mailto:ping@validatorinfo.com" className="text-base">
          ping@validatorinfo.com
        </Link>
      </div>
    </div>
  );
}
