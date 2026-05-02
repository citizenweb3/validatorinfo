import JsonBlockInformation from '@/app/networks/[name]/blocks/[hash]/json/json-block-information';
import { NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';

interface PageProps {
  params: NextPageWithLocale & { name: string; hash: string };
}

const BlockInformationJson: NextPageWithLocale<PageProps> = async ({ params: { name, hash } }) => {
  const chain = await chainService.getByName(name);

  return (
    <div>
      <JsonBlockInformation chain={chain} hash={hash} />
    </div>
  );
};

export default BlockInformationJson;
