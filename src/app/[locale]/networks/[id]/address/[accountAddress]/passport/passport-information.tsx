import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import RoundedButton from '@/components/common/rounded-button';
import CopyButton from '@/components/common/copy-button';
import QrCodeButton from '@/components/common/qrcode-button';
import SwitchClient from '@/components/common/switch-client';
import Tooltip from '@/components/common/tooltip';

interface OwnProps {
  accountAddress: string;
}

const PassportInformation: FC<OwnProps> = async ({ accountAddress }) => {
  const t = await getTranslations('AccountPage.Passport');

  return (
    <div>
      <div className="flex flex-row">
        <div className="text-2xl font-handjet mt-1">
          {accountAddress}
        </div>
        <div className="ml-2 mr-1">
          <CopyButton value={accountAddress} size="lg" />
        </div>
        <QrCodeButton size="lg" />
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-end mt-14">
          <RoundedButton className="font-handjet text-lg mr-12">{t('Multichain Portfolio')}</RoundedButton>
          <RoundedButton className="font-handjet text-lg">{t('Claim Address')}</RoundedButton>
        </div>
        <div className="flex flex-col">
          <div className="flex flex-row justify-end">
            <div className="border-b border-bgSt px-2 font-handjet text-lg">USD</div>
            <SwitchClient value={true} />
            <div className="border-b border-bgSt px-2 font-handjet text-lg">{t('token')}</div>
          </div>
          <Tooltip tooltip={'text'} direction={'top'}>
            <div className="mt-2.5 flex items-center justify-between px-4 py-1 shadow-button">
              <div className="font-sfpro text-lg">{t('account value')}:</div>
              <div className="mx-auto px-20 font-handjet text-xl text-highlight">$12.43K</div>
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default PassportInformation;
