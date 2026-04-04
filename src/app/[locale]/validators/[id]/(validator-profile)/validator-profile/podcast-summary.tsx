'use client';

import { FC, useState } from 'react';
import { useTranslations } from 'next-intl';

import BaseModal from '@/components/common/modal/base-modal';
import RoundedButton from '@/components/common/rounded-button';

interface OwnProps {
  summary: string;
  episodeTitle: string;
  episodeUrl: string;
}

const PodcastSummary: FC<OwnProps> = ({ summary, episodeTitle, episodeUrl }) => {
  const t = useTranslations('ValidatorProfileHeader');
  const [open, setOpen] = useState(false);

  return (
    <>
      <RoundedButton
        onClick={() => setOpen(true)}
        contentClassName="font-handjet text-sm px-5 pt-0 pb-0"
        className="mb-4 active:mb-3"
      >
        {t('Podcast Summary')}
      </RoundedButton>

      <BaseModal
        opened={open}
        onClose={() => setOpen(false)}
        className="left-1/2 top-1/2 w-[min(90vw,48rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl p-0"
        maxHeight="max-h-[80vh]"
        title={episodeTitle}
        copyText={summary}
      >
        <div className="mx-8 my-6">
          <p className="whitespace-pre-wrap break-words text-sm">{summary}</p>
          <a
            href={episodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm text-highlight underline hover:opacity-80"
          >
            {t('Listen to episode')}
          </a>
        </div>
      </BaseModal>
    </>
  );
};

export default PodcastSummary;
