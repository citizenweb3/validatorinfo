'use client';

import { FC } from 'react';
import { useTranslations } from 'next-intl';

interface ScoreBreakdown {
  uptime: number;
  governance: number;
  commission: number;
  slashHistory: number;
}

interface OwnProps {
  breakdown: ScoreBreakdown;
}

const getScoreColorClass = (score: number): string => {
  if (score >= 80) return 'text-secondary';
  if (score >= 60) return 'text-dottedLine';
  if (score >= 40) return 'text-oldPalette-yellow';
  return 'text-red';
};

const getScoreBgClass = (score: number): string => {
  if (score >= 80) return 'bg-secondary';
  if (score >= 60) return 'bg-dottedLine';
  if (score >= 40) return 'bg-oldPalette-yellow';
  return 'bg-red';
};

const getScoreStrokeClass = (score: number): string => {
  if (score >= 80) return 'stroke-secondary';
  if (score >= 60) return 'stroke-dottedLine';
  if (score >= 40) return 'stroke-oldPalette-yellow';
  return 'stroke-red';
};

const CircularProgress: FC<{ score: number; size?: number }> = ({ score, size = 120 }) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const strokeClass = getScoreStrokeClass(score);
  const textClass = getScoreColorClass(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${score}/100`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-table_header"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={strokeClass}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`font-handjet text-3xl ${textClass}`}>{score}</span>
        <span className="text-xs">/100</span>
      </div>
    </div>
  );
};

const WEIGHTS = {
  uptime: 0.4,
  governance: 0.3,
  commission: 0.2,
  slashHistory: 0.1,
};

const PerformanceScoreCard: FC<OwnProps> = ({ breakdown }) => {
  const t = useTranslations('ValidatorPerformance');

  const compositeScore = Math.round(
    breakdown.uptime * WEIGHTS.uptime +
    breakdown.governance * WEIGHTS.governance +
    breakdown.commission * WEIGHTS.commission +
    breakdown.slashHistory * WEIGHTS.slashHistory,
  );

  const factors = [
    { label: t('uptime'), weight: '40%', score: breakdown.uptime },
    { label: t('governance participation'), weight: '30%', score: breakdown.governance },
    { label: t('commission competitiveness'), weight: '20%', score: breakdown.commission },
    { label: t('slash history'), weight: '10%', score: breakdown.slashHistory },
  ];

  return (
    <div className="flex flex-col items-center gap-6">
      <CircularProgress score={compositeScore} />
      <div className="w-full max-w-md space-y-3">
        {factors.map((factor) => (
          <div key={factor.label} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-sm">
                <span>{factor.label}</span>
                <span className="font-handjet text-highlight">
                  {factor.score} <span className="text-xs text-primary">({factor.weight})</span>
                </span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-table_header"
                role="progressbar"
                aria-valuenow={factor.score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${factor.label}: ${factor.score}/100`}
              >
                <div
                  className={`h-full rounded-full transition-all ${getScoreBgClass(factor.score)}`}
                  style={{ width: `${factor.score}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceScoreCard;
