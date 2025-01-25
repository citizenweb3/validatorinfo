import { headers } from 'next/headers';

import AuthzPermissionsDetails from '@/app/validators/[identity]/[operatorAddress]/validator_passport/authz/node-details/authz-permissions-details';
import { permissions } from '@/app/validators/[identity]/[operatorAddress]/validator_passport/authz/node-details/permissionsExample';
import { NextPageWithLocale } from '@/i18n';

interface PageProps {}

const PassportVotePage: NextPageWithLocale<PageProps> = async () => {
  const headersList = await headers();
  const referer = headersList.get('referer');

  return (
    <>
      <AuthzPermissionsDetails url={referer} permissions={permissions} />
    </>
  );
};

export default PassportVotePage;
