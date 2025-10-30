import { Node } from '@prisma/client';
import _ from 'lodash';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import ChainDescription from '@/app/networks/[name]/(network-profile)/network-profile-header/chain-description';
import MetricsHeader from '@/app/networks/[name]/(network-profile)/network-profile-header/metrics-header';
import PlusButton from '@/components/common/plus-button';
import RoundedButton from '@/components/common/rounded-button';
import Tooltip from '@/components/common/tooltip';
import { Thermometer } from '@/components/customSVG/temperatureSVG';
import icons from '@/components/icons';
import chainService from '@/services/chain-service';
import nodeService from '@/services/node-service';

interface OwnProps {
  chainName: string;
  locale: string;
}

const NetworkProfileHeader: FC<OwnProps> = async ({ chainName, locale }) => {
  const t = await getTranslations({ locale, namespace: 'NetworkProfileHeader' });
  const chain = await chainService.getByName(chainName);
  const chainLogo = chain?.logoUrl ?? icons.AvatarIcon;
  const chainHealth = 40;

  let validators: Node[] | null = [];
  if (chain?.id) validators = await nodeService.getNodesByChainId(chain?.id);

  const iconsSize = 'h-20 min-h-20 w-20 min-w-20 bg-contain bg-no-repeat';
  const centerLogoSizes =
    'sm:w-[60px] sm:h-[60px] md:w-[80px] md:h-[80px] lg:w-[100px] lg:h-[100px] xl:w-[120px] xl:h-[120px] 2xl:w-[124px] 2xl:h-[124px]';

  return (
    <div className="mb-7 mt-4 grid grid-cols-5 items-start">
      <div className="col-span-1 flex h-full flex-col justify-end gap-6 border-b border-bgSt px-2 pb-4">
        <div>
          <div className="mb-2 font-sfpro text-base">
            <ChainDescription text={chain?.description ?? ''} readMoreLabel={t('read more')} />
          </div>

          <div className="mb-3 flex items-center gap-2">
            <div className="h-10 min-h-10 w-10 min-w-10 bg-web bg-contain bg-no-repeat" />
            <p className="text-xs">{t('Others Links')}</p>
            <PlusButton size="xs" isOpened={false} />
          </div>

          <div className="mb-1 flex flex-wrap gap-x-4 gap-y-4 font-handjet text-lg">
            <Link href={``}>
              <div className="inline-flex items-center whitespace-nowrap rounded-full bg-primary px-5 shadow-button hover:text-highlight active:text-base">
                DeFi
              </div>
            </Link>
            <Link href={`/networks?p=1&ecosystems=${chain?.ecosystem}`}>
              <div className="inline-flex items-center whitespace-nowrap rounded-full bg-primary px-5 shadow-button hover:text-highlight active:text-base">
                {_.capitalize(chain?.ecosystem)} Ecosystem
              </div>
            </Link>
            <Link href={``}>
              <div className="inline-flex items-center whitespace-nowrap rounded-full bg-primary px-5 shadow-button hover:text-highlight active:text-base">
                L1
              </div>
            </Link>
            <Link href={``}>
              <div className="inline-flex items-center whitespace-nowrap rounded-full bg-primary px-5 shadow-button hover:text-highlight active:text-base">
                Tendermint
              </div>
            </Link>
          </div>
        </div>

        {validators?.length != 0 && (
          <RoundedButton
            href={`/networks/${chainName}/validators`}
            className="mb-2 font-handjet text-lg active:mb-1 w-full"
            contentClassName="px-16"
          >
            {t('Show Validators')}
          </RoundedButton>
        )}
        <RoundedButton
          href={`/nodes?p=1&ecosystems=${chain?.ecosystem}`}
          className="font-handjet text-lg w-full"
          contentClassName="px-20"
        >
          {t('Show Nodes')}
        </RoundedButton>
      </div>

      <div className="col-span-3 flex h-full flex-col items-center justify-center">
        <div className={`${centerLogoSizes} relative inline-block`}>
          <Image src={chainLogo} alt="Chain Logo" fill className="rounded-full object-contain shadow-button" />
          <div className="absolute bottom-[-30%] right-[-30%] flex h-[80%] w-[80%] flex-col items-center hover:text-highlight">
            <div className="relative h-full w-full">
              <Tooltip tooltip={t('temperature tooltip')} direction={'top'}>
                <Thermometer percent={chainHealth} />
              </Tooltip>
            </div>
            <div className="block w-full text-center font-handjet text-lg leading-none">{chainHealth}%</div>
          </div>
        </div>
        <div className="mt-auto flex w-full justify-end">
          <MetricsHeader chain={chain} />
        </div>
      </div>
      <div className="col-span-1 flex h-full flex-col items-end justify-end border-b border-bgSt">
        <RoundedButton
          href={`/networks/${chainName}/tx`}
          className="mb-3 font-handjet text-lg active:mb-2"
          contentClassName="px-16"
        >
          {t('Show Transactions')}
        </RoundedButton>
        <div className="mt-2 flex flex-row gap-4">
          <Tooltip tooltip={t('rich list tooltip')} direction={'top'}>
            <div className={`${iconsSize} bg-rich_list hover:bg-rich_list_h active:bg-rich_list_a`} />
          </Tooltip>
          <Tooltip tooltip={t('rich list tooltip')} direction={'top'}>
            <div className={`${iconsSize} bg-rich_list hover:bg-rich_list_h active:bg-rich_list_a`} />
          </Tooltip>
          <Tooltip tooltip={t('distribution tooltip')} direction={'top'}>
            <div className={`${iconsSize} bg-distribution hover:bg-distribution_h active:bg-distribution_a`} />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default NetworkProfileHeader;
