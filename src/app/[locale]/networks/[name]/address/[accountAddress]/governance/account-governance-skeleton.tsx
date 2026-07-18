const AccountGovernanceSkeleton = () => (
  <div className="animate-pulse pt-8" aria-hidden="true">
    <div className="mb-8 h-20 w-full bg-table_row" />
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="h-72 bg-table_row" />
      <div className="h-72 bg-table_row" />
    </div>
    <div className="mt-8 space-y-2">
      <div className="h-12 bg-table_header" />
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-20 bg-table_row" />
      ))}
    </div>
  </div>
);

export default AccountGovernanceSkeleton;
