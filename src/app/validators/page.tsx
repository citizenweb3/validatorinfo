import ValidatorList from '@/app/validators/validator-list/validator-list';

export default function Home({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const chains: string[] = !searchParams.chains
    ? []
    : typeof searchParams.chains === 'string'
      ? [searchParams.chains]
      : searchParams.chains;
  return (
    <div>
      <ValidatorList chains={chains} />
    </div>
  );
}
