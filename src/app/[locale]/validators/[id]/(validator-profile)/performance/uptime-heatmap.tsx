'use client';

import { useTranslations } from 'next-intl';
import { FC, useState, useCallback, useRef, useEffect } from 'react';

interface DayData {
  date: string;
  uptime: number | null;
  missedBlocks: number;
}

interface OwnProps {
  data: DayData[];
}

const UptimeHeatmap: FC<OwnProps> = ({ data }) => {
  const t = useTranslations('ValidatorPerformance');
  const [tooltip, setTooltip] = useState<{ day: DayData; x: number; y: number } | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const cellRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    const cell = cellRefs.current.get(focusedIndex);
    if (cell && document.activeElement !== cell && cell.closest('[role="grid"]')?.contains(document.activeElement)) {
      cell.focus();
    }
  }, [focusedIndex]);

  const UPTIME_THRESHOLDS = { excellent: 99, good: 95, fair: 90 } as const;

  const uptimeColors: Record<string, string> = {
    excellent: 'bg-secondary',
    good: 'bg-dottedLine',
    fair: 'bg-oldPalette-yellow',
    poor: 'bg-red',
    none: 'bg-table_header',
  };

  const getUptimeLevel = (uptime: number | null): string => {
    if (uptime === null) return 'none';
    if (uptime >= UPTIME_THRESHOLDS.excellent) return 'excellent';
    if (uptime >= UPTIME_THRESHOLDS.good) return 'good';
    if (uptime >= UPTIME_THRESHOLDS.fair) return 'fair';
    return 'poor';
  };

  const weeks: DayData[][] = Array.from(
    { length: Math.ceil(data.length / 7) },
    (_, i) => data.slice(i * 7, i * 7 + 7),
  );

  const gridRef = useRef<HTMLDivElement>(null);

  const TOOLTIP_HEIGHT = 60;

  const handleTooltipShow = useCallback((day: DayData, element: HTMLElement) => {
    const gridRect = gridRef.current?.getBoundingClientRect();
    const cellRect = element.getBoundingClientRect();
    if (!gridRect) return;
    const relativeX = cellRect.left - gridRect.left + cellRect.width / 2;
    const relativeY = cellRect.top - gridRect.top;
    const showBelow = relativeY < TOOLTIP_HEIGHT;
    setTooltip({
      day,
      x: relativeX,
      y: showBelow ? relativeY + cellRect.height + 8 : relativeY - TOOLTIP_HEIGHT,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' && index < data.length - 1) {
      setFocusedIndex(index + 1);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setFocusedIndex(index - 1);
    } else if (e.key === 'ArrowDown' && index + 7 < data.length) {
      setFocusedIndex(index + 7);
    } else if (e.key === 'ArrowUp' && index - 7 >= 0) {
      setFocusedIndex(index - 7);
    }
  }, [data.length]);

  return (
    <div className="relative">
      <div ref={gridRef} className="flex gap-1" role="grid" aria-label={t('uptime heatmap')}>
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1" role="row">
            {week.map((day, dayIdx) => {
              const globalIndex = weekIdx * 7 + dayIdx;
              const level = getUptimeLevel(day.uptime);
              return (
                <div
                  key={day.date}
                  ref={(el) => { if (el) cellRefs.current.set(globalIndex, el); else cellRefs.current.delete(globalIndex); }}
                  role="gridcell"
                  aria-label={`${day.date}: ${day.uptime !== null ? `${day.uptime.toFixed(1)}%` : t('no data')}`}
                  tabIndex={focusedIndex === globalIndex ? 0 : -1}
                  className={`h-3 w-3 cursor-pointer rounded-sm ${uptimeColors[level]} transition-opacity hover:opacity-80 focus:outline-none focus:ring-1 focus:ring-highlight sm:h-4 sm:w-4`}
                  onMouseEnter={(e) => handleTooltipShow(day, e.currentTarget)}
                  onMouseLeave={handleMouseLeave}
                  onFocus={(e) => handleTooltipShow(day, e.currentTarget)}
                  onBlur={handleMouseLeave}
                  onKeyDown={(e) => handleKeyDown(e, globalIndex)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-[999] min-w-32 bg-primary px-3 py-2 text-center font-sfpro text-sm text-white shadow-button"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translateX(-50%)' }}
        >
          <div className="font-handjet text-highlight">{tooltip.day.date}</div>
          <div>
            {t('uptime')}: {tooltip.day.uptime !== null ? `${tooltip.day.uptime.toFixed(2)}%` : t('no data')}
          </div>
          <div>
            {t('missed blocks')}: {tooltip.day.missedBlocks}
          </div>
          <div className="text-xs">
            {t(getUptimeLevel(tooltip.day.uptime) === 'none' ? 'no data' : getUptimeLevel(tooltip.day.uptime))}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs" aria-label={t('legend')}>
        <span>{t('less')}</span>
        <div className="h-3 w-3 rounded-sm bg-red" aria-label={t('poor')} />
        <div className="h-3 w-3 rounded-sm bg-oldPalette-yellow" aria-label={t('fair')} />
        <div className="h-3 w-3 rounded-sm bg-dottedLine" aria-label={t('good')} />
        <div className="h-3 w-3 rounded-sm bg-secondary" aria-label={t('excellent')} />
        <span>{t('more')}</span>
        <div className="ml-2 h-3 w-3 rounded-sm bg-table_header" aria-label={t('no data')} />
        <span>{t('no data')}</span>
      </div>
    </div>
  );
};

export default UptimeHeatmap;
