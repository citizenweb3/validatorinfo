import Medals from '@/app/validators/[id]/[operatorAddress]/validator_passport/authz/medals';
import NodeDetails from '@/app/validators/[id]/[operatorAddress]/validator_passport/authz/node-details/node-details';
import PassportMetricsBlocks from '@/app/validators/[id]/[operatorAddress]/validator_passport/authz/passport-metrics-blocks';
import VanityChart from '@/app/validators/[id]/[operatorAddress]/validator_passport/authz/vanity-chart';
import { NextPageWithLocale } from '@/i18n';
import validatorService from '@/services/validator-service';

interface PageProps {
  params: NextPageWithLocale & { id: string; operatorAddress: string };
}

const PassportWithdrawRewardsPage: NextPageWithLocale<PageProps> = async ({
  params: { locale, id, operatorAddress },
}) => {
  const validatorId = parseInt(id);
  const { validatorNodesWithChainData: list } = await validatorService.getValidatorNodesWithChains(validatorId);
  const node = list.find((item) => item.operatorAddress === operatorAddress);

  return (
    <>
      <PassportMetricsBlocks node={node} />
      <div className="mt-20 flex justify-between gap-24">
        <Medals locale={locale} />
        <VanityChart />
      </div>
      <NodeDetails locale={locale} validatorId={validatorId} operatorAddress={operatorAddress} node={node} />
    </>
  );
};

export default PassportWithdrawRewardsPage;
