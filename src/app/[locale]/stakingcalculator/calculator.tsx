'use client';

import { FC, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { getStakingRates } from '@/actions/staking';
import { DropdownListItem } from '@/app/stakingcalculator/choose-dropdown';
import ChooseNetwork from '@/app/stakingcalculator/choose-network';
import ChooseValidator from '@/app/stakingcalculator/choose-validator';
import StakingResults from '@/app/stakingcalculator/staking-results';
import { ChainItem, StakingRates } from '@/types';
import Button from '@/components/common/button';
import RoundedButton from '@/components/common/rounded-button';
import { Node } from '@prisma/client';
import { useTranslations } from 'next-intl';

interface OwnProps {
  chainList: ChainItem[];
}

const Calculator: FC<OwnProps> = ({ chainList }) => {
  const t = useTranslations('CalculatorPage');
  const [chain, setChain] = useState<ChainItem | undefined>(undefined);
  const [validator, setValidator] = useState<string | undefined>(undefined);
  const [stakingRates, setStakingRates] = useState<StakingRates | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [validatorsList, setValidatorsList] = useState<DropdownListItem[] | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const r = await getStakingRates(chain?.id, validator);
      setStakingRates(r);
    })();
  }, [chain, validator]);

  const handleValidatorChange = (value?: string) => {
    setValidator(value?.toString() ?? '');
  };

  const handleResetDate = () => {
    setSelectedDate(new Date());
  };

  const iconSize = 'h-10 min-h-10 w-10 min-w-10'; 
  
  const handleChainChange = (chain?: ChainItem) => {
    if (!chain) return;
    setChain(chain);

    async function getValidatorsFromAPI() {
      try {
        const response = await fetch(`/api/nodes_by_chain_id?chainId=${chain?.id}`);
        const data = (await response.json()) as Node[];
        const dropdownList: DropdownListItem[] = data.map((node) => ({
          value: node.id,
          title: node.moniker,
        }));
        setValidatorsList(dropdownList);
      } catch (error) {
        console.error('Validators fetching error:', error);
      }
    }

    getValidatorsFromAPI();
  };

  return (
    <div>
      <div className="mt-4 flex flex-row space-x-12 text-lg">
        <div className="flex-[2]">
          <ChooseNetwork value={chain?.id} onChange={handleChainChange} chains={chainList} />
        </div>
        <div className="relative w-[37.5rem]">
          {stakingRates && <StakingResults values={stakingRates} chain={chain} />}
          <div className="mt-3 flex items-center justify-between border-b border-bgSt">
            <div className="flex items-center">
              <div className="border-r border-bgSt">
                <div className={`${iconSize} mx-6 my-2 bg-calendar bg-contain`} />
              </div>
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => {
                  if (date) {
                    setSelectedDate(date);
                  }
                }}
                dateFormat="dd/MM/yyyy"
                popperClassName="custom-popper"
                className="ml-3.5 cursor-pointer bg-background font-handjet text-lg hover:text-highlight focus:outline-none active:text-base" 
              />
            </div>
            <div
              onClick={handleResetDate}
              className={`${iconSize} cursor-pointer bg-reset bg-contain hover:bg-reset_h active:bg-reset_a`}
            />
          </div>
        </div>
        <div className="flex-[2] text-lg">
          {chain ? (
            validatorsList ? (
              <>
                <ChooseValidator
                  value={validator}
                  onChange={handleValidatorChange}
                  list={validatorsList}
                />
                {validator && (
                  <div className="flex flex-row justify-between">
                    <Button className="relative z-20 h-16 w-9">
                      <div className="min-h-8 min-w-8 bg-star bg-contain" />
                    </Button>
                    <div className="mt-4 flex flex-col items-end justify-end space-y-4">
                      <RoundedButton>Compare</RoundedButton>
                      <RoundedButton>Spread the world</RoundedButton>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="border-b border-bgSt pl-4 text-lg">{t('downloading validators')}</div>
            )
          ) : (
            <div className="border-b border-bgSt pl-4 text-lg">{t('please choose network')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
