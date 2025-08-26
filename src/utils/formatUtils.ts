/**
 * 格式化工具函数 - 统一应用中的单位显示
 */

// 格式化烹饪时间
export const formatCookingTime = (time: string | number): string => {
  if (typeof time === 'number') {
    return `${time}分钟`
  }

  const timeStr = String(time).toLowerCase()

  // 如果已经包含单位，直接返回
  if (
    timeStr.includes('分钟') ||
    timeStr.includes('小时') ||
    timeStr.includes('天') ||
    timeStr.includes('min') ||
    timeStr.includes('hour') ||
    timeStr.includes('day')
  ) {
    return String(time)
  }

  // 如果是纯数字，添加分钟单位
  const numMatch = timeStr.match(/^\d+$/)
  if (numMatch) {
    return `${time}分钟`
  }

  return String(time)
}

// 格式化难度
export const formatDifficulty = (difficulty: string | number): string => {
  if (typeof difficulty === 'number') {
    if (difficulty <= 2) return '简单'
    if (difficulty <= 4) return '中等'
    return '困难'
  }

  const diffStr = String(difficulty).toLowerCase()

  // 中文翻译
  const difficultyMap: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
    simple: '简单',
    normal: '中等',
    difficult: '困难',
    '1': '简单',
    '2': '简单',
    '3': '中等',
    '4': '中等',
    '5': '困难',
  }

  return difficultyMap[diffStr] || String(difficulty)
}

// 格式化份量
export const formatServings = (servings: number | string): string => {
  if (typeof servings === 'string') {
    // 如果已经包含单位，直接返回
    if (servings.includes('人份') || servings.includes('份')) {
      return servings
    }
  }

  const num = Number(servings)
  return isNaN(num) ? String(servings) : `${num}人份`
}

// 格式化单个营养值
export const formatNutritionValue = (value: number, unit: string = ''): string => {
  if (isNaN(value)) return '0' + unit

  // 保留一位小数
  const formatted = value.toFixed(1)
  // 如果小数位是0，则显示整数
  const result = formatted.endsWith('.0') ? Math.round(value).toString() : formatted

  return result + unit
}

// 格式化卡路里
export const formatCalories = (calories: number): string => {
  return formatNutritionValue(calories, '千卡')
}

// 格式化重量单位（克）
export const formatWeight = (weight: number): string => {
  return formatNutritionValue(weight, 'g')
}

// 格式化百分比
export const formatPercentage = (value: number): string => {
  return formatNutritionValue(value, '%')
}
