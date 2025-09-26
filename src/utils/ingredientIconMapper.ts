/**
 * 食材图标映射工具
 * 根据食材名称返回对应的Unicode图标
 */

// 食材图标映射表
const ingredientIconMap: Record<string, string> = {
  // 蔬菜类
  白菜: '🥬',
  大白菜: '🥬',
  娃娃菜: '🥬',
  胡萝卜: '🥕',
  萝卜: '🥕',
  红萝卜: '🥕',
  小萝卜: '🥕',
  西红柿: '🍅',
  番茄: '🍅',
  圣女果: '🍅',
  小番茄: '🍅',
  洋葱: '🧅',
  大葱: '🧅',
  小葱: '🧅',
  葱: '🧅',
  土豆: '🥔',
  马铃薯: '🥔',
  洋芋: '🥔',
  西兰花: '🥦',
  花椰菜: '🥦',
  花菜: '🥦',
  菠菜: '🥬',
  小菠菜: '🥬',
  生菜: '🥬',
  油麦菜: '🥬',
  莴苣: '🥬',
  黄瓜: '🥒',
  青瓜: '🥒',
  小黄瓜: '🥒',
  青椒: '🫑',
  彩椒: '🫑',
  甜椒: '🫑',
  尖椒: '🌶️',
  茄子: '🍆',
  紫茄子: '🍆',
  长茄子: '🍆',
  玉米: '🌽',
  甜玉米: '🌽',
  玉米粒: '🌽',
  蘑菇: '🍄',
  香菇: '🍄',
  平菇: '🍄',
  金针菇: '🍄',
  杏鲍菇: '🍄',
  大蒜: '🧄',
  蒜: '🧄',
  蒜瓣: '🧄',
  蒜蓉: '🧄',
  生姜: '🫚',
  姜: '🫚',
  老姜: '🫚',
  嫩姜: '🫚',
  芹菜: '🥬',
  西芹: '🥬',
  豆芽: '🌱',
  绿豆芽: '🌱',
  黄豆芽: '🌱',

  // 肉类
  猪肉: '🥩',
  五花肉: '🥩',
  瘦肉: '🥩',
  排骨: '🥩',
  猪排: '🥩',
  牛肉: '🥩',
  牛排: '🥩',
  牛腩: '🥩',
  鸡肉: '🍗',
  鸡胸肉: '🍗',
  鸡腿: '🍗',
  鸡翅: '🍗',
  整鸡: '🍗',
  鸭肉: '🦆',
  鸭腿: '🦆',
  鸭胸: '🦆',
  羊肉: '🥩',
  羊排: '🥩',
  羊腿: '🥩',
  鱼: '🐟',
  鱼肉: '🐟',
  草鱼: '🐟',
  鲫鱼: '🐟',
  带鱼: '🐟',
  鲈鱼: '🐟',
  虾: '🦐',
  大虾: '🦐',
  基围虾: '🦐',
  白虾: '🦐',
  螃蟹: '🦀',
  大闸蟹: '🦀',
  培根: '🥓',
  腊肉: '🥓',

  // 奶制品
  牛奶: '🥛',
  鲜奶: '🥛',
  纯牛奶: '🥛',
  奶酪: '🧀',
  芝士: '🧀',
  起司: '🧀',
  酸奶: '🥛',
  酸牛奶: '🥛',
  黄油: '🧈',
  奶油: '🧈',
  淡奶油: '🥛',
  重奶油: '🥛',

  // 谷物类
  大米: '🍚',
  米: '🍚',
  白米: '🍚',
  香米: '🍚',
  面条: '🍜',
  挂面: '🍜',
  手擀面: '🍜',
  意面: '🍝',
  面包: '🍞',
  吐司: '🍞',
  全麦面包: '🍞',
  小麦: '🌾',
  面粉: '🌾',
  高筋面粉: '🌾',
  低筋面粉: '🌾',
  燕麦: '🌾',
  燕麦片: '🌾',
  藜麦: '🌾',
  大麦: '🌾',

  // 水果类
  苹果: '🍎',
  红苹果: '🍎',
  青苹果: '🍏',
  香蕉: '🍌',
  大香蕉: '🍌',
  橙子: '🍊',
  橘子: '🍊',
  柑橘: '🍊',
  葡萄: '🍇',
  紫葡萄: '🍇',
  青葡萄: '🍇',
  草莓: '🍓',
  大草莓: '🍓',
  西瓜: '🍉',
  大西瓜: '🍉',
  菠萝: '🍍',
  凤梨: '🍍',
  芒果: '🥭',
  大芒果: '🥭',
  桃子: '🍑',
  水蜜桃: '🍑',
  梨: '🍐',
  雪梨: '🍐',
  鸭梨: '🍐',
  樱桃: '🍒',
  车厘子: '🍒',
  猕猴桃: '🥝',
  奇异果: '🥝',
  柠檬: '🍋',
  青柠: '🍋',
  牛油果: '🥑',
  鳄梨: '🥑',

  // 调料类
  盐: '🧂',
  食盐: '🧂',
  海盐: '🧂',
  糖: '🍯',
  白糖: '🍯',
  冰糖: '🍯',
  红糖: '🍯',
  生抽: '🥢',
  老抽: '🥢',
  酱油: '🥢',
  醋: '🍶',
  米醋: '🍶',
  陈醋: '🍶',
  白醋: '🍶',
  料酒: '🍶',
  黄酒: '🍶',
  米酒: '🍶',
  香油: '🫗',
  芝麻油: '🫗',
  花生油: '🫗',
  菜籽油: '🫗',
  橄榄油: '🫗',
  蚝油: '🥢',
  豆瓣酱: '🥢',
  甜面酱: '🥢',
  胡椒粉: '🧂',
  五香粉: '🧂',
  孜然: '🧂',
  八角: '🧂',

  // 蛋类
  鸡蛋: '🥚',
  蛋: '🥚',
  土鸡蛋: '🥚',
  鸭蛋: '🥚',
  鹌鹑蛋: '🥚',

  // 豆类
  豆腐: '🧊',
  嫩豆腐: '🧊',
  老豆腐: '🧊',
  豆腐干: '🧊',
  豆浆: '🥛',
  黄豆: '🫘',
  绿豆: '🫘',
  红豆: '🫘',

  // 坚果类
  花生: '🥜',
  核桃: '🥜',
  杏仁: '🥜',
  腰果: '🥜',

  // 海鲜类
  海带: '🌿',
  紫菜: '🌿',
  海苔: '🌿',
  扇贝: '🦪',
  生蚝: '🦪',
  蛤蜊: '🦪',

  // 其他常见食材
  豆角: '🫛',
  四季豆: '🫛',
  长豆角: '🫛',
  冬瓜: '🥒',
  丝瓜: '🥒',
  苦瓜: '🥒',
  韭菜: '🥬',
  韭黄: '🥬',
  香菜: '🌿',
  芫荽: '🌿',
  紫薯: '🍠',
  红薯: '🍠',
  山药: '🍠',
  莲藕: '🪷',
  藕: '🪷',
  竹笋: '🎋',
  笋: '🎋',
  春笋: '🎋',
}

/**
 * 根据食材名称获取对应图标
 * @param ingredientName 食材名称
 * @returns 对应的Unicode图标，如果找不到则返回默认蔬菜图标
 */
export function getIngredientIcon(ingredientName: string): string {
  // 直接匹配
  if (ingredientIconMap[ingredientName]) {
    return ingredientIconMap[ingredientName]
  }

  // 模糊匹配 - 查找包含关键词的食材
  for (const [key, icon] of Object.entries(ingredientIconMap)) {
    if (ingredientName.includes(key) || key.includes(ingredientName)) {
      return icon
    }
  }

  // 根据常见食材类型进行智能推测
  if (
    ingredientName.includes('肉') ||
    ingredientName.includes('排') ||
    ingredientName.includes('牛') ||
    ingredientName.includes('羊') ||
    ingredientName.includes('猪')
  ) {
    return '🥩'
  }

  if (
    ingredientName.includes('鸡') ||
    ingredientName.includes('鸭') ||
    ingredientName.includes('鹅') ||
    ingredientName.includes('禽')
  ) {
    return '🍗'
  }

  if (
    ingredientName.includes('鱼') ||
    ingredientName.includes('虾') ||
    ingredientName.includes('蟹') ||
    ingredientName.includes('海鲜')
  ) {
    return '🐟'
  }

  if (
    ingredientName.includes('菜') ||
    ingredientName.includes('叶') ||
    ingredientName.includes('芽') ||
    ingredientName.includes('苗')
  ) {
    return '🥬'
  }

  if (
    ingredientName.includes('果') ||
    ingredientName.includes('桃') ||
    ingredientName.includes('李') ||
    ingredientName.includes('杏')
  ) {
    return '🍎'
  }

  if (ingredientName.includes('蛋') || ingredientName.includes('卵')) {
    return '🥚'
  }

  if (
    ingredientName.includes('奶') ||
    ingredientName.includes('乳') ||
    ingredientName.includes('酪') ||
    ingredientName.includes('芝士')
  ) {
    return '🥛'
  }

  if (
    ingredientName.includes('米') ||
    ingredientName.includes('面') ||
    ingredientName.includes('粉') ||
    ingredientName.includes('麦')
  ) {
    return '🌾'
  }

  if (
    ingredientName.includes('油') ||
    ingredientName.includes('酱') ||
    ingredientName.includes('醋') ||
    ingredientName.includes('盐') ||
    ingredientName.includes('糖') ||
    ingredientName.includes('料')
  ) {
    return '🧂'
  }

  // 默认返回蔬菜图标
  return '🥬'
}

/**
 * 批量获取食材图标
 * @param ingredients 食材名称数组
 * @returns 食材名称和图标的映射对象
 */
export function getIngredientIcons(ingredients: string[]): Record<string, string> {
  const result: Record<string, string> = {}
  ingredients.forEach(ingredient => {
    result[ingredient] = getIngredientIcon(ingredient)
  })
  return result
}
