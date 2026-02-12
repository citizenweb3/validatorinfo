import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { txExample } from '@/app/networks/[name]/tx/txExample';
import CopyButton from '@/components/common/copy-button';
import { isAztecChainName } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import TxService from '@/services/tx-service';

interface OwnProps {
  chainName: string;
  hash: string;
}

const JsonTxInformation: FC<OwnProps> = async ({ chainName, hash }) => {
  const t = await getTranslations('TxInformationPage');

  if (isAztecChainName(chainName)) {
    const result = await TxService.getAztecTxByHash(hash);

    if (!result) {
      return (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="font-sfpro text-lg">{t('tx not found')}</div>
          <div className="font-sfpro text-base text-gray-400">{t('tx not found hint')}</div>
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
  }

  // Non-Aztec: existing mock data
  const formatData = (data: unknown) => {
    return (
      <pre className="w-full whitespace-pre-wrap break-all font-handjet text-lg">
        {JSON.stringify(data, null, 4)}
      </pre>
    );
  };

  return (
    <div className="mb-5 mr-10 mt-8 hover:bg-bgHover">
      {txExample.jsonData.map((item, index) => (
        <div key={index} className="flex flex-row">
          <div className="ml-20">{formatData(item)}</div>
          <div>
            <CopyButton value={JSON.stringify(item, null, 4)} size="md" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default JsonTxInformation;
