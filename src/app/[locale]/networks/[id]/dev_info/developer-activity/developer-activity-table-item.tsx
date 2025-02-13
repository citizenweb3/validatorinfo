import { FC } from 'react';
import { devActivityTableExampleInterface } from '@/app/networks/[id]/networkProfileExample';

interface OwnProps {
  item: devActivityTableExampleInterface;
}

const DeveloperActivityTableItem: FC<OwnProps> = ({ item }) => {
  return (
    <tr className="group cursor-pointer hover:bg-bgHover">
      <td className="w-1/2 border-b border-black py-4 hover:text-highlight active:border-bgSt">
        <div className="flex items-center justify-center font-sfpro text-base">
          {item.title}
        </div>
      </td>
      <td className="w-1/2 border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <div className="flex items-center justify-center font-handjet text-lg">
          {item.data}
        </div>
      </td>
    </tr>
  );
};

export default DeveloperActivityTableItem;
