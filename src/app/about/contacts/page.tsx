import Image from 'next/image';
import Link from 'next/link';

import SubTitle from '@/components/common/sub-title';
import icons from '@/components/icons';

export default function Home() {
  const size = 'h-16 w-16 min-w-16 min-h-16';
  return (
    <div className="border-b border-bgSt py-4">
      <SubTitle text="Contacts" />
      <div className="my-4 flex w-3/4 justify-around">
        <Link href={`/validator/1`} className={size}>
          <Image src={icons.CW3Icon} alt="control" className={size} />
        </Link>
        <Link href="https://github.com/citizenweb3" className={size} target="_blank">
          <Image src={icons.GithubIcon} alt="Citizen Web 3 github" className={size} />
        </Link>
        <Link href="https://x.com/citizen_web3" className={size} target="_blank">
          <Image src={icons.XIcon} alt="Citizen Web 3 X" className={size} />
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
