import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { ReactNode } from 'react';

import Medals from '@/app/validators/[identity]/[operatorAddress]/validator_passport/authz/medals';
import NodeDetails from '@/app/validators/[identity]/[operatorAddress]/validator_passport/authz/node-details/node-details';
import PassportMetricsBlocks from '@/app/validators/[identity]/[operatorAddress]/validator_passport/authz/passport-metrics-blocks';
import VanityChart from '@/app/validators/[identity]/[operatorAddress]/validator_passport/authz/vanity-chart';
import PageTitle from '@/components/common/page-title';
import icons from '@/components/icons';
import { Locale } from '@/i18n';
import ValidatorService from '@/services/validator-service';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'ValidatorPassportPage' });

  return {
    title: t('title'),
  };
}

export default async function ValidatorPassportLayout({
  children,
  params: { locale, identity, operatorAddress },
}: Readonly<{
  children: ReactNode;
  params: { locale: Locale; identity: string; operatorAddress: string };
}>) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ValidatorPassportPage' });
  const { validatorNodesWithChainData: list } = await ValidatorService.getValidatorNodesWithChains(identity);
  const node = list.find((item) => item.operator_address === operatorAddress);
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
      <div className="mt-16 flex justify-between gap-6">
        <Medals locale={locale} />
        <VanityChart />
      </div>
      <NodeDetails identity={identity} operatorAddress={operatorAddress} node={node}>
        {children}
      </NodeDetails>
    </div>
  );
}
