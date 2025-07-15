import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { messageCacheManager } from "../lib/messageCache";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isLoadingMoreMessages: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalMessages: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 50,
  },
  // 移除旧的缓存实现，使用新的缓存管理器

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      // 如果是认证错误，不显示错误提示（axios拦截器会处理）
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "获取用户列表失败");
      }
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId, page = 1, limit = 50) => {
    // If we're loading the first page, show loading indicator
    if (page === 1) {
      set({ isMessagesLoading: true });
    } else {
      set({ isLoadingMoreMessages: true });
    }

    try {
      const cachedData = messageCacheManager.get(userId, page, limit);

      if (cachedData) {
        // 检查用户是否已经切换，防止竞态条件
        const currentState = get();
        if (currentState.selectedUser?._id !== userId) {
          return;
        }

        // Use cached data
        if (page === 1) {
          set({
            messages: cachedData.messages,
            pagination: cachedData.pagination,
          });
        } else {
          // If loading more, prepend to existing messages (无感加载)
          set((state) => ({
            messages: [...cachedData.messages, ...state.messages],
            pagination: {
              ...cachedData.pagination,
              currentPage: Math.max(
                state.pagination.currentPage,
                cachedData.pagination.currentPage
              ),
            },
          }));
        }
      } else {
        const res = await axiosInstance.get(
          `/messages/${userId}?page=${page}&limit=${limit}`
        );

        // 检查用户是否已经切换，防止竞态条件
        const currentState = get();
        if (currentState.selectedUser?._id !== userId) {
          return;
        }

        messageCacheManager.set(userId, page, limit, res.data);

        if (page === 1) {
          // If it's the first page, replace all messages
          set({
            messages: res.data.messages,
            pagination: res.data.pagination,
          });
        } else {
          set((state) => ({
            messages: [...res.data.messages, ...state.messages],
            pagination: {
              ...res.data.pagination,
              currentPage: Math.max(
                state.pagination.currentPage,
                res.data.pagination.currentPage
              ),
            },
          }));
        }

        // 智能预加载：只在加载前几页时预加载下一页
        if (res.data.pagination.hasNextPage && page <= 3) {
          messageCacheManager.preloadNextPage(
            userId,
            page,
            limit,
            async (uid, p, l) => {
              const response = await axiosInstance.get(
                `/messages/${uid}?page=${p}&limit=${l}`
              );
              return response.data;
            }
          );
        }
      }
    } catch (error) {
      // 检查用户是否已经切换，防止错误状态应用到错误的用户
      const currentState = get();
      if (currentState.selectedUser?._id !== userId) {
        return;
      }

      // 如果是认证错误，不显示错误提示（axios拦截器会处理）
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "获取消息失败");
      }
    } finally {
      // 只有在用户没有切换的情况下才更新加载状态
      const currentState = get();
      if (currentState.selectedUser?._id === userId) {
        if (page === 1) {
          set({ isMessagesLoading: false });
        } else {
          set({ isLoadingMoreMessages: false });
        }
      }
    }
  },

  loadMoreMessages: async () => {
    const { pagination, selectedUser } = get();

    if (pagination.hasNextPage) {
      const nextPage = pagination.currentPage + 1;
      await get().getMessages(selectedUser._id, nextPage, pagination.limit);
    }
  },

  getLatestMessages: async (userId, limit = 20) => {
    try {
      const res = await axiosInstance.get(
        `/messages/latest/${userId}?limit=${limit}`
      );
      return res.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load latest messages"
      );
      return [];
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      // 更新本地消息列表
      set({ messages: [...messages, res.data] });

      // 更新缓存中的消息
      messageCacheManager.updateWithNewMessage(selectedUser._id, res.data);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const updatedMessages = [...get().messages, newMessage];
      set({ messages: updatedMessages });

      messageCacheManager.updateWithNewMessage(selectedUser._id, newMessage);
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: async (selectedUser) => {
    const currentSelectedUser = get().selectedUser;

    if (currentSelectedUser?._id === selectedUser?._id) {
      return;
    }

    if (selectedUser === null) {
      console.log("Setting selected user to null");
      set({
        selectedUser: null,
        messages: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalMessages: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 50,
        },
        isMessagesLoading: false,
      });
      return;
    }

    console.log(
      "Setting selected user:",
      selectedUser.fullName,
      selectedUser._id
    );

    // 先检查是否有缓存的消息数据
    const cachedData = messageCacheManager.get(selectedUser._id, 1, 50);
    console.log("Cached data found:", !!cachedData);

    if (cachedData) {
      // 如果有缓存，立即设置用户和消息，避免闪烁
      console.log(
        "Using cached data, messages count:",
        cachedData.messages.length
      );
      set({
        selectedUser,
        messages: cachedData.messages,
        pagination: cachedData.pagination,
        isMessagesLoading: false, // 确保加载状态被重置
      });
    } else {
      // 如果没有缓存，立即清空消息并显示加载状态
      console.log("No cached data, loading from API...");
      set({
        selectedUser,
        messages: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalMessages: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 50,
        },
        isMessagesLoading: true,
      });

      const targetUserId = selectedUser._id;

      try {
        console.log("Fetching messages for user:", targetUserId);
        const res = await axiosInstance.get(
          `/messages/${targetUserId}?page=1&limit=50`
        );

        // 检查用户是否已经切换到其他用户，防止竞态条件
        const currentState = get();
        if (currentState.selectedUser?._id !== targetUserId) {
          console.log("User switched, ignoring response for:", targetUserId);
          return;
        }

        console.log(
          "API response received, messages count:",
          res.data.messages.length
        );

        messageCacheManager.set(targetUserId, 1, 50, res.data);

        set({
          messages: res.data.messages,
          pagination: res.data.pagination,
          isMessagesLoading: false,
        });

        console.log("Messages loaded successfully");

        if (res.data.pagination.hasNextPage) {
          messageCacheManager.preloadNextPage(
            targetUserId,
            1,
            50,
            async (uid, p, l) => {
              const response = await axiosInstance.get(
                `/messages/${uid}?page=${p}&limit=${l}`
              );
              return response.data;
            }
          );
        }
      } catch (error) {
        console.error("Error loading messages:", error);

        // 再次检查用户是否已经切换，防止错误状态应用到错误的用户
        const currentState = get();
        if (currentState.selectedUser?._id !== targetUserId) {
          return;
        }

        set({
          messages: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalMessages: 0,
            hasNextPage: false,
            hasPrevPage: false,
            limit: 50,
          },
          isMessagesLoading: false,
        });

        if (error.response?.status !== 401) {
          toast.error(error.response?.data?.message || "获取消息失败");
        }
      }
    }
  },

  clearMessageCache: () => {
    messageCacheManager.clearAll();
  },

  clearUserMessageCache: (userId) => {
    messageCacheManager.clearUserCache(userId);
  },
}));
