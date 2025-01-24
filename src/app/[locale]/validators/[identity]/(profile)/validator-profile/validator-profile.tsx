import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import NetworksCircle from '@/app/validators/[identity]/(profile)/validator-profile/validator-networks-circle';
import PlusButton from '@/components/common/plus-button';
import Tooltip from '@/components/common/tooltip';
import ValidatorService from '@/services/validator-service';
import icons from '@/components/icons';

interface OwnProps {
  identity: string;
  locale: string;
}

const ValidatorProfile: FC<OwnProps> = async ({ identity, locale }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorProfileHeader' });

  const validator = await ValidatorService.getValidatorByIdentity(identity);
  const validatorLogoUrl = validator?.url ?? icons.AvatarIcon;

  const { validatorNodesWithChainData } = await ValidatorService.getValidatorNodesWithChains(identity);
  const chainsLogos = validatorNodesWithChainData.map((chain) => chain?.logoUrl ?? icons.AvatarIcon);

  const iconsSize = 'h-10 min-h-10 w-10 min-w-10';

  return (
    <div className="mb-7 mt-4 grid grid-cols-7 items-start">
      <div className="col-span-2 max-w-xs border-b border-bgSt">
        <div className="font-sfpro text-base">
          <h2>{t('description')}</h2>
          <div className="relative my-4 h-[40px] w-full overflow-hidden md:h-[50px] lg:h-[60px] xl:h-[66px] 2xl:h-[86px]">
            <iframe
              src="https://player.fireside.fm/v2/7d8ZfYhp/latest?theme=dark"
              className="m-0 origin-top-left scale-[0.20] p-0 md:scale-[0.23] lg:scale-[0.28] xl:scale-[0.32] 2xl:scale-[0.43]"
              width="740"
              height="200"
            ></iframe>
          </div>
        </div>
        <div className="mb-2 flex items-center">
          <div className={`${iconsSize} bg-web bg-contain bg-no-repeat`} />
          <p className="text-xs">{t('Others Links')}</p>
          <PlusButton size="xs" isOpened={false} />
        </div>
      </div>
      <div className="col-span-3 h-full shadow-button">
        <NetworksCircle centerLogo={validatorLogoUrl} logos={chainsLogos} />
      </div>
      <div className="col-span-2 ml-24 h-full border-b border-bgSt">
        <h1>
          <span className="border-b border-bgSt px-2.5 text-xl text-highlight">{t('Merits')}</span>
        </h1>
        <div className="mt-7 flex items-center">
          <Tooltip noWrap tooltip={t('eco tooltip')} direction={'bottom'}>
            <div className={`${iconsSize} ml-2.5 bg-eco bg-contain bg-no-repeat hover:bg-eco_h`} />
          </Tooltip>
          <Tooltip noWrap tooltip={t('eco tooltip')} direction={'bottom'}>
            <div className={`${iconsSize} ml-2.5 bg-keyhole bg-contain bg-no-repeat hover:bg-keyhole_h`} />
          </Tooltip>
          <Tooltip noWrap tooltip={t('github tooltip')} direction={'bottom'}>
            <div className={`${iconsSize} hover:bg-github_g_h ml-2.5 bg-github_g bg-contain bg-no-repeat`} />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default ValidatorProfile;
