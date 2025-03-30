import { FC } from 'react';

interface OwnProps {
  selectedValue: string[];
  onChanged: (value: string) => void;
  filterValues: {
    value: string;
    title: string;
  }[];
}

const LibraryTagsFilterTags: FC<OwnProps> = ({ filterValues, selectedValue, onChanged }) => {
  return (
    <div className="flex flex-row ml-8 mr-4">
      {filterValues.map((item) => (
        <div
          key={item.value}
          onClick={() => onChanged(item.value)}
          className={`rounded-full bg-primary shadow-button px-6 mr-2 text-lg font-handjet cursor-pointer hover:opacity-80 active:scale-95 ${selectedValue.includes(item.value) ? 'text-highlight' : ''}`}
        >
          {item.title}
        </div>
      ))}
    </div>
  );
};

export default LibraryTagsFilterTags;
