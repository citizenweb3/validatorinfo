'use client';

import { FC, ReactNode, useRef } from 'react';

type TDirection = 'top' | 'bottom';

interface Props {
  children: ReactNode;
  tooltip: string;
  direction?: TDirection;
  className?: string;
}

const ToolTip: FC<Props> = ({ children, tooltip, direction = 'bottom', className }): JSX.Element => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={container}
      onMouseEnter={() => {
        if (!tooltipRef.current || !container.current) return;
        const { width, height } = container.current.getBoundingClientRect();
        const { width: tWidth, height: tHeight } = tooltipRef.current.getBoundingClientRect();

        tooltipRef.current.style.left = -(tWidth - width) / 2 + 'px';

        console.log('[SSA] di: ', direction, tooltip);

        switch (direction) {
          case 'bottom':
            tooltipRef.current.style.top = `calc(${height}px + 0.5rem)`;
            break;
          case 'top':
            tooltipRef.current.style.top = `calc(-${tHeight}px - 0.5rem)`;
        }
      }}
      className="group/tooltip relative inline-block"
    >
      {tooltip && direction === 'top' ? (
        <div
          ref={tooltipRef}
          className={`${className} pointer-events-none absolute z-[999] mx-auto min-w-32 bg-primary px-3 py-2 text-center font-light text-white opacity-0 shadow-button transition-all duration-300 ease-in-out before:absolute before:-bottom-1 before:left-0 before:right-0 before:z-[-1] before:mx-auto before:h-4 before:w-4 before:rotate-45 before:bg-primary group-hover/tooltip:block group-hover/tooltip:opacity-100 group-hover/tooltip:delay-500`}
        >
          {tooltip}
        </div>
      ) : null}
      {children}
      {tooltip && direction === 'bottom' ? (
        <div
          ref={tooltipRef}
          className={`${className} pointer-events-none absolute z-[999] mx-auto min-w-32 bg-primary px-3 py-2 text-center text-[13px] font-light text-white opacity-0 shadow-button transition-all duration-300 ease-in-out before:absolute before:-top-1 before:left-0 before:right-0 before:z-[-1] before:mx-auto before:h-4 before:w-4 before:rotate-45 before:bg-primary group-hover/tooltip:block group-hover/tooltip:opacity-100 group-hover/tooltip:delay-500`}
        >
          {tooltip}
        </div>
      ) : null}
    </div>
  );
};

export default ToolTip;
