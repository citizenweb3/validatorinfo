import { getTranslations } from 'next-intl/server';

import DelegationsListClient from '@/app/networks/[name]/address/[accountAddress]/passport/delegations-table/delegations-list-client';
import AccountDelegationsService from '@/services/account-delegations-service';

interface OwnProps {
  chainName: string;
  accountAddress: string;
}

const MessageRow = ({ message }: { message: string }) => (
  <tbody>
    <tr>
      <td colSpan={4} className="py-8 text-center font-sfpro text-lg text-white/60">
        {message}
      </td>
    </tr>
  </tbody>
);

const DelegationsList = async ({ chainName, accountAddress }: OwnProps) => {
  const [t, result] = await Promise.all([
    getTranslations('AccountPage.Passport'),
    AccountDelegationsService.getAccountDelegations(chainName, accountAddress),
  ]);

  if (result.status === 'unsupported') return <MessageRow message={t('delegationsUnsupported')} />;
  if (result.status === 'error') return <MessageRow message={t('delegationsError')} />;
  if (result.status === 'empty') return <MessageRow message={t('delegationsEmpty')} />;

  return <DelegationsListClient items={result.rows} denom={result.denom} tokenPrice={result.tokenPrice} />;
};

export default DelegationsList;
