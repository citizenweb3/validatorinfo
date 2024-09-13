'use client';

import { FC } from 'react';

interface OwnProps {}

const Player: FC<OwnProps> = () => {
  return (
    <iframe
      title="Citizen Web3"
      src="https://player.fireside.fm/v2/7d8ZfYhp/latest?theme=dark"
      width="740"
      height="200"
      className="absolute -left-[195px] -top-[50px] scale-50 bg-background"
    />
  );
};

export default Player;
