import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import SubTitle from '@/components/common/sub-title';
import PlusButton from '@/components/common/plus-button';

interface OwnProps {
}

const AiGeneratedSummary: FC<OwnProps> = async ({}) => {
  const t = await getTranslations('ProposalPage');

  return (
    <div className="mt-4 mb-6">
      <SubTitle text={t('ai generated summary')} />
      <div className="mt-4 ml-4 font-sfpro text-base">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
        laborum.
      </div>
      <div className="mt-2 flex justify-center">
        <PlusButton size="base" isOpened={false} />
      </div>
    </div>

  );
};

export default AiGeneratedSummary;
