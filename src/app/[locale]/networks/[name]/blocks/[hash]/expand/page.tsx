import ExpandedTxInformation from '@/app/networks/[name]/tx/[hash]/expand/expanded-tx-information';
import { NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';

interface PageProps {
  params: NextPageWithLocale & { name: string };
}

const TxInformationExpand: NextPageWithLocale<PageProps> = async ({ params: { name } }) => {
  const chain = await chainService.getByName(name);

  return (
    <div>
      <ExpandedTxInformation chain={chain} />
    </div>
  );
};

export default TxInformationExpand;
