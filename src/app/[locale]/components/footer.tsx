import Link from 'next/link';

import ScrollToTop from '@/components/common/scroll-to-top';

const Footer = () => {
  const size = 'md:h-12 md:w-12 md:min-w-12 md:min-h-12 sm:h-24 sm:w-24 sm:min-w-24 sm:min-h-24 h-40 w-40 min-w-40 min-h-40';
  return (
    <>
      <div className="my-4 flex items-center -space-x-2 md:border-t border-primary pt-4">
        <Link href="https://www.citizenweb3.com/about" className={size} target="_blank">
          <div className={`${size} bg-cw3 bg-contain bg-no-repeat hover:bg-cw3_h`} />
        </Link>
        <Link href="https://github.com/citizenweb3/validatorinfo" className={size} target="_blank">
          <div className={`${size} bg-github bg-contain bg-no-repeat hover:bg-github_h`} />
        </Link>
        <Link href="https://twitter.com/therealvalinfo" className={size} target="_blank">
          <div className={`${size} bg-x bg-contain bg-no-repeat hover:bg-x_h`} />
        </Link>
      </div>
      <ScrollToTop />
    </>
  );
};

export default Footer;
