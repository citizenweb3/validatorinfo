import { FC } from 'react';

import { cn } from '@/utils/cn';

interface OwnProps {
  text: string;
  className?: string;
}

const Description: FC<OwnProps> = ({ text, className = '' }) => {
  return <h2 className={cn('whitespace-pre-line text-lg', className)}>{text}</h2>;
};

export default Description;
