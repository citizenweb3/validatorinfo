import JsonTxInformation from '@/app/networks/[name]/tx/[hash]/json/json-tx-information';

const TxInformationJson = async () => {
  return (
    <div>
      <JsonTxInformation />
    </div>
  );
};

export default TxInformationJson;
