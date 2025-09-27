/**
 * ID生成器工具类
 * 提供生成唯一ID的功能
 */

/**
 * 生成唯一ID
 * @param prefix ID前缀
 * @returns 唯一ID
 */
function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `${prefix}${timestamp}${randomStr}`
}

/**
 * 生成数字ID
 * @returns 数字ID
 */
function generateNumericId(): number {
  return Math.floor(Math.random() * 1000000) + 1
}

/**
 * 生成UUID
 * @returns UUID字符串
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 生成短ID
 * @returns 短ID字符串
 */
function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10)
}

/**
 * 生成有序ID
 * 基于时间戳和计数器生成有序ID
 */
const generateSequentialId = (() => {
  let counter = 0
  let lastTimestamp = 0

  return (prefix: string = ''): string => {
    const timestamp = Date.now()

    // 如果是同一毫秒内，增加计数器
    if (timestamp === lastTimestamp) {
      counter++
    } else {
      // 不同毫秒，重置计数器
      counter = 0
      lastTimestamp = timestamp
    }

    // 组合时间戳和计数器
    return `${prefix}${timestamp.toString(36)}-${counter.toString(36)}`
  }
})()
