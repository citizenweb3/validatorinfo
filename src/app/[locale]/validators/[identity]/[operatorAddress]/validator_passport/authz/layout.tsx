import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import NodePagesTitle from '@/app/validators/[identity]/[operatorAddress]/node-pages-title';
import Medals from '@/app/validators/[identity]/[operatorAddress]/validator_passport/authz/medals';
import NodeDetails from '@/app/validators/[identity]/[operatorAddress]/validator_passport/authz/node-details/node-details';
import PassportMetricsBlocks from '@/app/validators/[identity]/[operatorAddress]/validator_passport/authz/passport-metrics-blocks';
import VanityChart from '@/app/validators/[identity]/[operatorAddress]/validator_passport/authz/vanity-chart';
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
  // unstable_setRequestLocale(locale);
  // const t = await getTranslations({ locale, namespace: 'ValidatorPassportPage' });
  const { validatorNodesWithChainData: list } = await ValidatorService.getValidatorNodesWithChains(identity);
  const node = list.find((item) => item.operator_address === operatorAddress);

  return (
    <div className="mb-24">
      <NodePagesTitle page={'ValidatorPassportPage'} locale={locale} node={node} />
      <PassportMetricsBlocks node={node} />
      <div className="mt-16 flex justify-between gap-6">
        <Medals locale={locale} />
        <VanityChart />
      </div>
      <NodeDetails locale={locale} identity={identity} operatorAddress={operatorAddress} node={node}>
        {children}
      </NodeDetails>
    </div>
  );
}
