import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import OptimizedMessageList from "./OptimizedMessageList";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    loadMoreMessages,
    isMessagesLoading,
    isLoadingMoreMessages,
    pagination,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  useEffect(() => {
    if (selectedUser?._id) {
      if (messages.length === 0 && !isMessagesLoading) {
        getMessages(selectedUser._id);
      }
      subscribeToMessages();
    }

    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    messages.length,
    isMessagesLoading,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <OptimizedMessageList
        messages={messages}
        selectedUser={selectedUser}
        onLoadMore={loadMoreMessages}
        hasNextPage={pagination.hasNextPage}
        isLoadingMore={isLoadingMoreMessages}
      />

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
