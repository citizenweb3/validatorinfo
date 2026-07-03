'use client';

import { useAiChat } from '@/hooks/use-ai-chat';
import { useAiContext } from '@/hooks/use-ai-context';

import AiChatPanel from './ai-chat-panel';

const AiChatPage = () => {
  const context = useAiContext();
  const { messages, isLoading, sendMessage, clearMessages } = useAiChat(context);

  return (
    <section className="mx-auto flex h-[75vh] min-h-[30rem] w-full max-w-ai-chat-modal flex-col border border-bgSt bg-background shadow-3xl">
      <AiChatPanel
        context={context}
        messages={messages}
        isLoading={isLoading}
        sendMessage={sendMessage}
        clearMessages={clearMessages}
        autoFocus
      />
    </section>
  );
};

export default AiChatPage;
