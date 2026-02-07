import Link from 'next/link';
import { FC, HTMLAttributeAnchorTarget, PropsWithChildren } from 'react';
import type { UrlObject } from 'url';

import Tooltip from '@/components/common/tooltip';

interface OwnProps {
  component?: 'button' | 'link';
  href?: string | UrlObject;
  onClick?: () => void;
  className?: string;
  contentClassName?: string;
  isActive?: boolean;
  tooltip?: string;
  target?: HTMLAttributeAnchorTarget;
  scroll?: boolean;
}

const RoundedButton: FC<PropsWithChildren<OwnProps>> = ({
  children,
  onClick,
  className = '',
  contentClassName = '',
  tooltip,
  href,
  target,
  scroll = true,
}) => {
  let content = (
    <div
      className={`${contentClassName} relative flex h-full items-center justify-center px-6 py-2 font-handjet tracking-wide`}
    >
      {children}
    </div>
  );

  if (tooltip) {
    content = <Tooltip tooltip={tooltip}>{content}</Tooltip>;
  }

  const wrapperClassName = `${className} group/button min-w-9 border border-b-0 border-bgSt bg-background text-white shadow-button [border-image:linear-gradient(to_bottom,#4FB848,transparent)_1] hover:bg-bgHover hover:text-highlight active:-mb-1 active:mt-1 active:border-0 active:text-highlight active:shadow-[inset_0_4px_6px_rgba(0,0,0,0.6),inset_4px_0_6px_rgba(0,0,0,0.3),inset_-4px_0_6px_rgba(0,0,0,0.3)] active:[border-image:none]`;

  return href ? (
    <Link href={href} target={target} scroll={scroll} className={wrapperClassName}>
      {content}
    </Link>
  ) : (
    <button onClick={onClick} className={wrapperClassName}>
      {content}
    </button>
  );
};

export default RoundedButton;
