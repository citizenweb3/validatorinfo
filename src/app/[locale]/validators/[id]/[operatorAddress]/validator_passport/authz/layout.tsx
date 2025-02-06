import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';

import NodePagesTitle from '@/app/validators/[id]/[operatorAddress]/node-pages-title';
import { Locale } from '@/i18n';
import validatorService from '@/services/validator-service';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'ValidatorPassportPage' });

  return {
    title: t('title'),
  };
}

export default async function ValidatorPassportLayout({
  children,
  params: { locale, id, operatorAddress },
}: Readonly<{
  children: ReactNode;
  params: { locale: Locale; id: string; operatorAddress: string };
}>) {
  const validatorId = parseInt(id);
  const { validatorNodesWithChainData: list } = await validatorService.getValidatorNodesWithChains(validatorId);
  const node = list.find((item) => item.operatorAddress === operatorAddress);

  return (
    <div className="mb-24">
      <NodePagesTitle page={'ValidatorPassportPage'} locale={locale} node={node} />
      {children}
    </div>
  );
}
