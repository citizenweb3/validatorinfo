import JsonBlockInformation from '@/app/networks/[name]/blocks/[hash]/json/json-block-information';
import { NextPageWithLocale } from '@/i18n';

interface PageProps {
  params: NextPageWithLocale & { name: string; hash: string };
}

const BlockInformationJson: NextPageWithLocale<PageProps> = async ({ params: { hash } }) => {
  return (
    <div>
      <JsonBlockInformation hash={hash} />
    </div>
  );
};

export default BlockInformationJson;
