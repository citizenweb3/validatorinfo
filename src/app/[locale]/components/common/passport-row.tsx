import { FC, ReactNode } from 'react';

// Shared value-signal palette for passport rows: green (healthy), yellow (moderate), red (risk).
// One source of truth so the network-health panel and the pool metrics tab never drift.
export const signalColors = {
  red: '#EB1616',
  yellow: '#E5C46B',
  green: '#4FB848',
} as const;

interface OwnProps {
  label: string;
  value: ReactNode;
  color?: string;
}

// The canonical label/value "passport row": 1/3 label (font-sfpro) + 2/3 value (font-handjet),
// signal colour applied to the value text only. Shared across metric tables so they render
// identically everywhere.
const PassportRow: FC<OwnProps> = ({ label, value, color }) => (
  <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover">
    <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">{label}</div>
    <div
      className="flex w-2/3 items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg"
      style={color ? { color } : undefined}
    >
      {value}
    </div>
  </div>
);

export default PassportRow;
