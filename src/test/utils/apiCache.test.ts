import { describe, it, expect, beforeEach } from 'vitest'
import { setCachedData, getCachedData, clearAllCache, clearCache } from '@/utils/apiCache'

describe('ApiCache', () => {
  beforeEach(() => {
    // 清空缓存
    clearAllCache()
  })

  it('应该能够设置和获取缓存', () => {
    const key = 'test-key'
    const value = { data: 'test-data' }

    setCachedData(key, value, 5000) // 5秒过期
    const cached = getCachedData(key)

    expect(cached).toEqual(value)
  })

  it('应该在过期后返回null', async () => {
    const key = 'expire-test'
    const value = { data: 'test-data' }

    setCachedData(key, value, 100) // 100ms过期

    // 等待过期
    await new Promise(resolve => setTimeout(resolve, 150))

    const cached = getCachedData(key)
    expect(cached).toBeNull()
  })

  it('应该能够删除缓存', () => {
    const key = 'delete-test'
    const value = { data: 'test-data' }

    setCachedData(key, value, 5000)
    expect(getCachedData(key)).toEqual(value)

    clearCache(key)
    expect(getCachedData(key)).toBeNull()
  })

  it('应该能够清空所有缓存', () => {
    setCachedData('key1', 'value1', 5000)
    setCachedData('key2', 'value2', 5000)

    expect(getCachedData('key1')).toBe('value1')
    expect(getCachedData('key2')).toBe('value2')

    clearAllCache()

    expect(getCachedData('key1')).toBeNull()
    expect(getCachedData('key2')).toBeNull()
  })

  it('应该正确处理不存在的key', () => {
    const nonExistentKey = 'non-existent-key'
    expect(getCachedData(nonExistentKey)).toBeNull()
  })
})
