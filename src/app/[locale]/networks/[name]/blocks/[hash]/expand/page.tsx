import ExpandedBlockInformation from '@/app/networks/[name]/blocks/[hash]/expand/expanded-block-information';
import { NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';

interface PageProps {
  params: NextPageWithLocale & { name: string; hash: string };
}

const BlockInformationExpand: NextPageWithLocale<PageProps> = async ({ params: { name, hash } }) => {
  const chain = await chainService.getByName(name);

  return (
    <div>
      <ExpandedBlockInformation chain={chain} hash={hash} />
    </div>
  );
};

export default BlockInformationExpand;
