'use client';

import { Chain } from '@prisma/client';
import Link from 'next/link';
import { FC, useState } from 'react';
import TableAvatar from '@/components/common/table/table-avatar';
import { ValidatorWithNodes } from '@/services/validator-service';
import ValidatorListItemLinksMobile
  from '@/app/main-validators/validator-list-mobile/validator-list-item-mobile/validator-list-item-links-mobile';

interface OwnProps {
  validator: ValidatorWithNodes;
  chains: Chain[];
}

const ValidatorListItemMobile: FC<OwnProps> = ({ chains, validator }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  // @ts-ignore I don't know why, but it doesn't understand that filter removes undefined items
  const validatorChains: (Chain & { valoper: string })[] = validator.nodes
    .map((n) => {
      const el = chains.find((c) => c.id === n.chainId);
      return { ...el, valoper: n.operatorAddress };
    })
    .filter((c) => typeof c !== 'undefined');

  return (
    <tr className="group font-handjet hover:bg-bgHover ">
      <td
        className="group/avatar w-[25%] border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <TableAvatar
          textClassName="md:max-w-36"
          icon={validator.url}
          name={validator.moniker}
          href={`/validators/${validator.id}/networks`}
        />
      </td>
      <td className="md:hidden border-b border-black px-2 py-2 text-7xl font-handjet text-center">
        90%
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`/validators/${validator.id}/metrics`}
          className="flex items-center justify-center font-handjet text-7xl md:text-lg"
        >
          -
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`/validators/${validator.id}/metrics`}
          className="flex items-center justify-center font-handjet text-7xl md:text-lg"
        >
          -
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`/validators/${validator.id}/metrics`}
          className="flex items-center justify-center font-handjet text-7xl md:text-lg"
        >
          -
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link
          href={`/validators/${validator.id}/metrics`}
          className="flex items-center justify-center font-handjet text-7xl md:text-lg"
        >
          -
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        <ValidatorListItemLinksMobile validator={validator} />
      </td>
    </tr>
  );
};

export default ValidatorListItemMobile;
