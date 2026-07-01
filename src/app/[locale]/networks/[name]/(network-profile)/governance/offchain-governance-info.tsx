import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { OFFCHAIN_GOVERNANCE } from '@/app/networks/[name]/(network-profile)/governance/offchain-governance-config';
import SubTitle from '@/components/common/sub-title';

interface OwnProps {
  chainName: string;
}

const OffchainGovernanceInfo: FC<OwnProps> = async ({ chainName }) => {
  const t = await getTranslations('OffchainGovernanceInfo');

  const config = OFFCHAIN_GOVERNANCE[chainName];
  const channels = config?.channels ?? [];

  return (
    <div className="mt-5 flex flex-col gap-6">
      <SubTitle text={t('title')} />
      <div className="bg-table_row p-6">
        <div className="font-handjet text-2xl text-highlight">{t('infoTitle')}</div>
        <p className="mt-3 font-sfpro text-base leading-relaxed">
          {config ? t(config.bodyKey as 'infoBodyMonero') : t('infoBodyGeneric')}
        </p>
      </div>
      {channels.length > 0 && (
        <div className="bg-table_row p-6">
          <div className="font-handjet text-xl text-highlight">{t('channelsTitle')}</div>
          <ul className="mt-3 flex flex-col gap-2 font-sfpro text-base">
            {channels.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-3 hover:text-highlight"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OffchainGovernanceInfo;
