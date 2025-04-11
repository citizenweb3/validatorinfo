import Medals from '@/app/validators/[id]/[operatorAddress]/validator_passport/authz/medals';
import NodeDetails from '@/app/validators/[id]/[operatorAddress]/validator_passport/authz/node-details/node-details';
import PassportMetricsBlocks
  from '@/app/validators/[id]/[operatorAddress]/validator_passport/authz/passport-metrics-blocks';
import VanityChart from '@/app/validators/[id]/[operatorAddress]/validator_passport/authz/vanity-chart';
import { NextPageWithLocale } from '@/i18n';
import validatorService from '@/services/validator-service';
import SubDescription from '@/components/sub-description';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: NextPageWithLocale & { id: string; operatorAddress: string };
}

const PassportVotePage: NextPageWithLocale<PageProps> = async ({
    params: { locale, id, operatorAddress },
  }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorPassportPage' });
  const validatorId = parseInt(id);
  const { validatorNodesWithChainData: list } = await validatorService.getValidatorNodesWithChains(validatorId);
  const node = list.find((item) => item.operatorAddress === operatorAddress);

  return (
    <>
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <PassportMetricsBlocks node={node} />
      <div className="mt-16 flex justify-between gap-6">
        <Medals locale={locale} />
        <VanityChart />
      </div>
      <NodeDetails locale={locale} validatorId={validatorId} operatorAddress={operatorAddress} node={node} />
    </>
  );
};

export default PassportVotePage;
