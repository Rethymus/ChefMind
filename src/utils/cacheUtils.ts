/**
 * 缓存工具类
 */

// 内存缓存对象
const memoryCache: Record<string, { data: any; expiry: number }> = {};

/**
 * 将数据存储到缓存中
 * @param key 缓存键
 * @param data 要缓存的数据
 * @param ttlSeconds 缓存有效期（秒）
 */
export function cacheData<T>(key: string, data: T, ttlSeconds: number = 3600): void {
  const expiry = Date.now() + ttlSeconds * 1000;
  memoryCache[key] = { data, expiry };
  
  // 同时存储到localStorage
  try {
    localStorage.setItem(
      `cache_${key}`,
      JSON.stringify({
        data,
        expiry
      })
    );
  } catch (e) {
    console.warn('无法存储到localStorage:', e);
  }
}

/**
 * 从缓存中获取数据
 * @param key 缓存键
 * @returns 缓存的数据，如果不存在或已过期则返回null
 */
export function getCachedData<T>(key: string): T | null {
  // 首先检查内存缓存
  const memItem = memoryCache[key];
  if (memItem && memItem.expiry > Date.now()) {
    return memItem.data as T;
  }
  
  // 如果内存缓存不存在或已过期，检查localStorage
  try {
    const item = localStorage.getItem(`cache_${key}`);
    if (item) {
      const parsed = JSON.parse(item);
      if (parsed.expiry > Date.now()) {
        // 恢复到内存缓存
        memoryCache[key] = parsed;
        return parsed.data as T;
      } else {
        // 已过期，删除
        localStorage.removeItem(`cache_${key}`);
      }
    }
  } catch (e) {
    console.warn('从localStorage获取缓存失败:', e);
  }
  
  return null;
}

/**
 * 清除指定的缓存
 * @param key 缓存键
 */
export function clearCache(key: string): void {
  delete memoryCache[key];
  try {
    localStorage.removeItem(`cache_${key}`);
  } catch (e) {
    console.warn('清除localStorage缓存失败:', e);
  }
}

/**
 * 清除所有缓存
 */
export function clearAllCache(): void {
  // 清除内存缓存
  Object.keys(memoryCache).forEach(key => {
    delete memoryCache[key];
  });
  
  // 清除localStorage中的所有缓存
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (e) {
    console.warn('清除所有localStorage缓存失败:', e);
  }
}