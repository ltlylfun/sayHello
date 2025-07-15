import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const OptimizedMessageList = ({
  messages,
  selectedUser,
  onLoadMore,
  hasNextPage,
  isLoadingMore,
}) => {
  const { authUser } = useAuthStore();
  const containerRef = useRef(null);
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingInProgress, setIsLoadingInProgress] = useState(false);
  const [showScrollToBottomButton, setShowScrollToBottomButton] =
    useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const lastLoadTimeRef = useRef(0);

  // 处理滚动事件 - 提前加载和无感加载
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // 检查是否接近底部（距离底部50px以内认为是在最新消息位置）
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    setShowScrollToBottomButton(!isNearBottom);

    // 提前加载：当滚动到距离顶部200px时就开始加载（更保守的触发条件）
    const loadTriggerPoint = 200;

    // 防抖：至少间隔1秒才能再次触发加载
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;

    if (
      scrollTop < loadTriggerPoint &&
      hasNextPage &&
      !isLoadingMore &&
      !isLoadingInProgress &&
      timeSinceLastLoad > 1000 // 1秒防抖
    ) {
      setIsLoadingInProgress(true);
      lastLoadTimeRef.current = now;

      const currentScrollHeight = scrollHeight;
      const currentScrollTop = scrollTop;

      onLoadMore()
        .then(() => {
          // 无感加载：调整滚动位置，保持用户看到的内容不变
          // 使用双重 requestAnimationFrame 确保DOM完全更新后执行
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (containerRef.current) {
                const newScrollHeight = containerRef.current.scrollHeight;
                const heightDifference = newScrollHeight - currentScrollHeight;

                if (heightDifference > 0) {
                  containerRef.current.scrollTop =
                    currentScrollTop + heightDifference;
                }
              }
              setIsLoadingInProgress(false);
            });
          });
        })
        .catch(() => {
          setIsLoadingInProgress(false);
        });
    }
  }, [hasNextPage, isLoadingMore, onLoadMore, isLoadingInProgress]);

  const throttledHandleScroll = useCallback(() => {
    let ticking = false;

    return () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
  }, [handleScroll])();

  useEffect(() => {
    setVisibleMessages(messages);
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (selectedUser?._id && selectedUser._id !== currentUserId) {
      setCurrentUserId(selectedUser._id);
      setIsInitialLoad(true);

      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [selectedUser?._id, currentUserId]);

  useEffect(() => {
    if (messages.length === 0) return;

    if (isInitialLoad && messages.length > 0) {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;

          setShowScrollToBottomButton(false);
        }
        setIsInitialLoad(false);
      }, 50);
    }
  }, [messages.length, isInitialLoad]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", throttledHandleScroll, {
        passive: true,
      });
      return () =>
        container.removeEventListener("scroll", throttledHandleScroll);
    }
  }, [throttledHandleScroll]);

  const renderMessage = (message) => (
    <div
      key={message._id}
      className={`chat ${
        message.senderId === authUser._id ? "chat-end" : "chat-start"
      }`}
    >
      <div className="chat-image avatar">
        <div className="size-10 rounded-full border">
          <img
            src={
              message.senderId === authUser._id
                ? authUser.profilePic || "/message-emoji.svg"
                : selectedUser.profilePic || "/message-emoji.svg"
            }
            alt="profile pic"
            loading="lazy"
          />
        </div>
      </div>
      <div className="chat-header mb-1">
        <time className="text-xs opacity-50 ml-1">
          {formatMessageTime(message.createdAt)}
        </time>
      </div>
      <div className="chat-bubble flex flex-col">
        {message.image && (
          <img
            src={message.image}
            alt="Attachment"
            className="sm:max-w-[200px] rounded-md mb-2"
            loading="lazy"
          />
        )}
        {message.text && <p>{message.text}</p>}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* 无感加载指示器 - 只在顶部显示 */}
      {isLoadingMore && (
        <div className="flex justify-center py-2 bg-base-100/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm">
            <span className="loading loading-spinner loading-sm"></span>
            <span>正在加载历史消息...</span>
          </div>
        </div>
      )}

      {/* 消息容器 */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 chat-messages-container transition-opacity duration-200"
        style={{
          opacity: isInitialLoad && messages.length === 0 ? 0.5 : 1,
        }}
      >
        {/* 渲染可见消息 */}
        {visibleMessages.map((message) => renderMessage(message))}
      </div>

      {/* 滚动到底部按钮 - 只在不在底部时显示 */}
      {showScrollToBottomButton && (
        <button
          className="btn btn-circle btn-primary shadow-lg fixed bottom-24 right-6 z-10 transition-all duration-300 ease-in-out"
          onClick={scrollToBottom}
          title="滚动到最新消息"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

OptimizedMessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      senderId: PropTypes.string.isRequired,
      text: PropTypes.string,
      image: PropTypes.string,
      createdAt: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedUser: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    profilePic: PropTypes.string,
  }).isRequired,
  onLoadMore: PropTypes.func.isRequired,
  hasNextPage: PropTypes.bool.isRequired,
  isLoadingMore: PropTypes.bool.isRequired,
};

export default OptimizedMessageList;
