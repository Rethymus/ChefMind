// ChefMind 智食谱 - API缓存工具

/**
 * 内存缓存对象
 */
interface CacheItem<T> {
  data: T;
  expiry: number;
}

/**
 * 缓存存储
 */
const cache: Record<string, CacheItem<any>> = {};

/**
 * 设置缓存数据
 * @param key 缓存键
 * @param data 要缓存的数据
 * @param ttl 过期时间（毫秒）
 */
export function setCachedData<T>(key: string, data: T, ttl: number): void {
  cache[key] = {
    data,
    expiry: Date.now() + ttl
  };
}

/**
 * 获取缓存数据
 * @param key 缓存键
 * @returns 缓存的数据，如果不存在或已过期则返回null
 */
export function getCachedData<T>(key: string): T | null {
  const item = cache[key];
  
  if (!item) {
    return null;
  }
  
  // 检查是否过期
  if (Date.now() > item.expiry) {
    // 删除过期项
    delete cache[key];
    return null;
  }
  
  return item.data as T;
}

/**
 * 清除特定缓存
 * @param key 缓存键
 */
export function clearCache(key: string): void {
  delete cache[key];
}

/**
 * 清除所有缓存
 */
export function clearAllCache(): void {
  Object.keys(cache).forEach(key => {
    delete cache[key];
  });
}

/**
 * 获取所有缓存键
 * @returns 缓存键数组
 */
export function getCacheKeys(): string[] {
  return Object.keys(cache);
}

/**
 * 获取缓存统计信息
 * @returns 缓存统计信息
 */
export function getCacheStats(): { totalItems: number, validItems: number, expiredItems: number } {
  const now = Date.now();
  const keys = Object.keys(cache);
  const totalItems = keys.length;
  const expiredItems = keys.filter(key => cache[key].expiry < now).length;
  const validItems = totalItems - expiredItems;
  
  return {
    totalItems,
    validItems,
    expiredItems
  };
}