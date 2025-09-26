/**
 * 多媒体平台跳转工具函数
 * 提供一键跳转到各大美食平台搜索相关菜谱的功能
 */

export interface MultimediaPlatform {
  name: string
  baseUrl: string
  searchPath: string
  icon: string
  description: string
  color: string
}

// 支持的多媒体平台配置
export const MULTIMEDIA_PLATFORMS: Record<string, MultimediaPlatform> = {
  bilibili: {
    name: '哔哩哔哩',
    baseUrl: 'https://search.bilibili.com',
    searchPath: '/all?keyword=',
    icon: '📺',
    description: '观看烹饪视频',
    color: '#00A1D6',
  },
  douyin: {
    name: '抖音',
    baseUrl: 'https://www.douyin.com',
    searchPath: '/search/',
    icon: '📱',
    description: '短视频教程',
    color: '#FF0050',
  },
  xiachufang: {
    name: '下厨房',
    baseUrl: 'https://www.xiachufang.com',
    searchPath: '/search/?keyword=',
    icon: '🥘',
    description: '详细图文教程',
    color: '#7CB342',
  },
  meishitianxia: {
    name: '美食天下',
    baseUrl: 'https://home.meishichina.com',
    searchPath: '/search/',
    icon: '🍜',
    description: '更多菜谱变化',
    color: '#FF6B35',
  },
  xiaohongshu: {
    name: '小红书',
    baseUrl: 'https://www.xiaohongshu.com',
    searchPath: '/search_result?keyword=',
    icon: '📔',
    description: '用户分享心得',
    color: '#FF2442',
  },
  douguo: {
    name: '豆果美食',
    baseUrl: 'https://www.douguo.com',
    searchPath: '/caipu/',
    icon: '🥄',
    description: '专业烹饪指导',
    color: '#FFA726',
  },
}

/**
 * 生成搜索关键词
 * @param recipeName 菜谱名称
 * @param platform 平台类型
 * @returns 搜索关键词
 */
export function generateSearchKeyword(recipeName: string, platform: string): string {
  const baseKeyword = recipeName.trim()

  switch (platform) {
    case 'bilibili':
      return `${baseKeyword} 制作方法 烹饪教程`
    case 'douyin':
      return `${baseKeyword} 制作`
    case 'xiaohongshu':
      return `${baseKeyword} 制作`
    default:
      return baseKeyword
  }
}

/**
 * 跳转到指定平台搜索菜谱
 * @param platform 平台标识
 * @param recipeName 菜谱名称
 * @param options 跳转选项
 */
export function jumpToMultimediaPlatform(
  platform: string,
  recipeName: string,
  options: {
    newTab?: boolean
    trackEvent?: (platform: string, recipeName: string) => void
  } = {}
): void {
  const { newTab = true, trackEvent } = options

  const platformConfig = MULTIMEDIA_PLATFORMS[platform]
  if (!platformConfig) {
    console.warn(`不支持的平台: ${platform}`)
    return
  }

  // 生成搜索关键词
  const keyword = generateSearchKeyword(recipeName, platform)
  const encodedKeyword = encodeURIComponent(keyword)

  // 构建完整URL
  const fullUrl = `${platformConfig.baseUrl}${platformConfig.searchPath}${encodedKeyword}`

  // 记录跳转事件（用于数据分析）
  if (trackEvent) {
    trackEvent(platform, recipeName)
  }

  // 执行跳转
  if (newTab) {
    window.open(fullUrl, '_blank', 'noopener,noreferrer')
  } else {
    window.location.href = fullUrl
  }
}

/**
 * 批量生成平台跳转链接
 * @param recipeName 菜谱名称
 * @returns 平台链接映射
 */
export function generateMultimediaLinks(recipeName: string): Record<string, string> {
  const links: Record<string, string> = {}

  Object.keys(MULTIMEDIA_PLATFORMS).forEach(platform => {
    const config = MULTIMEDIA_PLATFORMS[platform]
    const keyword = generateSearchKeyword(recipeName, platform)
    const encodedKeyword = encodeURIComponent(keyword)
    links[platform] = `${config.baseUrl}${config.searchPath}${encodedKeyword}`
  })

  return links
}

/**
 * 获取平台配置信息
 * @param platform 平台标识
 * @returns 平台配置
 */
export function getPlatformConfig(platform: string): MultimediaPlatform | null {
  return MULTIMEDIA_PLATFORMS[platform] || null
}

/**
 * 获取所有支持的平台列表
 * @returns 平台列表
 */
export function getAllPlatforms(): MultimediaPlatform[] {
  return Object.values(MULTIMEDIA_PLATFORMS)
}
