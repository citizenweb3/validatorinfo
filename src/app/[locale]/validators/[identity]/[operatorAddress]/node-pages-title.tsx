import { NamespaceKeys } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { FC } from 'react';

import PageTitle from '@/components/common/page-title';
import icons from '@/components/icons';
import { validatorNodesWithChainData } from '@/services/validator-service';

interface OwnProps {
  locale: string;
  page: string;
  node?: validatorNodesWithChainData | undefined;
}

const NodePagesTitle: FC<OwnProps> = async ({ locale, page, node }) => {
  const t = await getTranslations({ locale, namespace: page as NamespaceKeys<IntlMessages, 'ValidatorPassportPage'> });
  const indicatorSize =
    'xs:h-[15px] xs:w-[15px] sm:h-[20px] sm:w-[20px] md:h-[30px] md:w-[30px] lg:h-[40px] lg:w-[40px] xl:h-[50px] xl:w-[50px] 2xl:h-[60px] 2xl:w-[60px]';

  return (
    <div className="-mt-4 flex items-center">
      <div className="pt-4">
        <div className={`relative ${indicatorSize}`}>
          <Image
            src={node?.jailed ? icons.RedSquareIcon : icons.GreenSquareIcon}
            alt="node status"
            fill
            className="object-contain"
          />
        </div>
      </div>
      <PageTitle prefix={`${node?.moniker} ${t('pretext in prefix')} ${node?.prettyName}:`} text={t('title')} />
    </div>
  );
};

export default NodePagesTitle;
