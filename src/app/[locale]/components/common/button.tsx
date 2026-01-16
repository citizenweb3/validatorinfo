import Link from 'next/link';
import { FC, PropsWithChildren } from 'react';
import type { UrlObject } from 'url';

import Tooltip from '@/components/common/tooltip';

const activeClasses = {
  default: 'md:from-primary md:to-secondary',
  switcher: 'md:from-primary md:to-primary',
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
  hasActiveFilters?: boolean;
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
  hasActiveFilters = false,
}) => {
  const cn =
    (isActive
      ? `bg-gradient-to-r ${activeClasses[activeType]} active:from-transparent active:to-transparent border-none text-highlight`
      : hasActiveFilters
        ? 'border-2 border-primary/50 bg-primary/10 text-highlight'
        : 'bg-gradient-to-t from-[#181818] from-[26%] to-[rgba(62,62,62,0.3)]') +
    ` ${className} group/button border-r border-t border-bgSt shadow-[0px_6px_6px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_black] hover:bg-bgHover hover:text-highlight hover:fill-highlight min-w-9 fill-black stroke-black p-px active:mt-1 active:border-transparent active:bg-background active:shadow-none`;
  let content = (
    <div
      className={`${contentClassName} relative flex h-full items-center justify-center px-2 py-1.5 group-hover/button:text-highlight`}
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
