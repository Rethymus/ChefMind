import { describe, it, expect, beforeEach } from 'vitest'
import apiCache from '@/utils/apiCache'

describe('ApiCache', () => {
  beforeEach(() => {
    // 清空缓存
    apiCache.clear()
  })

  it('应该能够设置和获取缓存', () => {
    const key = 'test-key'
    const value = { data: 'test-data' }
    
    apiCache.set(key, value, 5000) // 5秒过期
    const cached = apiCache.get(key)
    
    expect(cached).toEqual(value)
  })

  it('应该在过期后返回null', async () => {
    const key = 'expire-test'
    const value = { data: 'test-data' }
    
    apiCache.set(key, value, 100) // 100ms过期
    
    // 等待过期
    await new Promise(resolve => setTimeout(resolve, 150))
    
    const cached = apiCache.get(key)
    expect(cached).toBeNull()
  })

  it('应该能够删除缓存', () => {
    const key = 'delete-test'
    const value = { data: 'test-data' }
    
    apiCache.set(key, value, 5000)
    expect(apiCache.get(key)).toEqual(value)
    
    apiCache.delete(key)
    expect(apiCache.get(key)).toBeNull()
  })

  it('应该能够清空所有缓存', () => {
    apiCache.set('key1', 'value1', 5000)
    apiCache.set('key2', 'value2', 5000)
    
    expect(apiCache.get('key1')).toBe('value1')
    expect(apiCache.get('key2')).toBe('value2')
    
    apiCache.clear()
    
    expect(apiCache.get('key1')).toBeNull()
    expect(apiCache.get('key2')).toBeNull()
  })

  it('应该正确处理不存在的key', () => {
    const nonExistentKey = 'non-existent-key'
    expect(apiCache.get(nonExistentKey)).toBeNull()
  })
})
