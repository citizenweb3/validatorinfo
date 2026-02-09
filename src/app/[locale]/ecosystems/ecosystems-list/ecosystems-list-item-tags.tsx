'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC } from 'react';

interface OwnProps {
  tags: string[];
}

const EcosystemListItemTags: FC<OwnProps> = ({ tags }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentTags = params.getAll('tags');

    if (currentTags.includes(tag)) {
      params.delete('tags');
      currentTags.filter((t) => t !== tag).forEach((t) => params.append('tags', t));
    } else {
      params.append('tags', tag);
    }

    params.set('p', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-row flex-wrap justify-center gap-1">
      {tags.map((tag) => (
        <div
          key={tag}
          onClick={() => handleTagClick(tag)}
          className="rounded-full bg-primary shadow-button px-3 py-0.5 text-sm hover:text-highlight cursor-pointer active:scale-95 transition-transform whitespace-nowrap"
        >
          {tag}
        </div>
      ))}
    </div>
  );
};

export default EcosystemListItemTags;
