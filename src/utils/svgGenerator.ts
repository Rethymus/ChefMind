/**
 * SVG 菜谱封面生成工具
 * 基于封面生成器页面的功能，为搜索和AI页面提供统一的SVG生成
 *
 * 字体说明：
 * - 使用跨平台兼容字体，确保在Linux和Windows上都能正常显示
 * - Arial: 通用的英文字体，支持中文基本字符
 * - Noto Sans: Google开发的开源字体，支持多种语言
 * - DejaVu Sans: 开源字体，广泛支持Unicode字符
 * - WenQuanYi Micro Hei: Linux系统下的中文字体
 * - Droid Sans Fallback: Android系统的后备字体，也广泛用于Linux
 * - sans-serif: 最终的后备字体
 */

// 字体颜色调色板（排除黑色和白色）
export const textColorPalette = [
  '#f39c12', // 橙色
  '#e74c3c', // 红色
  '#8b4513', // 棕色
  '#c0392b', // 深红色
  '#3498db', // 蓝色
  '#27ae60', // 绿色
  '#9b59b6', // 紫色
  '#e67e22', // 深橙色
  '#2c3e50', // 深蓝色
  '#16a085', // 青绿色
  '#d35400', // 深橙红
  '#8e44ad', // 深紫色
  '#2980b9', // 深蓝色
  '#f1c40f', // 黄色
  '#e91e63', // 粉红色
  '#ff5722', // 深橙色
  '#795548', // 棕色
  '#607d8b', // 蓝灰色
  '#ff9800', // 琥珀色
  '#4caf50', // 浅绿色
  '#9c27b0', // 深紫色
  '#00bcd4', // 青色
  '#ff6f00', // 橙黄色
  '#1976d2', // 蓝色
  '#388e3c', // 深绿色
]

// 中文菜名到英文名称的映射
const chineseToEnglishRecipeNames: Record<string, string> = {
  // 川菜
  '宫保鸡丁': 'Kung Pao Chicken',
  '麻婆豆腐': 'Mapo Tofu',
  '水煮鱼': 'Sichuan Boiled Fish',
  '回锅肉': 'Twice-Cooked Pork',
  '鱼香肉丝': 'Yu-Shiang Shredded Pork',
  '口水鸡': 'Drool Chicken',
  
  // 粤菜
  '白切鸡': 'White Cut Chicken',
  '叉烧': 'Char Siu',
  '糖醋里脊': 'Sweet and Sour Pork',
  '蒸蛋羹': 'Steamed Egg Custard',
  '广式点心': 'Cantonese Dim Sum',
  
  // 家常菜
  '番茄鸡蛋面': 'Tomato Egg Noodles',
  '红烧肉': 'Braised Pork Belly',
  '糖醋排骨': 'Sweet and Sour Ribs',
  '青椒土豆丝': 'Shredded Potato with Green Pepper',
  '蒜蓉白菜': 'Garlic Bok Choy',
  '西红柿炒鸡蛋': 'Scrambled Eggs with Tomatoes',
  '土豆丝': 'Shredded Potatoes',
  
  // 汤品
  '紫菜蛋花汤': 'Seaweed Egg Drop Soup',
  '冬瓜汤': 'Winter Melon Soup',
  '银耳莲子汤': 'White Fungus Lotus Seed Soup',
  '热高桃胶银耳糖水': 'Peach Gum White Fungus Sweet Soup',
  '银耳糖水': 'White Fungus Sweet Soup',
  '莲子汤': 'Lotus Seed Soup',
  
  // 面食
  '兰州拉面': 'Lanzhou Ramen',
  '刀削面': 'Dao Xiao Noodles',
  '饺子': 'Dumplings',
  '包子': 'Steamed Buns',
  '馄饨': 'Wontons',
  
  // 甜品
  '红豆沙': 'Red Bean Paste',
  '绿豆糕': 'Mung Bean Cake',
  '芝麻汤圆': 'Sesame Tangyuan',
  '豆花': 'Tofu Pudding',
  
  // 其他常见菜
  '清蒸鱼': 'Steamed Fish',
  '红烧鱼': 'Braised Fish',
  '蒸蛋': 'Steamed Eggs',
  '炒年糕': 'Stir-fried Rice Cakes',
  '春卷': 'Spring Rolls',
  '锅贴': 'Potstickers',
  '小笼包': 'Xiaolongbao',
  '煎饼': 'Chinese Pancake',
  '油条': 'Chinese Cruller',
  '豆浆': 'Soy Milk'
}

// 根据中文菜名获取英文名称
export const getEnglishRecipeName = (chineseName: string): string => {
  // 直接匹配
  if (chineseToEnglishRecipeNames[chineseName]) {
    return chineseToEnglishRecipeNames[chineseName]
  }
  
  // 模糊匹配 - 检查是否包含关键词
  for (const [chinese, english] of Object.entries(chineseToEnglishRecipeNames)) {
    if (chineseName.includes(chinese) || chinese.includes(chineseName)) {
      return english
    }
  }
  
  // 根据菜名特征推断
  if (chineseName.includes('汤') || chineseName.includes('糖水')) {
    return 'Chinese Soup'
  } else if (chineseName.includes('面') || chineseName.includes('粉')) {
    return 'Chinese Noodles'
  } else if (chineseName.includes('饭') || chineseName.includes('粥')) {
    return 'Chinese Rice'
  } else if (chineseName.includes('鸡')) {
    return 'Chicken Dish'
  } else if (chineseName.includes('鱼')) {
    return 'Fish Dish'
  } else if (chineseName.includes('肉') || chineseName.includes('猪')) {
    return 'Pork Dish'
  } else if (chineseName.includes('蛋')) {
    return 'Egg Dish'
  } else if (chineseName.includes('豆腐')) {
    return 'Tofu Dish'
  } else if (chineseName.includes('菜') || chineseName.includes('蔬')) {
    return 'Vegetable Dish'
  }
  
  // 默认返回
  return 'Chinese Delicacy'
}

// SVG配置接口
export interface SvgConfig {
  name: string
  width?: number
  height?: number
  backgroundColor?: string
  subtitle?: string
  borderRadius?: string // 新增圆角配置
}

// 获取随机字体颜色
export const getRandomTextColor = (): string => {
  return textColorPalette[Math.floor(Math.random() * textColorPalette.length)]
}

// 基于菜名生成一致的字体颜色（确保相同菜名总是生成相同颜色）
export const getConsistentTextColor = (name: string): string => {
  if (!name) return textColorPalette[0]
  
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  
  const index = Math.abs(hash) % textColorPalette.length
  return textColorPalette[index]
}

// 生成标准尺寸的SVG封面
export const generateRecipeCoverSvg = (config: SvgConfig): string => {
  const {
    name,
    width = 400,
    height = 300,
    subtitle
  } = config

  // 动态生成英文副标题，如果没有提供的话
  const englishSubtitle = subtitle || getEnglishRecipeName(name)

  // 基于菜名生成一致的字体颜色
  const textColor = getConsistentTextColor(name)

  const fontSize = Math.max(16, Math.min(32, width / 15))
  const subtitleSize = Math.max(12, Math.min(18, width / 25))

  // 生成毛玻璃效果的SVG
  const safeId = name.replace(/[^a-zA-Z0-9]/g, '')
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="display: block; border: none; outline: none; margin: 0; padding: 0; background: transparent;">
  <defs>
    <!-- 毛玻璃效果滤镜 -->
    <filter id="glass-${safeId}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.95  0 1 0 0 0.95  0 0 1 0 0.95  0 0 0 0.4 0" result="tint"/>
      <feComposite in="tint" in2="SourceGraphic" operator="over"/>
    </filter>
    <!-- 毛玻璃半透明白色背景 -->
    <linearGradient id="glassGradient-${safeId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.5);stop-opacity:1" />
      <stop offset="50%" style="stop-color:rgba(255,255,255,0.3);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(255,255,255,0.2);stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- 毛玻璃背景层 -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#glassGradient-${safeId})" filter="url(#glass-${safeId})" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
  <!-- 文字内容 - 使用基于菜名的一致性颜色 -->
  <text x="${width / 2}" y="${height / 2 - 10}" text-anchor="middle" font-family="Arial, 'Noto Sans', 'DejaVu Sans', 'WenQuanYi Micro Hei', 'Droid Sans Fallback', sans-serif" font-size="${fontSize}" font-weight="bold" fill="${textColor}" style="text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${name}</text>
  <text x="${width / 2}" y="${height / 2 + 25}" text-anchor="middle" font-family="Arial, 'Noto Sans', 'DejaVu Sans', sans-serif" font-size="${subtitleSize}" fill="${textColor}" opacity="0.8" style="text-shadow: 0 1px 3px rgba(0,0,0,0.2);">${englishSubtitle}</text>
</svg>`
}

// 生成随机颜色的SVG封面
export const generateRandomRecipeCoverSvg = (config: SvgConfig): string => {
  // 对于随机颜色版本，我们临时修改配置以使用随机字体颜色
  const modifiedConfig = { ...config }
  const randomTextColor = getRandomTextColor()
  const uniqueId = Math.random().toString(36).substring(2, 11)
  
  const {
    name,
    width = 400,
    height = 300,
    subtitle
  } = modifiedConfig

  // 动态生成英文副标题，如果没有提供的话
  const englishSubtitle = subtitle || getEnglishRecipeName(name)

  const fontSize = Math.max(16, Math.min(32, width / 15))
  const subtitleSize = Math.max(12, Math.min(18, width / 25))

  // 生成毛玻璃效果的SVG，使用随机字体颜色
  const safeId = `random-${uniqueId}`
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="display: block; border: none; outline: none; margin: 0; padding: 0; background: transparent;">
  <defs>
    <!-- 毛玻璃效果滤镜 -->
    <filter id="glass-${safeId}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.95  0 1 0 0 0.95  0 0 1 0 0.95  0 0 0 0.4 0" result="tint"/>
      <feComposite in="tint" in2="SourceGraphic" operator="over"/>
    </filter>
    <!-- 毛玻璃半透明白色背景 -->
    <linearGradient id="glassGradient-${safeId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.5);stop-opacity:1" />
      <stop offset="50%" style="stop-color:rgba(255,255,255,0.3);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(255,255,255,0.2);stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- 毛玻璃背景层 -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#glassGradient-${safeId})" filter="url(#glass-${safeId})" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
  <!-- 文字内容 - 使用随机颜色 -->
  <text x="${width / 2}" y="${height / 2 - 10}" text-anchor="middle" font-family="Arial, 'Noto Sans', 'DejaVu Sans', 'WenQuanYi Micro Hei', 'Droid Sans Fallback', sans-serif" font-size="${fontSize}" font-weight="bold" fill="${randomTextColor}" style="text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${name}</text>
  <text x="${width / 2}" y="${height / 2 + 25}" text-anchor="middle" font-family="Arial, 'Noto Sans', 'DejaVu Sans', sans-serif" font-size="${subtitleSize}" fill="${randomTextColor}" opacity="0.8" style="text-shadow: 0 1px 3px rgba(0,0,0,0.2);">${englishSubtitle}</text>
</svg>`
}

// 预设尺寸
export const PRESET_SIZES = {
  small: { width: 200, height: 150 },
  medium: { width: 300, height: 225 },
  large: { width: 400, height: 300 },
  xlarge: { width: 500, height: 375 }
}

// 为菜谱卡片生成合适尺寸的SVG
export const generateRecipeCardSvg = (recipeName: string, size: 'small' | 'medium' | 'large' | 'xlarge' = 'medium'): string => {
  const dimensions = PRESET_SIZES[size]
  return generateRecipeCoverSvg({
    name: recipeName,
    ...dimensions,
    borderRadius: '16px 16px 0 0' // 搜索页面卡片圆角
  })
}

// 为AI推荐卡片生成SVG
export const generateAIRecipeCardSvg = (recipeName: string): string => {
  return generateRecipeCoverSvg({
    name: recipeName,
    width: 400,
    height: 160,
    borderRadius: '12px 12px 0 0' // AI推荐卡片圆角
  })
}

// 为搜索结果卡片生成SVG
export const generateResultCardSvg = (recipeName: string): string => {
  return generateRecipeCoverSvg({
    name: recipeName,
    width: 300,
    height: 140,
    borderRadius: '12px 12px 0 0' // 搜索结果卡片圆角
  })
}

// 下载SVG文件
export const downloadSvgFile = (config: SvgConfig, filename?: string): void => {
  const svgContent = generateRecipeCoverSvg(config)
  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `${config.name}-cover.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 复制SVG代码到剪贴板
export const copySvgToClipboard = async (config: SvgConfig): Promise<boolean> => {
  try {
    const svgContent = generateRecipeCoverSvg(config)
    await navigator.clipboard.writeText(svgContent)
    return true
  } catch (error) {
    console.error('复制SVG代码失败:', error)
    return false
  }
}
