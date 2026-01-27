import Link from 'next/link';
import { FC } from 'react';

import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';
import TableAvatar from '@/components/common/table/table-avatar';
import { Ecosystem } from '@prisma/client';
import chainService from '@/services/chain-service';
import EcosystemListItemChains from '@/app/ecosystems/ecosystems-list/ecosystems-list-item-chains';

interface OwnProps {
  item: Ecosystem;
}

const EcosystemListItem: FC<OwnProps> = async ({ item }) => {
  const ecosystemLink = `/nodes?p=1&ecosystems=${item.name}`;
  const ecosystemChains = await chainService.getListByEcosystem(item.name);

  return (
    <BaseTableRow>
      <BaseTableCell className="group/avatar w-2/12 px-2 py-2 font-sfpro hover:text-highlight">
        <TableAvatar icon={item.logoUrl}
                     name={item.prettyName}
                     href={ecosystemLink} />
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-handjet text-lg text-center hover:text-highlight">
        <div className="select-text cursor-default">$50B</div>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-handjet text-lg text-center hover:text-highlight">
        <div className="select-text cursor-default">$430B</div>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-handjet text-lg text-center hover:text-highlight">
        <div className="select-text cursor-default">120</div>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-handjet text-lg text-center hover:text-highlight">
        <div className="select-text cursor-default">25000</div>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-handjet text-lg text-center hover:text-highlight">
        <div className="select-text cursor-default">$10M</div>
      </BaseTableCell>
      <BaseTableCell className="w-2/12 px-2 py-2 font-handjet text-lg text-center">
        <Link href={ecosystemLink}>
          <div className="flex flex-row flex-wrap whitespace-normal">
            <div className="rounded-full bg-primary shadow-button px-6 mt-1 mr-2 hover:text-highlight">Tag1</div>
            <div className="rounded-full bg-primary shadow-button px-6 mt-1 mr-2 hover:text-highlight">Tag2</div>
            <div className="rounded-full bg-primary shadow-button px-6 mt-1 mr-2 hover:text-highlight">Tag3</div>
          </div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2">
        <EcosystemListItemChains chains={ecosystemChains} />
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default EcosystemListItem;
