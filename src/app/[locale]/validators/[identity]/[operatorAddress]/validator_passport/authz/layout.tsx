import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';

import NodePagesTitle from '@/app/validators/[identity]/[operatorAddress]/node-pages-title';
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
  const { validatorNodesWithChainData: list } = await ValidatorService.getValidatorNodesWithChains(identity);
  const node = list.find((item) => item.operator_address === operatorAddress);

  return (
    <div className="mb-24">
      <NodePagesTitle page={'ValidatorPassportPage'} locale={locale} node={node} />
      {children}
    </div>
  );
}
