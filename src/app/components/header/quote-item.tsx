import Image from 'next/image';

const QuoteItem = ({ name, value, grow }: { name: string; value: string | number; grow?: boolean }) => (
  <div className="flex flex-row items-center text-sm">
    <span className="text-nowrap">{name}:</span>
    {typeof grow !== 'undefined' &&
      (grow ? (
        <Image src="/img/icons/grow.svg" alt="grow" className="w-3" width={8} height={6} />
      ) : (
        <Image src="/img/icons/fall.svg" alt="fall" className="w-3" width={8} height={6} />
      ))}
    <span
      className={`ml-1 font-retro ${typeof grow === 'undefined' ? 'text-highlight' : grow ? 'text-secondary' : 'text-red'}`}
    >
      {value}
    </span>
  </div>
);

export default QuoteItem;
