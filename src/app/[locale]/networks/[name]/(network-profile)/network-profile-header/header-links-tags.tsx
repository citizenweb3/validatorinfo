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
    { label: 'Website', url: links.docs, iconClass: 'bg-web group-hover/link:bg-web_h' },
    { label: 'Twitter', url: links.twitterUrl, iconClass: 'bg-x group-hover/link:bg-x_h' },
    { label: 'GitHub', url: links.githubUrl, iconClass: 'bg-github group-hover/link:bg-github_h' },
  ].filter((l) => l.url);

  return (
    <div className="flex items-center gap-4 mt-2">
      <div className="relative flex items-center gap-2 rounded bg-card px-3 py-1">
        <span className="font-sfpro text-sm">{translations.links}</span>
        <div>
          <PlusButton size="xs" isOpened={isLinksOpen} onClick={() => setIsLinksOpen(!isLinksOpen)} />
          <BaseModal
            opened={isLinksOpen}
            onClose={() => setIsLinksOpen(false)}
            isRelative
            hideClose
            className="left-0 top-8 min-w-40"
          >
            <div className="flex flex-wrap gap-2">
              {chainLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link"
                >
                  <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-primary px-4 py-1 font-handjet text-sm shadow-button group-hover/link:text-highlight active:scale-90">
                    <div className={`h-7 w-7 shrink-0 ${link.iconClass} bg-contain bg-center bg-no-repeat`} />
                    {link.label}
                  </div>
                </a>
              ))}
              {chainLinks.length === 0 && (
                <span className="font-sfpro text-sm text-gray-500">No links available</span>
              )}
            </div>
          </BaseModal>
        </div>
      </div>

      <div className="relative flex items-center gap-2 rounded bg-card px-3 py-1">
        <span className="font-sfpro text-sm">{translations.tags}</span>
        <div>
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
    </div>
  );
};

export default HeaderLinksTags;
