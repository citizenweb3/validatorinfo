import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { FC, ReactNode } from 'react';

import { AuthzGrant } from '@/services/authz-service';
import { formatTimestamp } from '@/utils/format-timestamp';
import { parseMessage } from '@/utils/parse-proposal-message';

interface DetailRowProps {
  label: string;
  value: ReactNode;
}

const DetailRow: FC<DetailRowProps> = ({ label, value }) => (
  <div className="grid grid-cols-[minmax(9rem,0.35fr)_1fr] gap-4 py-1.5">
    <div className="text-base text-highlight">{label}:</div>
    <div className="break-all text-base">{value}</div>
  </div>
);

interface OwnProps {
  chainName: string;
  grant: AuthzGrant;
  locale: string;
}

const AuthzGrantCard: FC<OwnProps> = async ({ chainName, grant, locale }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorPassportPage' });
  const authorizationLabel = t(`authz authorization ${grant.kind}`);

  return (
    <div className="border-b border-bgSt px-2 py-4 last:border-b-0">
      <DetailRow
        label={t('authz granter')}
        value={
          <Link
            className="cursor-pointer underline underline-offset-2"
            href={`/networks/${chainName}/address/${grant.granter}/passport`}
          >
            {grant.granter}
          </Link>
        }
      />
      <DetailRow
        label={t('authz grantee')}
        value={
          <Link
            className="cursor-pointer underline underline-offset-2"
            href={`/networks/${chainName}/address/${grant.grantee}/passport`}
          >
            {grant.grantee}
          </Link>
        }
      />
      <DetailRow label={t('authz authorization')} value={authorizationLabel} />
      <DetailRow label={t('authz type')} value={grant.typeUrl} />
      <DetailRow
        label={t('authz expiration')}
        value={grant.expiration ? formatTimestamp(grant.expiration) : t('authz no expiration')}
      />

      {grant.kind === 'generic' && (
        <DetailRow label={t('authz msg')} value={parseMessage(grant.msgTypeUrl)} />
      )}

      {grant.kind === 'send' && (
        <>
          <DetailRow label={t('authz recipient scope')} value={t('authz any recipient')} />
          <DetailRow
            label={t('authz spend limit')}
            value={
              grant.spendLimit.length > 0
                ? grant.spendLimit.map(({ amount, denom }) => `${amount} ${denom}`).join(', ')
                : t('authz unlimited')
            }
          />
        </>
      )}

      {grant.kind === 'stake' && (
        <>
          <DetailRow label={t('authz authorization type')} value={grant.authorizationType} />
          <DetailRow
            label={t('authz max tokens')}
            value={grant.maxTokens ? `${grant.maxTokens.amount} ${grant.maxTokens.denom}` : t('authz unlimited')}
          />
          <DetailRow
            label={
              grant.validators.mode === 'allow'
                ? t('authz allow list')
                : grant.validators.mode === 'deny'
                  ? t('authz deny list')
                  : t('authz validators')
            }
            value={
              grant.validators.addresses.length > 0
                ? grant.validators.addresses.join(', ')
                : t('authz any validator')
            }
          />
        </>
      )}

      {grant.kind === 'unknown' && <DetailRow label={t('authz note')} value={t('authz unknown note')} />}
    </div>
  );
};

export default AuthzGrantCard;
