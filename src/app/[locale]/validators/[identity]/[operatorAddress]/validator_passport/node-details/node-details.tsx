import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import NodeDetailsItem from '@/app/validators/[identity]/[operatorAddress]/validator_passport/node-details/node-details-item';
import SubTitle from '@/components/common/sub-title';

interface OwnProps {
  locale: string;
}

const NodeDetails: FC<OwnProps> = async ({ locale }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorPassportPage' });

  return (
    <div>
      <div>
        <SubTitle text={t('Validator Node Details')} />
        <div className="mb-6 grid grid-cols-2 gap-6">
          <NodeDetailsItem label="Validator Name" value="Citizen Web3" />
          <NodeDetailsItem label="Public Key" value="31223" />
          <NodeDetailsItem label="Account Address" value="...1234" />
          <NodeDetailsItem label="Identity" value="2493423" />
          <NodeDetailsItem label="Validator Address" value="...314" />
          <NodeDetailsItem label="Reward Address" value="...314" />
        </div>
        <div className="mb-6">
          <h2 className="mb-2">Authz Permissions</h2>
          <div className="mb-4 flex flex-wrap gap-2">
            <button className="rounded px-4 py-2">Withdraw Rewards</button>
            <button className="rounded px-4 py-2">Unjail</button>
            <button className="rounded px-4 py-2">Transact</button>
            <button className="rounded px-4 py-2">Vote</button>
          </div>
          <div className="rounded-md p-4">
            <p>
              <strong>Granter:</strong> bcn1n9a14td3qlgcw7f1kjdhzh7x0vl2ret7a7z7d
            </p>
            <p>
              <strong>Grantee:</strong> bcan10xwwdhzeg92vyahkvza72yuo3w4qnscrw8v
            </p>
            <p>
              <strong>Authorization:</strong> Generic Authorization
            </p>
            <p>@Type: /cosmos.authz.v1beta1.GenericAuthorization</p>
            <p>Msg: /cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission</p>
            <p>
              <strong>Expiration:</strong> May 22nd 2024, 16:07:33
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-6">
          <div className="space-y-2 rounded-md p-4">
            <NodeDetailsItem label="Jail Status" value="Unjail" />
            <NodeDetailsItem label="Voting" value="✅" />
            <NodeDetailsItem label="Send Tx" value="✅" />
          </div>
          <div className="space-y-2 rounded-md p-4">
            <NodeDetailsItem label="Withdrawn Commission" value="$5.6K" />
            <NodeDetailsItem label="Withdrawn Rewards" value="$60.6K" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeDetails;
