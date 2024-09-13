import Image from 'next/image';
import Link from 'next/link';

export default function Partners() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative h-[36rem] w-1/2">
        <Link href="https://posthuman.digital/" target="_blank" className="group absolute left-[6rem] top-[9rem]">
          <div className="text-black-shadowed group-hover:text-shadowed font-handjet text-lg">Posthuman</div>
          <Image
            src="/img/icons/partners/posthuman.png"
            alt="posthuman"
            width={261}
            height={261}
            className="w-24 cursor-pointer rounded-full shadow-3xl group-hover:shadow-2xl"
          />
          <Image
            src="/img/icons/partners/line.png"
            alt="line"
            width={60}
            height={396}
            className="absolute left-24 top-4 -z-10 w-6 rotate-[120deg]"
          />
          <Image
            src="/img/icons/partners/line-h.png"
            alt="line"
            width={60}
            height={396}
            className="absolute left-24 top-4 -z-10 w-6 rotate-[120deg] opacity-0 group-hover:opacity-100"
          />
        </Link>
        <Link
          href="https://cyb.ai/"
          target="_blank"
          className="group absolute left-[8rem] top-[25rem] flex flex-col items-center"
        >
          <Image
            src="/img/icons/partners/cyber.png"
            alt="cyber"
            width={261}
            height={261}
            className="w-24 cursor-pointer rounded-full shadow-3xl group-hover:shadow-2xl"
          />
          <div className="text-black-shadowed group-hover:text-shadowed font-handjet text-lg">Cyber</div>
          <Image
            src="/img/icons/partners/line.png"
            alt="line"
            width={60}
            height={396}
            className="absolute -top-24 left-20 -z-10 w-6 rotate-[40deg]"
          />
          <Image
            src="/img/icons/partners/line-h.png"
            alt="line"
            width={60}
            height={396}
            className="absolute -top-24 left-20 -z-10 w-6 rotate-[40deg] opacity-0 group-hover:opacity-100"
          />
        </Link>
        <Link
          href="https://t.me/web_3_society"
          target="_blank"
          className="group absolute left-[25rem] top-[26rem] flex flex-col items-center"
        >
          <Image
            src="/img/icons/partners/web3c.png"
            alt="cyber"
            width={261}
            height={261}
            className="w-24 cursor-pointer rounded-full shadow-3xl group-hover:shadow-2xl"
          />
          <div className="text-black-shadowed group-hover:text-shadowed font-handjet text-lg">Web3 Society</div>
          <Image
            src="/img/icons/partners/line.png"
            alt="line"
            width={60}
            height={396}
            className="absolute -left-4 -top-24 -z-10 w-6 rotate-[140deg]"
          />
          <Image
            src="/img/icons/partners/line-h.png"
            alt="line"
            width={60}
            height={396}
            className="absolute -left-4 -top-24 -z-10 w-6 rotate-[140deg] opacity-0 group-hover:opacity-100"
          />
        </Link>
        <Link
          href="https://www.citizenweb3.com/"
          target="_blank"
          className="group absolute left-[29rem] top-[12.5rem] flex flex-col items-center"
        >
          <Image
            src="/img/icons/partners/cw3.png"
            alt="cyber"
            width={261}
            height={261}
            className="w-24 cursor-pointer rounded-full shadow-3xl group-hover:shadow-2xl"
          />
          <div className="text-black-shadowed group-hover:text-shadowed font-handjet text-lg">Citizen Web3</div>
          <Image
            src="/img/icons/partners/line.png"
            alt="line"
            width={60}
            height={396}
            className="absolute -left-6 -top-4 -z-10 w-6 rotate-[78deg]"
          />
          <Image
            src="/img/icons/partners/line-h.png"
            alt="line"
            width={60}
            height={396}
            className="absolute -left-6 -top-4 -z-10 w-6 rotate-[78deg] opacity-0 group-hover:opacity-100"
          />
        </Link>
        <Link
          href="https://bronbro.io/"
          target="_blank"
          className="group absolute left-[18rem] top-[2rem] flex flex-col items-center"
        >
          <div className="text-black-shadowed group-hover:text-shadowed font-handjet text-lg">Bro n Bro</div>
          <Image
            src="/img/icons/partners/bro-n-bro.png"
            alt="cyber"
            width={261}
            height={261}
            className="w-24 cursor-pointer rounded-full shadow-3xl group-hover:shadow-2xl"
          />
          <Image
            src="/img/icons/partners/line.png"
            alt="line"
            width={60}
            height={396}
            className="absolute left-8 top-12 -z-10 w-6 rotate-[13deg]"
          />
          <Image
            src="/img/icons/partners/line-h.png"
            alt="line"
            width={60}
            height={396}
            className="absolute left-8 top-12 -z-10 w-6 rotate-[13deg] opacity-0 group-hover:opacity-100"
          />
        </Link>
        <div className="absolute left-[14.5rem] top-[14rem]">
          <Image src="/img/logo2.png" alt="validatorInfo" width={327} height={327} className="w-40" />
        </div>
      </div>
    </div>
  );
}
