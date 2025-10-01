import { FC } from 'react';
import { txExample } from '@/app/networks/[name]/tx/txExample';
import CopyButton from '@/components/common/copy-button';

const JsonTxInformation: FC = async () => {
  const formatData = (data: any) => {
    return (
      <pre className="whitespace-pre-wrap break-all font-handjet text-lg w-full">
        {JSON.stringify(data, null, 4)}
      </pre>
    );
  };

  return (
    <div className="mt-8 mb-5 hover:bg-bgHover mr-10">
      {txExample.jsonData.map((item, index) => (
        <div key={index} className="flex flex-row">
          <div className="ml-20">
            {formatData(item)}
          </div>
          <div><CopyButton value={JSON.stringify(item, null, 4)} size="md" /></div>
        </div>
      ))}
    </div>
  );
};

export default JsonTxInformation;
