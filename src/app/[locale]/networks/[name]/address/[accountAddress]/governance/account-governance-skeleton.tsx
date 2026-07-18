const AccountGovernanceSkeleton = () => (
  <div className="animate-pulse pt-8" aria-hidden="true">
    <div className="mb-8 h-8 w-56 border-b border-bgSt bg-table_row pb-2" />
    <div className="space-y-2">
      <div className="h-12 bg-table_row shadow-[0_4px_4px_rgba(0,0,0,0.8)]" />
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="h-16 bg-table_row" />
      ))}
    </div>
  </div>
);

export default AccountGovernanceSkeleton;
