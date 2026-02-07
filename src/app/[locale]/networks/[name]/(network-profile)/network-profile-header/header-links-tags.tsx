'use client';

import Link from 'next/link';
import { FC, useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';
import PlusButton from '@/components/common/plus-button';

interface ChainLinks {
  twitterUrl: string;
  githubUrl: string;
  docs: string | null;
}

interface OwnProps {
  tags: string[];
  links: ChainLinks;
  translations: {
    links: string;
    tags: string;
  };
}

const getTagHref = (tag: string): string => {
  if (tag.endsWith(' Ecosystem')) {
    const ecosystemName = tag.replace(' Ecosystem', '').toLowerCase();
    return `/networks?p=1&ecosystems=${ecosystemName}`;
  }
  return '';
};

const HeaderLinksTags: FC<OwnProps> = ({ tags, links, translations }) => {
  const [isLinksOpen, setIsLinksOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);

  const chainLinks = [
    { label: 'Twitter', url: links.twitterUrl },
    { label: 'GitHub', url: links.githubUrl },
    ...(links.docs ? [{ label: 'Docs', url: links.docs }] : []),
  ].filter((l) => l.url);

  return (
    <div className="flex items-center gap-4 mt-2">
      <div className="relative flex items-center gap-2 rounded bg-card px-3 py-1">
        <span className="font-sfpro text-sm">{translations.links}</span>
        <PlusButton size="xs" isOpened={isLinksOpen} onClick={() => setIsLinksOpen(!isLinksOpen)} />
        <BaseModal
          opened={isLinksOpen}
          onClose={() => setIsLinksOpen(false)}
          isRelative
          hideClose
          className="left-0 top-8 min-w-40"
        >
          <div className="flex flex-col gap-2">
            {chainLinks.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sfpro text-sm text-highlight hover:text-white"
              >
                {link.label}
              </a>
            ))}
            {chainLinks.length === 0 && (
              <span className="font-sfpro text-sm text-gray-500">No links available</span>
            )}
          </div>
        </BaseModal>
      </div>

      <div className="relative flex items-center gap-2 rounded bg-card px-3 py-1">
        <span className="font-sfpro text-sm">{translations.tags}</span>
        <PlusButton size="xs" isOpened={isTagsOpen} onClick={() => setIsTagsOpen(!isTagsOpen)} />
        <BaseModal
          opened={isTagsOpen}
          onClose={() => setIsTagsOpen(false)}
          isRelative
          hideClose
          className="left-0 top-8 min-w-48"
        >
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link key={tag} href={getTagHref(tag)}>
                <div className="inline-flex items-center whitespace-nowrap rounded-full bg-primary px-4 py-1 font-handjet text-sm shadow-button hover:text-highlight active:scale-90">
                  {tag}
                </div>
              </Link>
            ))}
            {tags.length === 0 && (
              <span className="font-sfpro text-sm text-gray-500">No tags</span>
            )}
          </div>
        </BaseModal>
      </div>
    </div>
  );
};

export default HeaderLinksTags;
