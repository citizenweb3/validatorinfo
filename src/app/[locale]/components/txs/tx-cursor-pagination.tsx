'use client';

import { FC } from 'react';

import TriangleButton from '@/components/common/triangle-button';
import { cn } from '@/utils/cn';

interface OwnProps {
  current: number; // 1-based, session-relative (landed window = 1)
  loadedWindows: number;
  hasMore: boolean;
  onSelect: (page: number) => void;
  onPrev: () => void;
  onNext: () => void;
  prevLabel?: string;
  nextLabel?: string;
}

type Item = { kind: 'num'; n: number } | { kind: 'ellipsis'; id: string };

// Cursor pagination control. Visually mirrors TablePagination's `hideLastPage` mode used on the
// big-data txs/blocks tables — `< 1 … 6 [7] 8 … >` — but driven by client state, not URL page
// numbers, and with NO last-page number (no COUNT). Numbers are session-relative loaded windows.
const TxCursorPagination: FC<OwnProps> = ({
  current,
  loadedWindows,
  hasMore,
  onSelect,
  onPrev,
  onNext,
  prevLabel = 'Previous',
  nextLabel = 'Next',
}) => {
  const hasPrev = current > 1;
  const hasNext = current < loadedWindows || hasMore;

  if (!hasPrev && !hasNext) {
    return <div className="h-8" />;
  }

  const items: Item[] = [];
  if (current > 1) items.push({ kind: 'num', n: 1 });
  if (current >= 3) {
    items.push({ kind: 'ellipsis', id: 'lead' });
    items.push({ kind: 'num', n: current - 1 });
  }
  items.push({ kind: 'num', n: current });
  if (current < loadedWindows) items.push({ kind: 'num', n: current + 1 });
  if (current + 1 < loadedWindows || hasMore) items.push({ kind: 'ellipsis', id: 'trail' });

  return (
    <div className="flex flex-row items-center justify-end space-x-2">
      {hasPrev && (
        <button type="button" onClick={onPrev} aria-label={prevLabel} className="group flex items-center">
          <TriangleButton direction="l" />
        </button>
      )}
      {items.map((item) =>
        item.kind === 'ellipsis' ? (
          <div key={item.id} className="border-b border-bgSt px-2 font-handjet text-base">
            …
          </div>
        ) : (
          <button
            type="button"
            key={item.n}
            onClick={() => item.n !== current && onSelect(item.n)}
            className={cn(
              'border-b px-2 font-handjet text-base',
              item.n === current ? 'border-highlight text-highlight' : 'border-bgSt hover:text-highlight',
            )}
          >
            {item.n}
          </button>
        ),
      )}
      {hasNext && (
        <button type="button" onClick={onNext} aria-label={nextLabel} className="group flex items-center">
          <TriangleButton direction="r" />
        </button>
      )}
    </div>
  );
};

export default TxCursorPagination;
