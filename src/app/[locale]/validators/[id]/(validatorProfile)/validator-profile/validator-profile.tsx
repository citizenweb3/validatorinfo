import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import NetworksCircle from '@/app/validators/[id]/(validatorProfile)/validator-profile/validator-networks-circle';
import PlusButton from '@/components/common/plus-button';
import RoundedButton from '@/components/common/rounded-button';
import Tooltip from '@/components/common/tooltip';
import icons from '@/components/icons';
import validatorService from '@/services/validator-service';

import episodes from './validators_episodes.json';

interface OwnProps {
  id: number;
  locale: string;
}

const ValidatorProfile: FC<OwnProps> = async ({ id, locale }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorProfileHeader' });

  const validator = await validatorService.getById(id);
  const validatorLogoUrl = validator?.url || icons.AvatarIcon;

  const { validatorNodesWithChainData } = await validatorService.getValidatorNodesWithChains(id);
  const chainsLogos = validatorNodesWithChainData.map((chain) => chain?.logoUrl || icons.AvatarIcon);

  if (!validator) {
    return null;
  }

  const foundEpisode = episodes.find((ep) => ep.identity === validator.identity);
  const playerUrl = foundEpisode?.player_url
    ? `${foundEpisode.player_url}?theme=dark`
    : 'https://player.fireside.fm/v2/7d8ZfYhp/latest?theme=dark';

  const iconsSize = 'h-10 min-h-10 w-10 min-w-10';

  return (
    <div className="mb-7 mt-4 grid grid-cols-7 items-start">
      <div className="col-span-2 max-w-xs border-b border-bgSt">
        <div className="font-sfpro text-base">
          <h2>{t('description')}</h2>
          <div
            className="relative my-4 h-[40px] w-full overflow-hidden md:h-[50px] lg:h-[60px] xl:h-[66px] 2xl:h-[86px]">
            <iframe
              src={playerUrl}
              className="m-0 origin-top-left scale-[0.20] p-0 md:scale-[0.23] lg:scale-[0.28] xl:scale-[0.32] 2xl:scale-[0.41]"
              width="740"
              height="200"
            >
            </iframe>
          </div>
          {!foundEpisode?.player_url && (
            <RoundedButton href={''} contentClassName="font-handjet text-sm px-5 pt-0 pb-0" className="mb-4 active:mb-3">
              {t('place your interview here')}
            </RoundedButton>
          )}
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
          <Tooltip tooltip={t('eco tooltip')} direction={'bottom'}>
            <div className={`${iconsSize} ml-2.5 bg-eco bg-contain bg-no-repeat hover:bg-eco_h`} />
          </Tooltip>
          <Tooltip tooltip={t('eco tooltip')} direction={'bottom'}>
            <div className={`${iconsSize} ml-2.5 bg-keyhole bg-contain bg-no-repeat hover:bg-keyhole_h`} />
          </Tooltip>
          <Tooltip noWrap tooltip={t('github tooltip')} direction={'bottom'}>
            <div className={`${iconsSize} ml-2.5 bg-github_g bg-contain bg-no-repeat hover:bg-github_g_h`} />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default ValidatorProfile;
