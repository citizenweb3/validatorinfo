import Link from 'next/link';
import { FC, PropsWithChildren } from 'react';
import type { UrlObject } from 'url';

import Tooltip from '@/components/common/tooltip';

const activeClasses = {
  default: 'from-primary to-secondary',
  switcher: 'from-primary to-primary',
};

type TActiveType = keyof typeof activeClasses;

interface OwnProps {
  component?: 'button' | 'link';
  href?: string | UrlObject;
  onClick?: () => void;
  className?: string;
  contentClassName?: string;
  isActive?: boolean;
  activeType?: TActiveType;
  tooltip?: string;
}

const Button: FC<PropsWithChildren<OwnProps>> = ({
  children,
  onClick,
  className = '',
  component = 'button',
  contentClassName = '',
  href,
  isActive = false,
  activeType = 'default',
  tooltip,
}) => {
  const cn =
    (isActive
      ? `bg-gradient-to-r ${activeClasses[activeType]} active:from-transparent active:to-transparent border-none text-highlight`
      : 'bg-background') +
    ` ${className} group/button border-r border-t border-bgSt shadow-button hover:bg-bgHover hover:text-highlight hover:fill-highlight min-w-9 fill-black stroke-black p-px active:mt-1 active:border-transparent active:bg-background active:shadow-none`;
  let content = (
    <div
      className={`${contentClassName} relative flex h-full items-center justify-center bg-background px-2 py-1.5 group-hover/button:bg-bgHover group-active/button:bg-background`}
    >
      {children}
    </div>
  );

  if (tooltip) {
    content = <Tooltip tooltip={tooltip}>{content}</Tooltip>;
  }

  return component === 'link' ? (
    <Link href={href ?? '#'} className={cn}>
      {content}
    </Link>
  ) : (
    <button onClick={onClick} className={cn}>
      {content}
    </button>
  );
};

export default Button;
