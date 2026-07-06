'use client';

import { useAiChat } from '@/hooks/use-ai-chat';
import { useAiContext } from '@/hooks/use-ai-context';

import AiChatPanel from './ai-chat-panel';

const AiChatPage = () => {
  const context = useAiContext();
  const { messages, isLoading, sendMessage, clearMessages } = useAiChat(context);

  return (
    <section className="flex min-h-[30rem] w-full flex-grow flex-col border border-bgSt bg-background shadow-3xl">
      {/* No autoFocus on the full-height page; the modal keeps autoFocus. */}
      <AiChatPanel
        context={context}
        messages={messages}
        isLoading={isLoading}
        sendMessage={sendMessage}
        clearMessages={clearMessages}
      />
    </section>
  );
};

export default AiChatPage;
