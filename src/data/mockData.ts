// ChefMind 智食谱 - 模拟数据

import type { 
  IngredientCategory, 
  CookingMethod, 
  Recipe, 
  NutritionInfo
} from '@/types/recipe'

// 食材分类数据
export const ingredientCategories: IngredientCategory[] = [
  {
    id: 'vegetables',
    name: '蔬菜类',
    icon: '🥬',
    items: [
      // 主界面显示的前14种蔬菜
      { id: 1, name: '白菜', category: 'vegetables', icon: '🥬' },
      { id: 2, name: '萝卜', category: 'vegetables', icon: '🥕' },
      { id: 3, name: '土豆', category: 'vegetables', icon: '🥔' },
      { id: 4, name: '西红柿', category: 'vegetables', icon: '🍅' },
      { id: 5, name: '黄瓜', category: 'vegetables', icon: '🥒' },
      { id: 6, name: '茄子', category: 'vegetables', icon: '🍆' },
      { id: 7, name: '豆角', category: 'vegetables', icon: '🫘' },
      { id: 8, name: '辣椒', category: 'vegetables', icon: '🌶️' },
      { id: 9, name: '洋葱', category: 'vegetables', icon: '🧅' },
      { id: 10, name: '大蒜', category: 'vegetables', icon: '🧄' },
      { id: 11, name: '生姜', category: 'vegetables', icon: '🫚' },
      { id: 12, name: '西兰花', category: 'vegetables', icon: '🥦' },
      { id: 13, name: '菠菜', category: 'vegetables', icon: '🥬' },
      { id: 14, name: '生菜', category: 'vegetables', icon: '🥬' },
      
      // 更多蔬菜（剩余36种）
      { id: 15, name: '芹菜', category: 'vegetables', icon: '🥬' },
      { id: 16, name: '韭菜', category: 'vegetables', icon: '🥬' },
      { id: 17, name: '小白菜', category: 'vegetables', icon: '🥬' },
      { id: 18, name: '油菜', category: 'vegetables', icon: '🥬' },
      { id: 19, name: '菜花', category: 'vegetables', icon: '🥦' },
      { id: 20, name: '包菜', category: 'vegetables', icon: '🥬' },
      { id: 21, name: '莴笋', category: 'vegetables', icon: '🥬' },
      { id: 22, name: '冬瓜', category: 'vegetables', icon: '🥒' },
      { id: 23, name: '南瓜', category: 'vegetables', icon: '🎃' },
      { id: 24, name: '丝瓜', category: 'vegetables', icon: '🥒' },
      { id: 25, name: '苦瓜', category: 'vegetables', icon: '🥒' },
      { id: 26, name: '胡萝卜', category: 'vegetables', icon: '🥕' },
      { id: 27, name: '山药', category: 'vegetables', icon: '🥔' },
      { id: 28, name: '莲藕', category: 'vegetables', icon: '🥔' },
      { id: 29, name: '竹笋', category: 'vegetables', icon: '🥬' },
      { id: 30, name: '豆芽', category: 'vegetables', icon: '🌱' },
      { id: 31, name: '韭黄', category: 'vegetables', icon: '🥬' },
      { id: 32, name: '蒜苗', category: 'vegetables', icon: '🥬' },
      { id: 33, name: '香菜', category: 'vegetables', icon: '🌿' },
      { id: 34, name: '小葱', category: 'vegetables', icon: '🥬' },
      { id: 35, name: '青椒', category: 'vegetables', icon: '🫑' },
      { id: 36, name: '红椒', category: 'vegetables', icon: '🌶️' },
      { id: 37, name: '尖椒', category: 'vegetables', icon: '🌶️' },
      { id: 38, name: '蘑菇', category: 'vegetables', icon: '🍄' },
      { id: 39, name: '香菇', category: 'vegetables', icon: '🍄' },
      { id: 40, name: '金针菇', category: 'vegetables', icon: '🍄' },
      { id: 41, name: '平菇', category: 'vegetables', icon: '🍄' },
      { id: 42, name: '杏鲍菇', category: 'vegetables', icon: '🍄' },
      { id: 43, name: '木耳', category: 'vegetables', icon: '🍄' },
      { id: 44, name: '银耳', category: 'vegetables', icon: '🍄' },
      { id: 45, name: '海带', category: 'vegetables', icon: '🌿' },
      { id: 46, name: '紫菜', category: 'vegetables', icon: '🌿' },
      { id: 47, name: '豆腐', category: 'vegetables', icon: '🧈' },
      { id: 48, name: '豆干', category: 'vegetables', icon: '🧈' },
      { id: 49, name: '腐竹', category: 'vegetables', icon: '🧈' },
      { id: 50, name: '玉米', category: 'vegetables', icon: '🌽' }
    ]
  },
  {
    id: 'meat',
    name: '肉类',
    icon: '🥩',
    items: [
      { id: 51, name: '猪肉', category: 'meat', icon: '🥩' },
      { id: 52, name: '牛肉', category: 'meat', icon: '🥩' },
      { id: 53, name: '鸡肉', category: 'meat', icon: '🍗' },
      { id: 54, name: '鸭肉', category: 'meat', icon: '🦆' },
      { id: 55, name: '羊肉', category: 'meat', icon: '🐑' },
      { id: 56, name: '鱼肉', category: 'seafood', icon: '🐟' },
      { id: 57, name: '虾', category: 'seafood', icon: '🦐' },
      { id: 58, name: '螃蟹', category: 'seafood', icon: '🦀' }
    ]
  },
  {
    id: 'cookware',
    name: '烹饪厨具',
    icon: '🍳',
    items: [
      { id: 59, name: '炒锅', category: 'cookware', icon: '🍳' },
      { id: 60, name: '平底锅', category: 'cookware', icon: '🍳' },
      { id: 61, name: '不粘锅', category: 'cookware', icon: '🍳' },
      { id: 62, name: '蒸锅', category: 'cookware', icon: '🥘' },
      { id: 63, name: '汤锅', category: 'cookware', icon: '🍲' },
      { id: 64, name: '砂锅', category: 'cookware', icon: '🍲' },
      { id: 65, name: '电饭煲', category: 'cookware', icon: '🍚' },
      { id: 66, name: '高压锅', category: 'cookware', icon: '🥘' },
      { id: 67, name: '烤箱', category: 'cookware', icon: '🔥' },
      { id: 68, name: '微波炉', category: 'cookware', icon: '📱' },
      { id: 69, name: '空气炸锅', category: 'cookware', icon: '🔥' },
      { id: 70, name: '电磁炉', category: 'cookware', icon: '🔥' },
      { id: 71, name: '燃气灶', category: 'cookware', icon: '🔥' },
      { id: 72, name: '蒸蛋器', category: 'cookware', icon: '🥚' }
    ]
  }
]

// 烹饪方式数据
export const cookingMethods: CookingMethod[] = [
  {
    id: 'stir_fry',
    name: '炒',
    icon: '🍳',
    description: '用少量油在高温下快速翻炒',
    difficulty: 2,
    time: 15
  },
  {
    id: 'steam',
    name: '蒸',
    icon: '♨️',
    description: '利用蒸汽加热烹饪',
    difficulty: 1,
    time: 20
  },
  {
    id: 'boil',
    name: '煮',
    icon: '🍲',
    description: '在沸水中烹饪食材',
    difficulty: 1,
    time: 25
  },
  {
    id: 'braise',
    name: '红烧',
    icon: '🥘',
    description: '先炒后焖的烹饪方法',
    difficulty: 3,
    time: 45
  },
  {
    id: 'deep_fry',
    name: '炸',
    icon: '🔥',
    description: '在大量热油中烹饪',
    difficulty: 3,
    time: 10
  },
  {
    id: 'grill',
    name: '烤',
    icon: '🔥',
    description: '用干热烹饪食材',
    difficulty: 2,
    time: 30
  }
]

// 营养数据库
export const nutritionDatabase: Record<string, NutritionInfo> = {
  '白菜': { calories: 13, protein: 1.5, carbs: 2.2, fat: 0.2, fiber: 1.2 },
  '萝卜': { calories: 16, protein: 0.9, carbs: 3.4, fat: 0.1, fiber: 1.6 },
  '土豆': { calories: 77, protein: 2.0, carbs: 17.5, fat: 0.1, fiber: 2.2 },
  '西红柿': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  '黄瓜': { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 },
  '茄子': { calories: 25, protein: 1.0, carbs: 5.9, fat: 0.2, fiber: 3.0 },
  '豆角': { calories: 35, protein: 2.4, carbs: 8.0, fat: 0.1, fiber: 2.7 },
  '辣椒': { calories: 40, protein: 1.9, carbs: 9.5, fat: 0.4, fiber: 1.5 },
  '洋葱': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
  '大蒜': { calories: 149, protein: 6.4, carbs: 33.1, fat: 0.5, fiber: 2.1 },
  '生姜': { calories: 80, protein: 1.8, carbs: 17.8, fat: 0.8, fiber: 2.0 },
  '西兰花': { calories: 34, protein: 2.8, carbs: 7.0, fat: 0.4, fiber: 2.6 },
  '菠菜': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  '生菜': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3 },
  '猪肉': { calories: 242, protein: 27.0, carbs: 0.0, fat: 14.0, fiber: 0.0 },
  '牛肉': { calories: 250, protein: 26.0, carbs: 0.0, fat: 15.0, fiber: 0.0 },
  '鸡肉': { calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, fiber: 0.0 },
  '豆腐': { calories: 76, protein: 8.1, carbs: 1.9, fat: 4.8, fiber: 0.4 }
}

// 模拟菜谱数据
export const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: '西红柿炒鸡蛋',
    description: '经典家常菜，营养丰富，制作简单',
    ingredients: [
      { id: 4, name: '西红柿', category: 'vegetables', amount: '2', unit: '个' },
      { id: 53, name: '鸡蛋', category: 'meat', amount: '3', unit: '个' }
    ],
    method: cookingMethods[0],
    steps: [
      '将西红柿洗净切块',
      '鸡蛋打散加少许盐',
      '热锅下油，炒鸡蛋盛起',
      '下西红柿炒出汁水',
      '倒入鸡蛋翻炒均匀即可'
    ],
    cookingTime: 15,
    difficulty: 1,
    servings: 2,
    nutrition: {
      calories: 180,
      protein: 12.5,
      carbs: 8.2,
      fat: 11.8,
      fiber: 2.1
    },
    tags: ['家常菜', '快手菜', '营养'],
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: '红烧土豆',
    description: '软糯香甜的红烧土豆，老少皆宜',
    ingredients: [
      { id: 3, name: '土豆', category: 'vegetables', amount: '500', unit: 'g' }
    ],
    method: cookingMethods[3],
    steps: [
      '土豆去皮切块',
      '热锅下油炸至微黄',
      '加生抽老抽上色',
      '加水焖煮20分钟',
      '大火收汁即可'
    ],
    cookingTime: 30,
    difficulty: 2,
    servings: 3,
    nutrition: {
      calories: 120,
      protein: 3.2,
      carbs: 26.8,
      fat: 0.8,
      fiber: 3.1
    },
    tags: ['素食', '下饭菜'],
    createdAt: new Date('2024-01-16')
  }
]

// 导出模拟数据对象（保持向后兼容）
export const mockRecipeData = {
  recipes: mockRecipes,
  cookingMethods: cookingMethods,
  ingredients: ingredientCategories.flatMap(cat => cat.items)
}

// 推荐数据
export const recommendationData = {
  nutrition: {
    '土豆': [
      { id: 4, name: '西红柿', category: 'vegetables', icon: '🍅', reason: '富含维生素C，与土豆搭配营养均衡' },
      { id: 12, name: '西兰花', category: 'vegetables', icon: '🥦', reason: '高纤维，促进消化' }
    ],
    '西红柿': [
      { id: 3, name: '土豆', category: 'vegetables', icon: '🥔', reason: '经典搭配，营养互补' },
      { id: 53, name: '鸡蛋', category: 'meat', icon: '🥚', reason: '蛋白质丰富，经典组合' }
    ],
    '白菜': [
      { id: 47, name: '豆腐', category: 'vegetables', icon: '🧈', reason: '清淡营养，适合养生' }
    ]
  },
  flavor: {
    '茄子': [
      { id: 8, name: '辣椒', category: 'vegetables', icon: '🌶️', reason: '增加香辣味，开胃下饭' }
    ],
    '豆角': [
      { id: 51, name: '猪肉', category: 'meat', icon: '🥩', reason: '荤素搭配，口感丰富' }
    ]
  },
  classic: {
    '鸡肉': [
      { id: 3, name: '土豆', category: 'vegetables', icon: '🥔', reason: '经典搭配，家常美味' }
    ],
    '牛肉': [
      { id: 3, name: '土豆', category: 'vegetables', icon: '🥔', reason: '西式经典，营养丰富' }
    ]
  }
}