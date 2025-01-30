'use client';

import { FC } from 'react';

import TriangleButton from '@/components/common/triangle-button';

interface OwnProps {}

const Letter: FC<{ letter: string }> = ({ letter }) => (
  <div className="cursor-pointer border-b border-primary px-2 pb-px font-handjet text-lg hover:border-highlight hover:text-highlight">
    {letter}
  </div>
);

const Letters: FC<OwnProps> = () => {
  return (
    <div className="mt-6 flex items-center space-x-1">
      <div>
        <TriangleButton direction="l" />
      </div>
      <Letter letter="A" />
      <Letter letter="B" />
      <Letter letter="C" />
      <Letter letter="D" />
      <Letter letter="E" />
      <Letter letter="F" />
      <Letter letter="G" />
      <Letter letter="H" />
      <Letter letter="I" />
      <Letter letter="J" />
      <Letter letter="K" />
      <Letter letter="L" />
      <Letter letter="M" />
      <Letter letter="N" />
      <Letter letter="O" />
      <Letter letter="P" />
      <Letter letter="Q" />
      <Letter letter="R" />
      <Letter letter="S" />
      <Letter letter="T" />
      <Letter letter="U" />
      <Letter letter="V" />
      <Letter letter="W" />
      <Letter letter="X" />
      <Letter letter="Y" />
      <Letter letter="Z" />
      <div>
        <TriangleButton direction="r" />
      </div>
      <Letter letter="All" />
    </div>
  );
};

export default Letters;
