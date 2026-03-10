import { FC } from 'react';

import { cn } from '@/utils/cn';

type HealthStatus = 'excellent' | 'good' | 'at-risk' | 'inactive';

interface OwnProps {
  uptime: number | null;
  isActive: boolean;
  label: {
    excellent: string;
    good: string;
    atRisk: string;
    inactive: string;
  };
}

const getHealthStatus = (uptime: number | null, isActive: boolean): HealthStatus => {
  if (!isActive) return 'inactive';
  if (uptime === null) return 'inactive';
  if (uptime > 99.5) return 'excellent';
  if (uptime >= 95) return 'good';
  return 'at-risk';
};

const statusConfig: Record<HealthStatus, { dotColor: string; textColor: string }> = {
  excellent: { dotColor: 'bg-secondary', textColor: 'text-secondary' },
  good: { dotColor: 'bg-dottedLine', textColor: 'text-dottedLine' },
  'at-risk': { dotColor: 'bg-red', textColor: 'text-red' },
  inactive: { dotColor: 'bg-primary', textColor: 'text-primary' },
};

const ValidatorHealthBadge: FC<OwnProps> = ({ uptime, isActive, label }) => {
  const status = getHealthStatus(uptime, isActive);
  const config = statusConfig[status];

  const labelMap: Record<HealthStatus, string> = {
    excellent: label.excellent,
    good: label.good,
    'at-risk': label.atRisk,
    inactive: label.inactive,
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('inline-block h-2 w-2 rounded-full', config.dotColor)} />
      <span className={cn('text-xs font-handjet', config.textColor)}>{labelMap[status]}</span>
    </div>
  );
};

export default ValidatorHealthBadge;
