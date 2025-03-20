import Link from 'next/link';
import { FC } from 'react';

import TableAvatar from '@/components/common/table/table-avatar';
import _ from 'lodash';
import { Chain } from '@prisma/client';

interface OwnProps {
  item: Chain;
}

const EcosystemListItem: FC<OwnProps> = async ({ item }) => {
  const ecosystemLink = `https://validatorinfo.com/validators?p=1&ecosystems=${item.ecosystem}`

  return (
    <tr className="group font-handjet hover:bg-bgHover hover:text-highlight">
      <td
        className="group/avatar border-b w-2/12 border-black px-2 py-2 font-sfpro active:border-bgSt">
        <TableAvatar icon={item.logoUrl}
                     name={_.capitalize(item.ecosystem)}
                     href={ecosystemLink} />
      </td>
      <td className="border-b border-black px-2 py-2 font-handjet text-lg text-center active:border-bgSt">
        <Link href={ecosystemLink}>$50B</Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-handjet text-lg text-center active:border-bgSt">
        <Link href={ecosystemLink}>$430B</Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-handjet text-lg text-center active:border-bgSt">
        <Link href={ecosystemLink}>
          120
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-handjet text-lg text-center active:border-bgSt">
        <Link href={ecosystemLink}>25000</Link>
      </td>
      <td className="border-b border-black px-2 py-2 font-handjet text-lg text-center active:border-bgSt">
        <Link href={ecosystemLink}>$10M</Link>
      </td>
      <td className="border-b border-black w-2/12 px-2 py-2 font-handjet text-lg text-center active:border-bgSt">
        <Link href={ecosystemLink}>
          <div className="flex flex-row flex-wrap whitespace-normal">
            <div className="rounded-full bg-primary shadow-button px-6 mt-1 mr-2">Tag1</div>
            <div className="rounded-full bg-primary shadow-button px-6 mt-1 mr-2">Tag2</div>
            <div className="rounded-full bg-primary shadow-button px-6 mt-1 mr-2">Tag3</div>
          </div>
        </Link>
      </td>
    </tr>
  );
};

export default EcosystemListItem;
