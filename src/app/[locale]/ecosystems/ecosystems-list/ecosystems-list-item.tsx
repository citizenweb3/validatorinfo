import Link from 'next/link';
import { FC } from 'react';

import TableAvatar from '@/components/common/table/table-avatar';
import { Ecosystem } from '@prisma/client';
import chainService from '@/services/chain-service';
import EcosystemListItemChains from '@/app/ecosystems/ecosystems-list/ecosystems-list-item-chains';

interface OwnProps {
  item: Ecosystem;
}

const EcosystemListItem: FC<OwnProps> = async ({ item }) => {
  const ecosystemLink = `/validators?p=1&ecosystems=${item.name}`;
  const ecosystemChains = await chainService.getListByEcosystem(item.name);

  return (
    <tr className="font-handjet">
      <td
        className="group/avatar border-b w-2/12 border-black px-2 py-2 font-sfpro active:border-bgSt hover:bg-bgHover hover:text-highlight">
        <TableAvatar icon={item.logoUrl}
                     name={item.prettyName}
                     href={ecosystemLink} />
      </td>
      <td className="border-b border-black px-2 py-2 font-handjet text-lg text-center active:border-bgSt hover:bg-bgHover hover:text-highlight">
        <div className="select-text cursor-default">$50B</div>
      </td>
      <td className="border-b border-black px-2 py-2 font-handjet text-lg text-center active:border-bgSt hover:bg-bgHover hover:text-highlight">
        <div className="select-text cursor-default">$430B</div>
      </td>
      <td className="border-b border-black px-2 py-2 font-handjet text-lg text-center active:border-bgSt hover:bg-bgHover hover:text-highlight">
        <div className="select-text cursor-default">120</div>
      </td>
      <td className="border-b border-black px-2 py-2 font-handjet text-lg text-center active:border-bgSt hover:bg-bgHover hover:text-highlight">
        <div className="select-text cursor-default">25000</div>
      </td>
      <td className="border-b border-black px-2 py-2 font-handjet text-lg text-center active:border-bgSt hover:bg-bgHover hover:text-highlight">
        <div className="select-text cursor-default">$10M</div>
      </td>
      <td className="border-b border-black w-2/12 px-2 py-2 font-handjet text-lg text-center active:border-bgSt hover:bg-bgHover">
        <Link href={ecosystemLink}>
          <div className="flex flex-row flex-wrap whitespace-normal">
            <div className="rounded-full bg-primary shadow-button px-6 mt-1 mr-2 hover:text-highlight">Tag1</div>
            <div className="rounded-full bg-primary shadow-button px-6 mt-1 mr-2 hover:text-highlight">Tag2</div>
            <div className="rounded-full bg-primary shadow-button px-6 mt-1 mr-2 hover:text-highlight">Tag3</div>
          </div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2">
        <EcosystemListItemChains chains={ecosystemChains} />
      </td>
    </tr>
  );
};

export default EcosystemListItem;
