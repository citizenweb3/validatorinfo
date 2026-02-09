import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import DetailRow from '@/app/networks/[name]/proposal/[proposalId]/aztec/detail-row';
import aztecContractService from '@/services/aztec-contracts-service';

interface OwnProps {
  payloadAddress: string;
  chainName: string;
}

const PayloadUri: FC<OwnProps> = async ({ payloadAddress, chainName }) => {
  const t = await getTranslations('ProposalPage');
  const uri = await aztecContractService.getPayloadUri(payloadAddress, chainName);

  if (!uri) {
    return null;
  }

  return (
    <DetailRow
      label={t('payload uri')}
      value={uri}
      href={uri}
      isExternal
    />
  );
};

export default PayloadUri;
