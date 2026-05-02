'use client';

import { useTranslations } from 'next-intl';

import RoundedButton from '@/components/common/rounded-button';
import AiChatInput from '@/components/ai-chat/ai-chat-input';
import AiChatMessages from '@/components/ai-chat/ai-chat-messages';
import AiChatSuggestions from '@/components/ai-chat/ai-chat-suggestions';
import { useAiChat } from '@/hooks/use-ai-chat';
import { useAiContext } from '@/hooks/use-ai-context';

const AiChatInline = () => {
  const t = useTranslations('HomePage');
  const aiT = useTranslations('AiChat');
  const context = useAiContext();
  const { messages, isLoading, sendMessage, clearMessages } = useAiChat(context);

  return (
    <section className="flex min-h-80 min-w-0 flex-col overflow-hidden border border-bgSt bg-table_row shadow-button md:h-[28rem] md:min-h-[28rem]">
      <div className="flex items-start justify-between px-6 pb-5 pt-4 sm:px-4 sm:pb-3 sm:pt-2 md:px-4 md:pb-3 md:pt-2">
        <div className="inline-flex border-b border-bgSt pb-1 pr-5">
          <h2 className="font-handjet text-5xl font-medium tracking-normal text-highlight sm:text-3xl md:text-xl">{t('askExpert')}</h2>
        </div>
        {messages.length > 0 && (
          <RoundedButton onClick={clearMessages} contentClassName="!px-10 !py-5 text-5xl sm:!px-6 sm:!py-3 sm:text-2xl md:!px-4 md:!py-1 md:text-sm">
            {aiT('New chat')}
          </RoundedButton>

        )}
      </div>

      <AiChatMessages messages={messages} isLoading={isLoading} context={context} />

      {messages.length === 0 && !isLoading && (
        <AiChatSuggestions context={context} onSelect={(text) => void sendMessage(text)} inline />
      )}

      <AiChatInput onSend={(text) => void sendMessage(text)} isLoading={isLoading} />
    </section>
  );
};

export default AiChatInline;
