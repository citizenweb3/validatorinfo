'use client';

import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';

import RoundedButton from '@/components/common/rounded-button';
import Switch from '@/components/common/switch';
import TriangleButton from '@/components/common/triangle-button';

interface OwnProps {
  validator: string;
  isComparing: boolean;
  onCompare: () => void;
}

const ComparisonPanel: FC<OwnProps> = ({ validator, isComparing, onCompare }) => {
  const t = useTranslations('ComparisonPage');
  const [isToken, setIsToken] = useState<boolean>(false);

  return (
    <div className="mt-20 min-w-80 border-r border-t border-bgSt fill-black stroke-black p-px shadow-button">
      <div className="flex items-center justify-between border-b border-primary pb-5 pl-4 pr-2 pt-6">
        <div>Asset</div>
        <div>
          <TriangleButton direction="b" onClick={() => {}} />
        </div>
      </div>
      <div className="border-b border-primary pb-9 pt-6">
        <div className="flex h-5 flex-row items-center justify-end space-x-2 text-lg uppercase">
          <div className="border-b border-bgSt px-2 font-handjet">USD</div>
          <Switch value={isToken} onChange={(value) => setIsToken(value)} />
          <div className="border-b border-bgSt px-2 font-handjet">{t('Token')}</div>
        </div>
        <div className="relative mt-4">
          <div className="absolute left-2 top-2 font-handjet text-xl text-highlight">$</div>
          <input
            className="w-full bg-bgSt py-2 pl-5 pr-1 text-right font-handjet text-lg outline-white"
            defaultValue={1000}
            placeholder="1000"
            value={0}
            onChange={() => {}}
          />
        </div>
        <div className="mt-6 flex justify-center">
          <RoundedButton contentClassName="px-10 text-xl" onClick={onCompare}>
            {t('Compare')}
          </RoundedButton>
        </div>
      </div>
      <div className="space-y-2 p-5">
        <div className="mb-3 text-center text-highlight">
          {isComparing ? (
            <span>
              {validator} <span className="text-secondary">22%</span>
            </span>
          ) : (
            <span>&nbsp;</span>
          )}
        </div>
        <div>
          {t('Daily')}: {isComparing && <span className="ml-2 font-handjet">123</span>}
        </div>
        <div>
          {t('Weekly')}: {isComparing && <span className="ml-2 font-handjet">123</span>}
        </div>
        <div>
          {t('Monthly')}: {isComparing && <span className="ml-2 font-handjet">123</span>}
        </div>
      </div>
    </div>
  );
};

export default ComparisonPanel;
