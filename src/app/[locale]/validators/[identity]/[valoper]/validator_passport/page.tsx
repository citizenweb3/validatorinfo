import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

import Medals from '@/app/validators/[identity]/[valoper]/validator_passport/medals';
import PassportMetricsBlocks from '@/app/validators/[identity]/[valoper]/validator_passport/passport-metrics-blocks';
import PageTitle from '@/components/common/page-title';
import Tooltip from '@/components/common/tooltip';
import icons from '@/components/icons';
import { Locale, NextPageWithLocale } from '@/i18n';
import ValidatorService from '@/services/validator-service';
import VanityChart from '@/app/validators/[identity]/[valoper]/validator_passport/vanity-chart';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { identity: string; valoper: string };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'ValidatorPassportPage' });

  return {
    title: t('title'),
  };
}

const ValidatorPassportPage: NextPageWithLocale<PageProps> = async ({ params: { locale, identity, valoper } }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorPassportPage' });
  const { validatorNodesWithChainData: list } = await ValidatorService.getValidatorNodesWithChains(identity);
  const node = list.find((item) => item.operator_address === valoper);
  const indicatorSize =
    'xs:h-[15px] xs:w-[15px] sm:h-[20px] sm:w-[20px] md:h-[30px] md:w-[30px] lg:h-[40px] lg:w-[40px] xl:h-[50px] xl:w-[50px] 2xl:h-[60px] 2xl:w-[60px]';

  return (
    <div>
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
      <PassportMetricsBlocks node={node} />
      <div className="mb-7 mt-4 grid grid-cols-2">
        <div className="col-span-1">
          <Medals locale={locale} />
        </div>
        <div className="col-span-1">
          <VanityChart />
        </div>
      </div>
    </div>
  );
};

export default ValidatorPassportPage;
