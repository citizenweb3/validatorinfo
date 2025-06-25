import { NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import ExpandedTxInformation from '@/app/networks/[id]/tx/[hash]/expand/expanded-tx-information';

interface PageProps {
  params: NextPageWithLocale & { id: string; };
}

const TxInformationExpand: NextPageWithLocale<PageProps> = async ({ params: { id } }) => {
  const chainId = parseInt(id);
  const chain = await chainService.getById(chainId);


  return (
    <div>
      <ExpandedTxInformation chain={chain} />
    </div>
  );
};

export default TxInformationExpand;
