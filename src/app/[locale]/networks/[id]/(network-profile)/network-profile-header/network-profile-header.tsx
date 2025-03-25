import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { FC } from 'react';

import MetricsHeader from '@/app/networks/[id]/(network-profile)/network-profile-header/metrics-header';
import PlusButton from '@/components/common/plus-button';
import RoundedButton from '@/components/common/rounded-button';
import Tooltip from '@/components/common/tooltip';
import icons from '@/components/icons';
import chainService from '@/services/chain-service';

interface OwnProps {
  id: string;
  locale: string;
}

const NetworkProfileHeader: FC<OwnProps> = async ({ id, locale }) => {
  const t = await getTranslations({ locale, namespace: 'NetworkProfileHeader' });
  const chainId = parseInt(id);
  const chain = await chainService.getById(chainId);
  const chainLogo = chain?.logoUrl ?? icons.AvatarIcon;

  const iconsSize = 'h-24 min-h-24 w-24 min-w-24 bg-contain bg-no-repeat';
  const centerLogoSizes = 'sm:w-[60px] sm:h-[60px] md:w-[80px] md:h-[80px] lg:w-[100px] lg:h-[100px] xl:w-[120px] xl:h-[120px] 2xl:w-[124px] 2xl:h-[124px]';

  return (
    <div className="mb-7 mt-4 grid grid-cols-5 items-start">
      <div className="col-span-1 h-full border-b border-bgSt flex flex-col">
        <div>
          <div className="font-sfpro text-base mb-2">
            <h2>{t('description')}</h2>
          </div>
          <div className="flex items-center">
            <div className="h-10 min-h-10 w-10 min-w-10 bg-web bg-contain bg-no-repeat" />
            <p className="text-xs">{t('Others Links')}</p>
            <PlusButton size="xs" isOpened={false} />
          </div>
          <div className="mt-4 mb-4 grid grid-cols-[repeat(2,auto)] gap-x-2 gap-y-4 font-handjet text-lg text-center">
            <div className="whitespace-nowrap rounded-full bg-primary shadow-button">DeFi</div>
            <div className="whitespace-nowrap rounded-full bg-primary shadow-button">Cosmos Ecosystem</div>
            <div className="whitespace-nowrap rounded-full bg-primary shadow-button">L1</div>
          </div>
        </div>
        <div className="flex mt-auto">
          <RoundedButton href={`/networks/${id}/validators`} className="font-handjet text-lg mb-3 active:mb-2">
            {t('Show Validators')}
          </RoundedButton>
        </div>
      </div>
      <div className="col-span-3 flex flex-col items-center justify-center">
        <div className={`${centerLogoSizes} relative inline-block`}>
          <Image src={chainLogo} alt="Chain Logo" fill className="rounded-full object-contain shadow-button" />
          <div
            className="absolute bottom-[-30%] right-[-30%] flex h-[80%] w-[80%] flex-col items-center hover:text-highlight">
            <div className="relative h-full w-full">
              <Tooltip tooltip={t('temperature tooltip')} direction={'top'}>
                <Image src={icons.Thermometer} alt="Thermometer" fill className="object-contain" />
              </Tooltip>
            </div>
            <div className="block w-full text-center font-handjet text-lg leading-none">30%</div>
          </div>
        </div>
        <MetricsHeader chain={chain} />
      </div>
      <div className="col-span-1 flex h-full flex-col items-end justify-end border-b border-bgSt">
        <div className="flex items-center mb-4">
          <Tooltip tooltip={t('rich list tooltip')} direction={'top'}>
            <div className={`${iconsSize} bg-rich_list hover:bg-rich_list_h mx-2`} />
          </Tooltip>
          <Tooltip tooltip={t('distribution tooltip')} direction={'top'}>
            <div className={`${iconsSize} bg-distribution hover:bg-distribution_h mx-2`} />
          </Tooltip>
        </div>
        <RoundedButton href={`/networks/${id}/tx`} className="font-handjet text-lg mb-3 active:mb-2">
          {t('Show Transactions')}
        </RoundedButton>
      </div>
    </div>
  );
};

export default NetworkProfileHeader;
