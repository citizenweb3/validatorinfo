import Link from 'next/link';
import React, { FC, ReactNode } from 'react';

interface OwnProps {
  href: string;
  content: ReactNode | string;
  target?: React.HTMLAttributeAnchorTarget;
}

const TextLink: FC<OwnProps> = ({ href, content, target = '_self' }) => {
  return (
    <Link href={href} target={target} className="underline hover:no-underline">
      {content}
    </Link>
  );
};

export default TextLink;
