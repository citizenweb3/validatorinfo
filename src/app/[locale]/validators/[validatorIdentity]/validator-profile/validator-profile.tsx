import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import NetworksCircle from '@/app/validators/[validatorIdentity]/validator-profile/validator-networks-circle';
import { validatorExample } from '@/app/validators/[validatorIdentity]/validatorExample';
import PlusButton from '@/components/common/plus-button';

interface OwnProps {
  identity: string;
  locale: string;
}

const ValidatorProfile: FC<OwnProps> = async (identity, locale) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorProfileHeader' });
  const logos = validatorExample.chains.map((chain) => chain.logoUrl);
  const iconsSize = 'h-8 min-h-8 w-8 min-w-8';

  return (
    <div className="mb-7 mt-4 grid grid-cols-7 items-start">
      <div className="col-span-2 max-w-xs border-b border-bgSt">
        <div className="font-sfpro text-base">
          <h1>
            Embracing Decentralization, Empowering Communities. The Voice of Web3 & Non-custodial staking service.
          </h1>
          <div className="relative w-full h-[50px] 2xl:h-[80px] xl:h-[65px] lg:h-[60px]  overflow-hidden my-4">
            <iframe
              src="https://player.fireside.fm/v2/7d8ZfYhp/latest?theme=dark"
              className="origin-top-left m-0 p-0 scale-[0.25] 2xl:scale-[0.43] xl:scale-[0.32] lg:scale-[0.28]"
              width="740"
              height="200"
            ></iframe>
          </div>
        </div>
        <div className="flex items-center">
          <div className={`${iconsSize} bg-web bg-contain bg-no-repeat`} />
          <p className="text-xs">{t('Others Links')}</p>
          <PlusButton size="sm" isOpened={false} />
        </div>
      </div>
      <div className="col-span-3 h-full shadow-button">
        <NetworksCircle centerLogo={validatorExample.icon} logos={logos} />
      </div>
      <div className="col-span-2 ml-28 h-full border-b border-bgSt">
        <h1>
          <span className="border-b border-bgSt px-2.5 text-xl text-highlight">{t('Merits')}</span>
        </h1>
        <div className="mt-8 flex items-center">
          <div className={`${iconsSize} ml-2.5 bg-eco bg-contain bg-no-repeat`} />
          <div className={`${iconsSize} ml-2.5 bg-keyhole bg-contain bg-no-repeat`} />
          <div className={`${iconsSize} ml-2.5 bg-github_y bg-contain bg-no-repeat`} />
        </div>
      </div>
    </div>
  );
};

export default ValidatorProfile;
