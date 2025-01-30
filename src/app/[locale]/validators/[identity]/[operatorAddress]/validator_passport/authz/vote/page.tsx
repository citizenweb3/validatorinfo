import Medals from '@/app/validators/[identity]/[operatorAddress]/validator_passport/authz/medals';
import NodeDetails from '@/app/validators/[identity]/[operatorAddress]/validator_passport/authz/node-details/node-details';
import PassportMetricsBlocks from '@/app/validators/[identity]/[operatorAddress]/validator_passport/authz/passport-metrics-blocks';
import VanityChart from '@/app/validators/[identity]/[operatorAddress]/validator_passport/authz/vanity-chart';
import { NextPageWithLocale } from '@/i18n';
import ValidatorService from '@/services/validator-service';

interface PageProps {
  params: NextPageWithLocale & { identity: string; operatorAddress: string };
}

const PassportVotePage: NextPageWithLocale<PageProps> = async ({ params: { locale, identity, operatorAddress } }) => {
  const { validatorNodesWithChainData: list } = await ValidatorService.getValidatorNodesWithChains(identity);
  const node = list.find((item) => item.operator_address === operatorAddress);

  return (
    <>
      <PassportMetricsBlocks node={node} />
      <div className="mt-16 flex justify-between gap-6">
        <Medals locale={locale} />
        <VanityChart />
      </div>
      <NodeDetails locale={locale} identity={identity} operatorAddress={operatorAddress} node={node} />
    </>
  );
};

export default PassportVotePage;
