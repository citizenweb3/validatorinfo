'use client';

import { FC, useEffect, useRef, useState } from 'react';

interface OwnProps {}

const Player: FC<OwnProps> = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    // trying to set optimal height for iframe to avoid white line at the bottom of player
    const resizeHandler = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (rect?.width) {
        let h: number;

        if (rect.width <= 305) h = 104;
        else if (rect.width <= 480) h = 92;
        else if (rect.width <= 678) h = 118.5;
        else h = 200;

        setSize({ w: rect.width, h });
      }
    };
    window.addEventListener('resize', resizeHandler, false);
    resizeHandler();

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [ref]);

  return (
    <div ref={ref} className="mt-8 w-full">
      <iframe
        title="Citizen Web3"
        src="https://player.fireside.fm/v2/7d8ZfYhp/latest?theme=dark"
        width={size.w}
        height={size.h}
        className="bg-background"
      />
    </div>
  );
};

export default Player;
