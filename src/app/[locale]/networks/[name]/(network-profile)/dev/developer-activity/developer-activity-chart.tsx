'use client';

import { FC, useEffect, useMemo, useRef, useState } from 'react';

import { DailyActivity } from '@/services/github-service';

interface OwnProps {
  activityData: DailyActivity[];
  startWeekOn?: number;
}

const DeveloperActivityChart: FC<OwnProps> = ({ activityData, startWeekOn = 1 }) => {
  const DAYS_IN_WEEK = 7;
  const squareSize = 24;
  const squareGap = 3;
  const leftPadding = 0;
  const topPadding = 10;

  const chartRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    function updateWidth() {
      if (chartRef.current) setContainerWidth(chartRef.current.offsetWidth);
    }

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const groupIntoWeekColumns = (data: DailyActivity[], startWeekDay: number, columns: number) => {
    const sorted = [...data].sort((a, b) => +a.date - +b.date);
    let firstDate = sorted[0]?.date;
    if (!firstDate) return [];
    let offset = (firstDate.getDay() - startWeekDay + DAYS_IN_WEEK) % DAYS_IN_WEEK;
    let current = new Date(firstDate);
    current.setDate(current.getDate() - offset);
    const allDays: (DailyActivity | null)[] = [];
    const lastDate = sorted[sorted.length - 1].date;

    while (current <= lastDate) {
      const found = sorted.find(
        (d) =>
          d.date.getFullYear() === current.getFullYear() &&
          d.date.getMonth() === current.getMonth() &&
          d.date.getDate() === current.getDate(),
      );
      allDays.push(found ? found : null);
      current = new Date(current);
      current.setDate(current.getDate() + 1);
    }
    const totalColumns = Math.floor((containerWidth - leftPadding - 10) / (squareSize + squareGap)) || 1;
    const colsToShow = columns || totalColumns;
    const pad = (DAYS_IN_WEEK - (allDays.length % DAYS_IN_WEEK)) % DAYS_IN_WEEK;
    for (let i = 0; i < pad; i++) allDays.push(null);
    const weekColumns: (DailyActivity | null)[][] = [];
    for (let i = 0; i < allDays.length; i += DAYS_IN_WEEK) {
      weekColumns.push(allDays.slice(i, i + DAYS_IN_WEEK));
    }
    return weekColumns.slice(-colsToShow);
  };

  const visibleColumns = useMemo(() => {
    if (!containerWidth) return 1;
    return Math.floor((containerWidth - leftPadding - 10) / (squareSize + squareGap)) || 1;
  }, [containerWidth]);

  const weekColumns = useMemo(
    () => groupIntoWeekColumns(activityData, startWeekOn, visibleColumns),
    [activityData, startWeekOn, containerWidth, visibleColumns],
  );

  const getColor = (level: number | undefined): string => {
    switch (level) {
      case 0:
        return '#2d2d2d';
      case 1:
        return '#0e4429';
      case 2:
        return '#006d32';
      case 3:
        return '#26a641';
      case 4:
        return '#39d353';
      default:
        return '#2d2d2d';
    }
  };

  const svgHeight = DAYS_IN_WEEK * (squareSize + squareGap) + topPadding + 20;
  const totalWidth = leftPadding + weekColumns.length * (squareSize + squareGap) + 10;

  return (
    <div ref={chartRef} className="w-full">
      <svg
        width={totalWidth}
        height={svgHeight}
        style={{ display: 'block', maxWidth: '100%' }}
        className="github-activity-chart"
      >
        <defs>
          <style>
            {`
              .hover-rect:hover {
                filter: brightness(1.3);
                cursor: pointer;
                transition: filter 0.2s ease;
              }
            `}
          </style>
        </defs>
        <g transform={`translate(${leftPadding}, ${topPadding})`}>
          {weekColumns.map((col, colIdx) =>
            col.map((cell, rowIdx) => (
              <rect
                key={`${colIdx}-${rowIdx}`}
                x={colIdx * (squareSize + squareGap)}
                y={rowIdx * (squareSize + squareGap)}
                width={squareSize}
                height={squareSize}
                rx={2}
                fill={getColor(cell?.level)}
                className="hover-rect"
              >
                <title>{cell ? `${cell.date.toISOString().split('T')[0]}: ${cell.commits} commits` : ''}</title>
              </rect>
            )),
          )}
        </g>
      </svg>
    </div>
  );
};

export default DeveloperActivityChart;
