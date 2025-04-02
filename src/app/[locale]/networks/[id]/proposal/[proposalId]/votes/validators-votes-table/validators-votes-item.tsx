import Link from 'next/link';
import { FC } from 'react';
import icons from '@/components/icons';
import TableAvatar from '@/components/common/table/table-avatar';
import cutHash from '@/utils/cut-hash';

interface OwnProps {
  item: {
    validator: string;
    txHash: string;
    answer: string;
    time: string;
  };
}

const ValidatorsVotesItem: FC<OwnProps> = ({ item }) => {
  return (
    <tr className="group cursor-pointer hover:bg-bgHover">
      <td className="w-1/4 border-b border-black py-2 pl-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <TableAvatar icon={icons.AvatarIcon} name={item.validator} href={``} />
      </td>
      <td
        className="w-1/4 border-b border-black py-2 font-handjet text-lg underline underline-offset-2 hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex items-center justify-center">
          {cutHash({ value: item.txHash })}
        </Link>
      </td>
      <td className="w-1/4 border-b border-black py-2 font-sfpro text-base hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex items-center justify-center">
          {item.answer}
        </Link>
      </td>
      <td className="w-1/4 border-b border-black py-2 font-handjet text-lg hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex items-center justify-center">
          {item.time}
        </Link>
      </td>
    </tr>
  );
};

export default ValidatorsVotesItem;
