// ChefMind 智食谱 - 性能优化工具

import { DirectiveBinding } from 'vue'

/**
 * 图片懒加载指令
 * 使用方法：v-lazy="图片URL"
 */
export const lazyLoadDirective = {
  mounted(el: HTMLImageElement, binding: DirectiveBinding<string>) {
    function loadImage() {
      const imageElement = Array.from(el.children).find(el => el.nodeName === 'IMG') as
        | HTMLImageElement
        | undefined

      if (imageElement) {
        imageElement.addEventListener('load', () => {
          setTimeout(() => el.classList.add('loaded'), 100)
        })
        imageElement.addEventListener('error', () => {})
        imageElement.src = binding.value
      }
    }

    function handleIntersect(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadImage()
          observer.unobserve(el)
        }
      })
    }

    function createObserver() {
      const options = {
        root: null,
        threshold: 0,
        rootMargin: '0px 0px 100px 0px',
      }
      const observer = new IntersectionObserver(handleIntersect, options)
      observer.observe(el)
    }

    if (window.IntersectionObserver) {
      createObserver()
    } else {
      loadImage()
    }
  },
}

/**
 * 图片加载优化
 * @param url 图片URL
 * @param quality 图片质量（0-100）
 * @param width 图片宽度
 * @param height 图片高度
 * @returns 优化后的图片URL
 */
export function optimizeImage(
  url: string,
  quality: number = 80,
  width?: number,
  height?: number
): string {
  // 如果是Unsplash图片，使用其API进行优化
  if (url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0]
    let params = `?q=${quality}`

    if (width) {
      params += `&w=${width}`
    }

    if (height) {
      params += `&h=${height}`
    }

    params += '&auto=format'

    return `${baseUrl}${params}`
  }

  // 如果是本地图片，直接返回
  return url
}

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: number | null = null

  return function (this: unknown, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer)
    }

    timer = window.setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param limit 时间限制（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true

      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 缓存函数结果
 * @param fn 要缓存的函数
 * @returns 缓存后的函数
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map()

  return function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = fn.apply(this, args)
    cache.set(key, result)

    return result
  }
}

/**
 * 本地存储缓存
 */
export class CacheStorage {
  private prefix: string

  constructor(prefix: string = 'chefmind_') {
    this.prefix = prefix
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param expiry 过期时间（毫秒），默认为1天
   */
  set(key: string, value: unknown, expiry: number = 24 * 60 * 60 * 1000): void {
    const item = {
      value,
      expiry: Date.now() + expiry,
    }

    localStorage.setItem(this.prefix + key, JSON.stringify(item))
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存值，如果不存在或已过期则返回null
   */
  get(key: string): unknown {
    const itemStr = localStorage.getItem(this.prefix + key)

    if (!itemStr) {
      return null
    }

    const item = JSON.parse(itemStr)

    if (Date.now() > item.expiry) {
      this.remove(key)
      return null
    }

    return item.value
  }

  /**
   * 移除缓存
   * @param key 缓存键
   */
  remove(key: string): void {
    localStorage.removeItem(this.prefix + key)
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)

      if (key && key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    }
  }
}

// 导出缓存实例
export const cache = new CacheStorage()

/**
 * 注册Service Worker用于缓存和离线访问
 */
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {})
        .catch(registrationError => {})
    })
  }
}
