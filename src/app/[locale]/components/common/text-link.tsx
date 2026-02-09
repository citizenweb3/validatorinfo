import Link from 'next/link';
import React, { FC, ReactNode } from 'react';

interface OwnProps {
  href: string;
  content: ReactNode | string;
  target?: React.HTMLAttributeAnchorTarget;
  className?: string;
  withCursor?: boolean;
}

const TextLink: FC<OwnProps> = ({ href, content, target = '_self', className = '', withCursor = false }) => {
  const cursor = 'h-7 min-h-7 w-7 min-w-7 bg-contain bg-no-repeat bg-cursor group-hover:bg-cursor_h group-active:bg-cursor_a';

  if (withCursor) {
    return (
      <Link href={href} target={target} className="group">
        <span className="inline-flex flex-row">
          <span className={`${className} underline hover:no-underline group-hover:text-oldPalette-white`}>{content}</span>
          <span className={cursor} />
        </span>
      </Link>
    );
  }

  return (
    <Link href={href} target={target} className={`${className} underline hover:no-underline`}>
      {content}
    </Link>
  );
};

export default TextLink;
