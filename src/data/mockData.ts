// ChefMind 智食谱 - 数据配置文件（已移除所有mock数据）

import type { IngredientCategory, CookingMethod, Recipe, NutritionInfo } from '@/types/recipe'

// 基础食材分类结构 - 使用AI动态生成内容
export const getIngredientCategories = async (): Promise<IngredientCategory[]> => {
  try {
    // 从本地存储获取已保存的食材分类
    const stored = localStorage.getItem('chefmind_ingredient_categories')
    if (stored) {
      return JSON.parse(stored)
    }

    // 如果没有存储的数据，使用AI生成
    const { aiService } = await import('@/services/aiService')
    const ingredients = ['蔬菜', '肉类', '海鲜', '调料']
    const preferences = { type: 'ingredient_categories' }

    const response = await aiService.generateRecipe(ingredients, preferences)
    const categories = JSON.parse(response)

    // 保存到本地存储
    localStorage.setItem('chefmind_ingredient_categories', JSON.stringify(categories))

    return Array.isArray(categories) ? categories : []
  } catch (error) {
    console.error('获取食材分类失败:', error)
    return []
  }
}

// 基础烹饪方式 - 使用AI动态生成内容
export const getCookingMethods = async (): Promise<CookingMethod[]> => {
  try {
    // 从本地存储获取已保存的烹饪方式
    const stored = localStorage.getItem('chefmind_cooking_methods')
    if (stored) {
      return JSON.parse(stored)
    }

    // 如果没有存储的数据，使用AI生成
    const { aiService } = await import('@/services/aiService')
    const ingredients = ['烹饪方法']
    const preferences = { type: 'cooking_methods' }

    const response = await aiService.generateRecipe(ingredients, preferences)
    const methods = JSON.parse(response)

    // 保存到本地存储
    localStorage.setItem('chefmind_cooking_methods', JSON.stringify(methods))

    return Array.isArray(methods) ? methods : []
  } catch (error) {
    console.error('获取烹饪方式失败:', error)
    return []
  }
}

// 营养数据库 - 使用AI动态查询
export const getNutritionInfo = async (ingredientName: string): Promise<NutritionInfo | null> => {
  try {
    // 先从本地缓存查找
    const cached = localStorage.getItem(`nutrition_${ingredientName}`)
    if (cached) {
      return JSON.parse(cached)
    }

    // 使用AI查询营养信息
    const { aiService } = await import('@/services/aiService')
    const ingredients = [ingredientName]
    const preferences = { type: 'nutrition_info' }

    const response = await aiService.generateRecipe(ingredients, preferences)
    const nutrition = JSON.parse(response)

    // 缓存结果
    localStorage.setItem(`nutrition_${ingredientName}`, JSON.stringify(nutrition))

    return nutrition
  } catch (error) {
    console.error(`获取${ingredientName}营养信息失败:`, error)
    return null
  }
}

// 食材推荐 - 使用AI动态生成
export const getIngredientRecommendations = async (ingredientName: string): Promise<any[]> => {
  try {
    const { aiService } = await import('@/services/aiService')
    const ingredients = [ingredientName]
    const preferences = { type: 'ingredient_recommendations' }

    const response = await aiService.generateRecipe(ingredients, preferences)
    const recommendations = JSON.parse(response)

    return Array.isArray(recommendations) ? recommendations : []
  } catch (error) {
    console.error(`获取${ingredientName}推荐失败:`, error)
    return []
  }
}

// 外部链接配置 - 保留静态配置
export const externalLinks = [
  {
    name: 'Bilibili',
    url: 'https://search.bilibili.com/all?keyword=',
    icon: 'VideoPlay',
    color: '#00a1d6',
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/results?search_query=',
    icon: 'VideoCamera',
    color: '#ff0000',
  },
  {
    name: '下厨房',
    url: 'https://www.xiachufang.com/search/?keyword=',
    icon: 'Reading',
    color: '#28b463',
  },
  {
    name: '豆果美食',
    url: 'https://www.douguo.com/search/recipe/',
    icon: 'StarFilled',
    color: '#f39c12',
  },
]

// 热门食谱数据 - 添加更多完整的食谱数据
export const popularRecipes: Recipe[] = [
  {
    id: '1',
    title: '宫保鸡丁',
    description: '经典川菜，麻辣鲜香，口感丰富',
    ingredients: [
      '鸡胸肉 300g',
      '花生米 100g',
      '干辣椒 10个',
      '花椒 1茶匙',
      '葱 2根',
      '姜 1小块',
      '蒜 3瓣',
      '生抽 2勺',
      '老抽 1勺',
      '料酒 1勺',
      '白糖 1勺',
      '醋 1勺',
      '淀粉 适量',
      '盐 适量',
      '食用油 适量',
    ],
    steps: [
      '鸡胸肉切丁，用生抽、料酒、淀粉腌制15分钟',
      '干辣椒剪成段，葱切段，姜蒜切末',
      '热锅下油，小火炒香花生米至酥脆，盛出备用',
      '锅中留底油，下花椒和干辣椒炒香',
      '下鸡丁大火快速翻炒至变色',
      '加入葱姜蒜炒香',
      '调入生抽、老抽、白糖、醋和少许水炒匀',
      '最后加入花生米翻炒均匀即可出锅',
    ],
    cookingTime: '20',
    difficulty: 'medium',
    servings: 2,
    image:
      'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWVhdCUyMGRpc2h8ZW58MHx8MHx8fDA%3D',
    tags: ['川菜', '下饭菜', '家常菜', '辣味'],
    nutrition: {
      calories: 320,
      protein: 28,
      carbs: 12,
      fat: 18,
      fiber: 3,
    },
    rating: 4.5,
    authorId: 'Chef Wang',
    createdAt: new Date('2024-01-15'),
    cookingMethods: ['炒'],
    name: '宫保鸡丁',
  },
  {
    id: '2',
    title: '番茄鸡蛋面',
    description: '简单快手的家常面条，营养美味',
    ingredients: [
      '面条 200g',
      '鸡蛋 2个',
      '番茄 2个',
      '葱花 适量',
      '盐 适量',
      '糖 1/2勺',
      '生抽 1勺',
      '食用油 适量',
    ],
    steps: [
      '番茄用开水烫一下去皮切块',
      '鸡蛋打散加少许盐，炒熟盛出备用',
      '热锅下油，下番茄炒出汁水',
      '加入适量水烧开',
      '加入面条煮熟',
      '加入炒好的鸡蛋，调入盐、糖、生抽',
      '撒上葱花即可出锅',
    ],
    cookingTime: '15',
    difficulty: 'easy',
    servings: 1,
    image:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bm9vZGxlJTIwZGlzaHxlbnwwfHwwfHx8MA%3D%3D',
    tags: ['快手菜', '面食', '家常菜', '素食'],
    nutrition: {
      calories: 280,
      protein: 15,
      carbs: 45,
      fat: 8,
      fiber: 4,
    },
    rating: 4.2,
    authorId: 'Home Cook',
    createdAt: new Date('2024-01-20'),
    cookingMethods: ['煮'],
    name: '番茄鸡蛋面',
  },
  {
    id: '3',
    title: '红烧肉',
    description: '经典家常菜，肥而不腻，入口即化',
    ingredients: [
      '五花肉 500g',
      '冰糖 30g',
      '生抽 3勺',
      '老抽 1勺',
      '料酒 2勺',
      '葱 2根',
      '姜 1小块',
      '八角 2个',
      '桂皮 1小段',
      '盐 适量',
      '食用油 适量',
    ],
    steps: [
      '五花肉切块，冷水下锅焯水去腥，捞出洗净',
      '热锅下油，小火炒糖色至焦糖色',
      '下五花肉翻炒上色',
      '加入葱姜、八角、桂皮炒香',
      '加入生抽、老抽、料酒炒匀',
      '加入开水没过肉块，大火烧开后转小火炖40分钟',
      '最后大火收汁，调入适量盐即可',
    ],
    cookingTime: '60',
    difficulty: 'medium',
    servings: 4,
    image:
      'https://images.unsplash.com/photo-1617692855027-33b14f061079?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D',
    tags: ['家常菜', '下饭菜', '经典菜', '肉菜'],
    nutrition: {
      calories: 420,
      protein: 22,
      carbs: 8,
      fat: 32,
      fiber: 0,
    },
    rating: 4.7,
    authorId: 'Chef Wang',
    createdAt: new Date('2024-01-25'),
    cookingMethods: ['炸'],
    name: '宫保鸡丁',
  },
  {
    id: '4',
    title: '麻婆豆腐',
    description: '川菜经典，麻辣鲜香，豆腐嫩滑',
    ingredients: [
      '嫩豆腐 400g',
      '牛肉末 100g',
      '郫县豆瓣酱 2勺',
      '花椒粉 1茶匙',
      '生抽 1勺',
      '料酒 1勺',
      '葱花 适量',
      '姜末 适量',
      '蒜末 适量',
      '水淀粉 适量',
      '食用油 适量',
      '盐 适量',
    ],
    instructions: [
      '豆腐切块，用淡盐水焯水去腥',
      '热锅下油，下牛肉末炒散变色',
      '加入郫县豆瓣酱炒出红油',
      '加入姜蒜末炒香',
      '加入适量水烧开',
      '下豆腐块，调入生抽、料酒',
      '小火煮3-5分钟入味',
      '用水淀粉勾芡，撒上花椒粉和葱花即可',
    ],
    cookingTime: '25',
    difficulty: 'medium',
    servings: 2,
    image:
      'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D',
    tags: ['川菜', '下饭菜', '豆腐', '辣味'],
    nutrition: {
      calories: 260,
      protein: 18,
      carbs: 10,
      fat: 16,
      fiber: 2,
    },
    rating: 4.4,
    authorId: 'Chef Zhang',
    createdAt: new Date('2024-02-10'),
    cookingMethods: ['炸'],
    name: '酸辣土豆丝',
  },
  {
    id: '5',
    title: '清蒸鲈鱼',
    description: '清淡营养，鱼肉鲜嫩，老少皆宜',
    ingredients: [
      '鲈鱼 1条(约500g)',
      '葱丝 适量',
      '姜丝 适量',
      '蒸鱼豉油 2勺',
      '料酒 1勺',
      '食用油 1勺',
      '盐 适量',
    ],
    instructions: [
      '鲈鱼处理干净，在鱼身两侧划几刀',
      '用盐和料酒腌制10分钟',
      '盘子上铺姜丝，放上鲈鱼，鱼身上也放些姜丝',
      '水开后上锅蒸8-10分钟',
      '蒸好后倒掉盘中水，去掉姜丝',
      '重新铺上葱丝和姜丝',
      '淋上蒸鱼豉油',
      '热锅下油烧热，浇在葱姜丝上即可',
    ],
    cookingTime: '20',
    difficulty: 'easy',
    servings: 2,
    image:
      'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2VhZm9vZCUyMGRpc2h8ZW58MHx8MHx8fDA%3D',
    tags: ['海鲜', '蒸菜', '清淡', '营养'],
    nutrition: {
      calories: 180,
      protein: 26,
      carbs: 0,
      fat: 8,
      fiber: 0,
    },
    rating: 4.6,
    authorId: 'Chef Chen',
    createdAt: new Date('2024-02-15'),
    cookingMethods: ['蒸'],
    name: '清蒸鲈鱼',
  },
  {
    id: '6',
    title: '蒜蓉西兰花',
    description: '简单健康的绿色蔬菜，营养丰富',
    ingredients: ['西兰花 300g', '蒜 4瓣', '盐 适量', '食用油 1勺', '生抽 1/2勺'],
    instructions: [
      '西兰花掰成小朵，用淡盐水浸泡10分钟',
      '蒜切末',
      '西兰花焯水1-2分钟，捞出沥干',
      '热锅下油，下蒜末炒香',
      '下西兰花翻炒均匀',
      '调入盐和生抽炒匀即可',
    ],
    cookingTime: '10',
    difficulty: 'easy',
    servings: 2,
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dmVnZXRhYmxlJTIwZGlzaHxlbnwwfHwwfHx8MA%3D%3D',
    tags: ['素食', '蔬菜', '快手菜', '健康'],
    nutrition: {
      calories: 80,
      protein: 4,
      carbs: 6,
      fat: 5,
      fiber: 3,
    },
    rating: 4.0,
    authorId: 'Healthy Chef',
    createdAt: new Date('2024-02-20'),
    cookingMethods: ['炒'],
    name: '蒜蓉西兰花',
  },
]

// 向后兼容的导出 - 现在返回空数据，组件应使用上面的异步函数
export const ingredientCategories: IngredientCategory[] = []
export const cookingMethods: CookingMethod[] = []
export const nutritionDatabase: Record<string, NutritionInfo> = {}
export const mockRecipes: Recipe[] = []
export const mockRecipeData = {
  recipes: [],
  cookingMethods: [],
  ingredients: [],
}
export const recommendationData = {
  nutrition: {},
  flavor: {},
  classic: {},
}
