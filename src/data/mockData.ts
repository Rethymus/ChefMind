import type { Recipe, Ingredient, CookingMethod } from '@/types/recipe'

// 食材数据
export const ingredients: Ingredient[] = [
  // 蔬菜类
  { id: 'veg-1', name: '白菜', category: 'vegetables' },
  { id: 'veg-2', name: '萝卜', category: 'vegetables' },
  { id: 'veg-3', name: '土豆', category: 'vegetables' },
  { id: 'veg-4', name: '西红柿', category: 'vegetables' },
  { id: 'veg-5', name: '黄瓜', category: 'vegetables' },
  { id: 'veg-6', name: '茄子', category: 'vegetables' },
  { id: 'veg-7', name: '豆角', category: 'vegetables' },
  { id: 'veg-8', name: '青椒', category: 'vegetables' },
  { id: 'veg-9', name: '洋葱', category: 'vegetables' },
  { id: 'veg-10', name: '胡萝卜', category: 'vegetables' },

  // 肉类
  { id: 'meat-1', name: '猪肉', category: 'meat' },
  { id: 'meat-2', name: '牛肉', category: 'meat' },
  { id: 'meat-3', name: '鸡肉', category: 'meat' },
  { id: 'meat-4', name: '羊肉', category: 'meat' },
  { id: 'meat-5', name: '鸭肉', category: 'meat' },
  { id: 'meat-6', name: '排骨', category: 'meat' },
  { id: 'meat-7', name: '鸡翅', category: 'meat' },
  { id: 'meat-8', name: '牛排', category: 'meat' },

  // 海鲜类
  { id: 'seafood-1', name: '鱼', category: 'seafood' },
  { id: 'seafood-2', name: '虾', category: 'seafood' },
  { id: 'seafood-3', name: '蟹', category: 'seafood' },
  { id: 'seafood-4', name: '鱿鱼', category: 'seafood' },
  { id: 'seafood-5', name: '带鱼', category: 'seafood' },
  { id: 'seafood-6', name: '扇贝', category: 'seafood' },
  { id: 'seafood-7', name: '海带', category: 'seafood' },

  // 主食类
  { id: 'staple-1', name: '米饭', category: 'staple' },
  { id: 'staple-2', name: '面条', category: 'staple' },
  { id: 'staple-3', name: '饺子皮', category: 'staple' },
  { id: 'staple-4', name: '面包', category: 'staple' },
  { id: 'staple-5', name: '馒头', category: 'staple' },
  { id: 'staple-6', name: '年糕', category: 'staple' },

  // 调料类
  { id: 'seasoning-1', name: '生抽', category: 'seasoning' },
  { id: 'seasoning-2', name: '老抽', category: 'seasoning' },
  { id: 'seasoning-3', name: '料酒', category: 'seasoning' },
  { id: 'seasoning-4', name: '醋', category: 'seasoning' },
  { id: 'seasoning-5', name: '糖', category: 'seasoning' },
  { id: 'seasoning-6', name: '盐', category: 'seasoning' },
  { id: 'seasoning-7', name: '蒜', category: 'seasoning' },
  { id: 'seasoning-8', name: '姜', category: 'seasoning' },
  { id: 'seasoning-9', name: '葱', category: 'seasoning' }
]

// 烹饪方式数据
export const cookingMethods: CookingMethod[] = [
  {
    id: 'method-1',
    name: '炒',
    icon: 'Fire',
    description: '快速翻炒，保持食材鲜嫩'
  },
  {
    id: 'method-2',
    name: '煮',
    icon: 'Mug',
    description: '水煮烹饪，营养健康'
  },
  {
    id: 'method-3',
    name: '蒸',
    icon: 'Cloudy',
    description: '蒸汽烹饪，原汁原味'
  },
  {
    id: 'method-4',
    name: '烤',
    icon: 'Sunny',
    description: '烘烤制作，香味浓郁'
  },
  {
    id: 'method-5',
    name: '炸',
    icon: 'Lightning',
    description: '油炸酥脆，口感丰富'
  },
  {
    id: 'method-6',
    name: '炖',
    icon: 'Timer',
    description: '慢火炖煮，营养充分'
  },
  {
    id: 'method-7',
    name: '凉拌',
    icon: 'Refrigerator',
    description: '清爽凉拌，简单易做'
  },
  {
    id: 'method-8',
    name: '焖',
    icon: 'Bowl',
    description: '焖制入味，软烂可口'
  }
]

// 示例菜谱数据
export const recipes: Recipe[] = [
  {
    id: 'recipe-1',
    name: '家常炒土豆丝',
    description: '经典家常菜，简单易做，口感爽脆',
    ingredients: [
      { id: 'veg-3', name: '土豆', category: 'vegetables' },
      { id: 'veg-8', name: '青椒', category: 'vegetables' },
      { id: 'seasoning-7', name: '蒜', category: 'seasoning' },
      { id: 'seasoning-1', name: '生抽', category: 'seasoning' }
    ],
    method: cookingMethods[0], // 炒
    steps: [
      {
        id: 1,
        title: '准备食材',
        description: '土豆去皮切丝，青椒切丝，蒜切片',
        tips: '土豆丝切好后用清水冲洗去除淀粉'
      },
      {
        id: 2,
        title: '热锅下油',
        description: '锅内放油，爆香蒜片',
        tips: '油温不要太高，避免蒜片炸糊'
      },
      {
        id: 3,
        title: '炒制土豆丝',
        description: '下土豆丝大火快炒2分钟',
        tips: '大火快炒保持土豆丝脆嫩'
      },
      {
        id: 4,
        title: '调味出锅',
        description: '加入青椒丝和调料炒匀即可',
        tips: '最后加盐，避免土豆丝出水'
      }
    ],
    time: 15,
    difficulty: 1,
    nutrition: 3,
    servings: '2-3人',
    tags: ['家常菜', '素食', '快手菜'],
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'recipe-2',
    name: '红烧肉',
    description: '色泽红亮，肥而不腻，入口即化',
    ingredients: [
      { id: 'meat-1', name: '猪肉', category: 'meat' },
      { id: 'seasoning-2', name: '老抽', category: 'seasoning' },
      { id: 'seasoning-5', name: '糖', category: 'seasoning' },
      { id: 'seasoning-3', name: '料酒', category: 'seasoning' }
    ],
    method: cookingMethods[5], // 炖
    steps: [
      {
        id: 1,
        title: '处理肉块',
        description: '五花肉切块，冷水下锅焯水去腥',
        tips: '焯水时加入料酒和姜片去腥效果更好'
      },
      {
        id: 2,
        title: '炒糖色',
        description: '锅内放少量油，下冰糖炒出糖色',
        tips: '小火慢炒，糖色呈焦糖色即可'
      },
      {
        id: 3,
        title: '炒制上色',
        description: '下肉块炒制上色，加入调料',
        tips: '每块肉都要炒制上色，这样成品更好看'
      },
      {
        id: 4,
        title: '炖煮入味',
        description: '加水没过肉块，小火炖煮1小时',
        tips: '中途要翻动，避免粘锅'
      }
    ],
    time: 90,
    difficulty: 3,
    nutrition: 2,
    servings: '3-4人',
    tags: ['荤菜', '下饭菜', '传统菜'],
    createdAt: new Date('2024-01-02')
  }
]

// 约束选项数据
export const constraintOptions = {
  time: [
    { label: '15分钟内', value: '15' },
    { label: '30分钟内', value: '30' },
    { label: '1小时内', value: '60' },
    { label: '不限时间', value: 'unlimited' }
  ],
  people: [
    { label: '1-2人', value: '1-2' },
    { label: '3-4人', value: '3-4' },
    { label: '5-6人', value: '5-6' },
    { label: '6人以上', value: '6+' }
  ],
  difficulty: [
    { label: '简单', value: 'easy' },
    { label: '中等', value: 'medium' },
    { label: '困难', value: 'hard' },
    { label: '不限', value: 'any' }
  ],
  taste: [
    { label: '清淡', value: 'light' },
    { label: '适中', value: 'medium' },
    { label: '重口味', value: 'strong' }
  ]
}

// 外部链接数据
export const externalLinks = [
  {
    name: 'B站视频教程',
    url: 'https://search.bilibili.com/all?keyword=',
    icon: 'VideoPlay',
    color: '#00a1d6'
  },
  {
    name: '抖音短视频',
    url: 'https://www.douyin.com/search/',
    icon: 'VideoCamera',
    color: '#fe2c55'
  },
  {
    name: '下厨房图文',
    url: 'https://www.xiachufang.com/search/?keyword=',
    icon: 'Reading',
    color: '#42c02e'
  },
  {
    name: '小红书分享',
    url: 'https://www.xiaohongshu.com/search_result?keyword=',
    icon: 'Heart',
    color: '#ff2442'
  }
]

// 导出所有数据
export const mockRecipeData = {
  ingredients,
  cookingMethods,
  recipes,
  constraintOptions,
  externalLinks
}