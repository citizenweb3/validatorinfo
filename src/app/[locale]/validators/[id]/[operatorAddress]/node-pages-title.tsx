import { NamespaceKeys } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { FC } from 'react';

import PageTitle from '@/components/common/page-title';
import icons from '@/components/icons';
import { validatorNodesWithChainData } from '@/services/validator-service';
import Link from 'next/link';

interface OwnProps {
  locale: string;
  page: string;
  node?: validatorNodesWithChainData | undefined;
}

const NodePagesTitle: FC<OwnProps> = async ({ locale, page, node }) => {
  const t = await getTranslations({ locale, namespace: page as NamespaceKeys<IntlMessages, 'ValidatorPassportPage'> });
  const indicatorSize = 'xs:h-[15px] xs:w-[15px] sm:h-[20px] sm:w-[20px] md:h-[30px] md:w-[30px] lg:h-[40px] lg:w-[40px] xl:h-[50px] xl:w-[50px] 2xl:h-[60px] 2xl:w-[60px]';
  const cursor = 'h-7 min-h-7 w-7 min-w-7 bg-contain bg-no-repeat bg-cursor group-hover:bg-cursor_h group-active:bg-cursor_a';

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
      <PageTitle
        prefix={
          <div className="flex flex-row">
            <Link href={`/validators/${node?.validatorId}/networks`} className="group">
              <div className="flex flex-row">
                <span className="group-hover:text-oldPalette-white group-active:text-3xl">{node?.moniker}</span>
                <div className={cursor} />
              </div>
            </Link>
            <span className="mx-2">{t('pretext in prefix')}</span>
            <Link href={`/networks/${node?.chain.name}/overview`} className="group">
              <div className="flex flex-row">
                <span className="group-hover:text-oldPalette-white group-active:text-3xl">{node?.chain.prettyName}</span>
                <div className={`${cursor} mr-1`} />
              </div>
            </Link>
            :
          </div>
        }
        text={t('title')}
      />
    </div>
  );
};

export default NodePagesTitle;
