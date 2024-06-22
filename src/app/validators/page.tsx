import ValidatorList from '@/app/validators/validator-list/validator-list';
import TabList from '@/components/common/tabs/tab-list';
import { validatorTabs } from '@/components/common/tabs/tabs-data';

export default function Home({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const chains: string[] = !searchParams.chains
    ? []
    : typeof searchParams.chains === 'string'
      ? [searchParams.chains]
      : searchParams.chains;
  return (
    <div>
      <TabList tabs={validatorTabs} />
      <ValidatorList chains={chains} />
    </div>
  );
}
