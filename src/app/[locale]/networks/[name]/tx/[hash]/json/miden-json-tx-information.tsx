import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import TxService from '@/services/tx-service';

interface OwnProps {
  hash: string;
}

const MidenJsonTxInformation: FC<OwnProps> = async ({ hash }) => {
  const t = await getTranslations('TxInformationPage');

  const result = await TxService.getMidenTxByHash(hash);

  if (!result) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="font-sfpro text-lg">{t('tx not found')}</div>
        <div className="font-sfpro text-base text-bgSt">{t('tx not found hint')}</div>
      </div>
    );
  }

  const jsonString = JSON.stringify(result.data, null, 4);

  return (
    <div className="mb-5 mr-10 mt-8 hover:bg-bgHover">
      <div className="flex flex-row">
        <div className="ml-20">
          <pre className="w-full whitespace-pre-wrap break-all font-handjet text-lg">{jsonString}</pre>
        </div>
        <div>
          <CopyButton value={jsonString} size="md" />
        </div>
      </div>
    </div>
  );
};

export default MidenJsonTxInformation;
