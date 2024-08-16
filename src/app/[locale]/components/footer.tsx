import Link from 'next/link';

import ScrollToTop from '@/components/common/scroll-to-top';

const Footer = () => {
  const size = 'h-12 w-12 min-w-12 min-h-12';
  return (
    <>
      <div className="my-4 flex items-center -space-x-2">
        <Link href="https://www.citizenweb3.com/about" className={size} target="_blank">
          <div className={`${size} bg-cw3 bg-contain bg-no-repeat hover:bg-cw3_h`} />
        </Link>
        <Link href="https://github.com/citizenweb3/validatorinfo" className={size} target="_blank">
          <div className={`${size} bg-github bg-contain bg-no-repeat hover:bg-github_h`} />
        </Link>
        <Link href="https://www.citizenweb3.com/about" className={size} target="_blank">
          <div className={`${size} bg-x bg-contain bg-no-repeat hover:bg-x_h`} />
        </Link>
      </div>
      <ScrollToTop />
    </>
  );
};

export default Footer;
