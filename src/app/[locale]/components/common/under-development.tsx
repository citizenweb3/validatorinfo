import { FC } from 'react';

import { cn } from '@/utils/cn';

interface UnderDevelopmentProps {
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'h-[200px]',
  md: 'h-[300px]',
  lg: 'h-[400px]',
};

const UnderDevelopment: FC<UnderDevelopmentProps> = ({ title, description, size = 'md', className }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded border border-[#3E3E3E] bg-[#181818]',
        sizeStyles[size],
        className
      )}
    >
      <div className="max-w-[80%] text-center">
        <p className="font-sfpro text-base text-white/70">{title}</p>
        {description && <p className="mt-2 font-sfpro text-sm text-white/50">{description}</p>}
      </div>
    </div>
  );
};

export default UnderDevelopment;
