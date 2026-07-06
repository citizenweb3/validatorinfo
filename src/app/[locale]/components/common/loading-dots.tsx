import { FC } from 'react';

import { cn } from '@/utils/cn';

interface OwnProps {
  className?: string;
  dotClassName?: string;
}

// Three bouncing dots — the app's shared loading indicator (same visual as the AI chat
// "thinking" state). Override dotClassName to resize for a given context.
const LoadingDots: FC<OwnProps> = ({ className, dotClassName = 'h-4 w-4 bg-gray-400 sm:h-3 sm:w-3 md:h-1 md:w-1' }) => (
  <span className={cn('inline-flex gap-0.5', className)}>
    <span className={cn('animate-bounce rounded-full', dotClassName)} />
    <span className={cn('animate-bounce rounded-full [animation-delay:150ms]', dotClassName)} />
    <span className={cn('animate-bounce rounded-full [animation-delay:300ms]', dotClassName)} />
  </span>
);

export default LoadingDots;
