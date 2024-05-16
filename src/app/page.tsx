import TabList, { TabOptions } from '@/components/common/tabs/tab-list';
import icons from '@/components/icons';

const tabs: TabOptions[] = [
  { name: 'Staking Calc', href: 'calculator', icon: icons.CalculatorIcon },
  { name: 'Validator Comparison', href: 'comparison', icon: icons.ComparisonIcon },
  { name: 'ValidatorInfo', href: 'validators', icon: icons.ValidatorsIcon, isSelected: true },
  { name: 'Rumors', href: 'rumors', icon: icons.NetworksIcon },
  { name: 'Global POS', href: '/' },
];

export default function Home() {
  return (
    <div className="w-full">
      <TabList list={tabs} />
      <div className="mt-4 text-2xl">Validators</div>
    </div>
  );
}
