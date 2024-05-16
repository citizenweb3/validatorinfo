import { FC } from "react";

import QuoteItem from "@/app/components/header/quote-item";

interface OwnProps {}

const data = {
  validators: "1277",
  ecosystems: "200",
  tvl: "$74.6B",
  list: [
    {
      name: "Dominance: Cosmos",
      grow: false,
      value: "24.7%",
    },
    {
      name: "Eth",
      grow: true,
      value: "42.5%",
    },
    {
      name: "Polkadot",
      grow: true,
      value: "21.9%",
    },
  ],
};

const Quotes: FC<OwnProps> = ({}) => {
  return (
    <div className="flex flex-grow flex-row space-x-7 overflow-auto p-3 scrollbar-none">
      <QuoteItem name="Validators" value={data.validators} />
      <QuoteItem name="Ecosystems" value={data.ecosystems} />
      <QuoteItem name="TVL" value={data.tvl} />
      {data.list.map((item) => (
        <QuoteItem key={item.name} name={item.name} value={item.value} grow={item.grow} />
      ))}
    </div>
  );
};

export default Quotes;
