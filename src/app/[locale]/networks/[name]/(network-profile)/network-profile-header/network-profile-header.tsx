import { Node } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import ChainDescription from '@/app/networks/[name]/(network-profile)/network-profile-header/chain-description';
import HeaderLinksTags from '@/app/networks/[name]/(network-profile)/network-profile-header/header-links-tags';
import MetricsHeader from '@/app/networks/[name]/(network-profile)/network-profile-header/metrics-header';
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

  const iconBtnClass =
    'group/btn relative flex h-10 w-10 items-center justify-center bg-gradient-to-t from-[#181818] from-[26%] to-[rgba(62,62,62,0.3)] border-r border-t border-bgSt shadow-[0px_6px_6px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_black] hover:bg-bgHover active:translate-y-1 active:bg-background active:shadow-none cursor-pointer active:border-0';
  const centerLogoSizes =
    'sm:w-[60px] sm:h-[60px] md:w-[80px] md:h-[80px] lg:w-[100px] lg:h-[100px] xl:w-[120px] xl:h-[120px] 2xl:w-[124px] 2xl:h-[124px]';

  return (
    <div className="mb-5 mt-4 rounded border-b border-bgSt bg-table_row p-6">
      <div className="grid grid-cols-4 items-start gap-4">
        <div className="col-span-1 flex flex-col gap-4">
          <div className="font-sfpro text-base">
            <ChainDescription
              shortDescription={chain?.shortDescription ?? ''}
              description={chain?.description ?? null}
              readMoreLabel={t('read more')}
            />
          </div>

          <HeaderLinksTags
            tags={chain?.tags ?? []}
            links={{
              twitterUrl: chain?.twitterUrl ?? '',
              githubUrl: chain?.githubUrl ?? '',
              docs: chain?.docs ?? null,
            }}
            translations={{
              links: t('Links'),
              tags: t('Tags'),
            }}
          />

          <div className="flex gap-6 mt-3">
            {validators?.length != 0 && (
              <Tooltip tooltip={t('Validators')} direction="top">
                <Link href={`/networks/${chainName}/validators`}>
                  <div className={iconBtnClass}>
                    <Image src={icons.ValidatorsIcon} alt={t('Validators')} width={40} height={40}
                           className="group-hover/btn:hidden" />
                    <Image src={icons.ValidatorsIconHovered} alt={t('Validators')} width={40} height={40}
                           className="hidden group-hover/btn:block" />
                  </div>
                </Link>
              </Tooltip>
            )}
            <Tooltip tooltip={t('Nodes')} direction="top">
              <Link href={`/networks/${chainName}/nodes`}>
                <div className={iconBtnClass}>
                  <Image src={icons.NodesIcon} alt={t('Nodes')} width={40} height={40}
                         className="group-hover/btn:hidden" />
                  <Image src={icons.NodesIconHovered} alt={t('Nodes')} width={40} height={40}
                         className="hidden group-hover/btn:block" />
                </div>
              </Link>
            </Tooltip>
            <Tooltip tooltip={t('Transactions')} direction="top">
              <Link href={`/networks/${chainName}/tx`}>
                <div className={iconBtnClass}>
                  <Image src={icons.TxSummary} alt={t('Transactions')} width={40} height={40}
                         className="group-hover/btn:hidden" />
                  <Image src={icons.TxSummaryHovered} alt={t('Transactions')} width={40} height={40}
                         className="hidden group-hover/btn:block" />
                </div>
              </Link>
            </Tooltip>
          </div>

          <div className="flex gap-6">
            <Tooltip tooltip={t('distribution tooltip')} direction="top">
              <div className={iconBtnClass}>
                <Image src={icons.NetworkDistribution} alt={t('distribution tooltip')} width={40} height={40}
                       className="group-hover/btn:hidden" />
                <Image src={icons.NetworkDistributionHovered} alt={t('distribution tooltip')} width={40} height={40}
                       className="hidden group-hover/btn:block" />
              </div>
            </Tooltip>
            <Tooltip tooltip={t('Blocks')} direction="top">
              <Link href={`/networks/${chainName}/blocks`}>
                <div className={iconBtnClass}>
                  <Image src={icons.NetworkBlocks} alt={t('Blocks')} width={40} height={40}
                         className="group-hover/btn:hidden" />
                  <Image src={icons.NetworkBlocksHovered} alt={t('Blocks')} width={40} height={40}
                         className="hidden group-hover/btn:block" />
                </div>
              </Link>
            </Tooltip>
            <Tooltip tooltip={t('Apps')} direction="top">
              <div className={iconBtnClass}>
                <Image src={icons.NetworkApps} alt={t('Apps')} width={40} height={40}
                       className="group-hover/btn:hidden" />
                <Image src={icons.NetworkAppsHovered} alt={t('Apps')} width={40} height={40}
                       className="hidden group-hover/btn:block" />
              </div>
            </Tooltip>
            <div className={iconBtnClass}>
              <Image src={icons.NetworkSupply} alt="" width={40} height={40} className="group-hover/btn:hidden" />
              <Image src={icons.NetworkSupplyHovered} alt="" width={40} height={40}
                     className="hidden group-hover/btn:block" />
            </div>
          </div>
        </div>

        <div className="col-span-2 flex flex-col items-center justify-center self-center">
          <div className={`${centerLogoSizes} relative inline-block hover:scale-105`}>
            <Image src={chainLogo} alt="Chain Logo" fill className="rounded-full object-contain shadow-button" />
            <div
              className="group/planet absolute bottom-[-40%] left-[-40%] flex h-[95%] w-[95%] cursor-pointer items-center justify-center">
              <Image src={icons.NetworkProfilePlanet} alt="Planet" width={200} height={200}
                     className="group-hover/planet:hidden group-active/planet:hidden" />
              <Image src={icons.NetworkProfilePlanetHovered} alt="Planet" width={200} height={200}
                     className="hidden group-hover/planet:block group-active/planet:hidden" />
              <Image src={icons.NetworkProfilePlanetActive} alt="Planet" width={200} height={200}
                     className="hidden group-active/planet:block" />
            </div>
            <div
              className="absolute bottom-[-30%] right-[-35%] flex h-[80%] w-[80%] flex-col items-center hover:text-highlight">
              <div className="relative h-full w-full">
                <Tooltip tooltip={t('temperature tooltip')} direction="top">
                  <Thermometer percent={chainHealth} />
                </Tooltip>
              </div>
              <div className="block w-full text-center font-handjet text-lg leading-none">{chainHealth}%</div>
            </div>
          </div>
        </div>

        <div className="col-span-1 flex flex-col justify-end ml-10">
          <MetricsHeader chain={chain} />
        </div>
      </div>
    </div>
  );
};

export default NetworkProfileHeader;
