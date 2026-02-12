import JsonTxInformation from '@/app/networks/[name]/tx/[hash]/json/json-tx-information';
import { NextPageWithLocale } from '@/i18n';

interface PageProps {
  params: NextPageWithLocale & { name: string; hash: string };
}

const TxInformationJson: NextPageWithLocale<PageProps> = async ({ params: { name, hash } }) => {
  return (
    <div>
      <JsonTxInformation chainName={name} hash={hash} />
    </div>
  );
};

export default TxInformationJson;
