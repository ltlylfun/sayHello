/**
 * 消息缓存管理器
 * 提供智能缓存策略，避免重复加载已获取的消息
 */
class MessageCacheManager {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100;
    this.maxMessageAge = 5 * 60 * 1000;
  }

  generateKey(userId, page, limit) {
    return `${userId}_${page}_${limit}`;
  }

  get(userId, page, limit) {
    const key = this.generateKey(userId, page, limit);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    if (Date.now() - cached.timestamp > this.maxMessageAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(userId, page, limit, data) {
    const key = this.generateKey(userId, page, limit);

    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clearUserCache(userId) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${userId}_`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  clearAll() {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      keys: Array.from(this.cache.keys()),
    };
  }

  async preloadNextPage(userId, currentPage, limit, loadFunction) {
    const nextPage = currentPage + 1;
    const key = this.generateKey(userId, nextPage, limit);

    if (!this.cache.has(key)) {
      try {
        const data = await loadFunction(userId, nextPage, limit);
        this.set(userId, nextPage, limit, data);
      } catch (error) {
        console.warn("Failed to preload next page:", error);
      }
    }
  }

  updateWithNewMessage(userId, newMessage) {
    const firstPageKey = this.generateKey(userId, 1, 50);
    const cached = this.cache.get(firstPageKey);

    if (cached) {
      const updatedData = {
        ...cached.data,
        messages: [...cached.data.messages, newMessage],
        pagination: {
          ...cached.data.pagination,
          totalMessages: cached.data.pagination.totalMessages + 1,
        },
      };

      this.cache.set(firstPageKey, {
        data: updatedData,
        timestamp: Date.now(),
      });
    }
  }

  shouldRefresh(userId, page, limit) {
    const cached = this.get(userId, page, limit);
    return !cached;
  }
}

export const messageCacheManager = new MessageCacheManager();

export const useMessageCache = () => {
  return {
    get: messageCacheManager.get.bind(messageCacheManager),
    set: messageCacheManager.set.bind(messageCacheManager),
    clearUserCache:
      messageCacheManager.clearUserCache.bind(messageCacheManager),
    clearAll: messageCacheManager.clearAll.bind(messageCacheManager),
    getStats: messageCacheManager.getStats.bind(messageCacheManager),
    preloadNextPage:
      messageCacheManager.preloadNextPage.bind(messageCacheManager),
    updateWithNewMessage:
      messageCacheManager.updateWithNewMessage.bind(messageCacheManager),
    shouldRefresh: messageCacheManager.shouldRefresh.bind(messageCacheManager),
  };
};

export default messageCacheManager;
