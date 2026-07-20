import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import AuthzGrantCard from '@/app/validators/[id]/[operatorAddress]/validator_passport/authz/node-details/authz-grant-card';
import { AuthzGrant } from '@/services/authz-service';

interface OwnProps {
  chainName: string;
  grants: AuthzGrant[];
  isLive: boolean;
  locale: string;
}

const AuthzPermissionsPanel: FC<OwnProps> = async ({ chainName, grants, isLive, locale }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorPassportPage' });

  if (!isLive) {
    return (
      <div className="pointer-events-none px-2 py-3 blur-sm" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="grid grid-cols-[minmax(9rem,0.35fr)_1fr] gap-4 py-1.5" key={index}>
            <div className="h-5 rounded bg-bgSt" />
            <div className="h-5 rounded bg-bgSt" />
          </div>
        ))}
      </div>
    );
  }

  if (grants.length === 0) {
    return <div className="px-2 py-10 text-center text-lg">{t('authz no permissions')}</div>;
  }

  return (
    <div>
      {grants.map((grant) => (
        <AuthzGrantCard chainName={chainName} grant={grant} locale={locale} key={grant.id} />
      ))}
    </div>
  );
};

export default AuthzPermissionsPanel;
