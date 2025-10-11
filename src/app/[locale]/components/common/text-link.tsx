import Link from 'next/link';
import React, { FC, ReactNode } from 'react';

interface OwnProps {
  href: string;
  content: ReactNode | string;
  target?: React.HTMLAttributeAnchorTarget;
  className?: string;
}

const TextLink: FC<OwnProps> = ({ href, content, target = '_self', className }) => {
  return (
    <Link href={href} target={target} className={`underline hover:no-underline ${className ?? ''}`}>
       {content}
    </Link>
  );
};

export default TextLink;
