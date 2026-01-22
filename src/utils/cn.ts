import { twMerge } from 'tailwind-merge';

export const cn = (...classes: (string | undefined | null | false)[]) => {
  return twMerge(classes.filter(Boolean).join(' '));
};
