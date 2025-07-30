// 食材数据
export const ingredientCategories = [
  {
    id: 'vegetables',
    name: '蔬菜类',
    icon: '🥬',
    items: [
      // 前14个显示在主界面（两行，每行7个）
      { id: 1, name: '白菜', category: 'vegetables' },
      { id: 2, name: '萝卜', category: 'vegetables' },
      { id: 3, name: '土豆', category: 'vegetables' },
      { id: 4, name: '西红柿', category: 'vegetables' },
      { id: 5, name: '黄瓜', category: 'vegetables' },
      { id: 6, name: '茄子', category: 'vegetables' },
      { id: 7, name: '豆角', category: 'vegetables' },
      { id: 8, name: '青椒', category: 'vegetables' },
      { id: 9, name: '洋葱', category: 'vegetables' },
      { id: 10, name: '胡萝卜', category: 'vegetables' },
      { id: 11, name: '芹菜', category: 'vegetables' },
      { id: 12, name: '韭菜', category: 'vegetables' },
      { id: 13, name: '菠菜', category: 'vegetables' },
      { id: 14, name: '生菜', category: 'vegetables' },
      // 其余36个通过"更多"按钮显示
      { id: 15, name: '西兰花', category: 'vegetables' },
      { id: 16, name: '花菜', category: 'vegetables' },
      { id: 17, name: '包菜', category: 'vegetables' },
      { id: 18, name: '油菜', category: 'vegetables' },
      { id: 19, name: '小白菜', category: 'vegetables' },
      { id: 20, name: '娃娃菜', category: 'vegetables' },
      { id: 21, name: '芥蓝', category: 'vegetables' },
      { id: 22, name: '菜心', category: 'vegetables' },
      { id: 23, name: '空心菜', category: 'vegetables' },
      { id: 24, name: '苋菜', category: 'vegetables' },
      { id: 25, name: '茼蒿', category: 'vegetables' },
      { id: 26, name: '香菜', category: 'vegetables' },
      { id: 27, name: '大葱', category: 'vegetables' },
      { id: 28, name: '小葱', category: 'vegetables' },
      { id: 29, name: '蒜苗', category: 'vegetables' },
      { id: 30, name: '韭黄', category: 'vegetables' },
      { id: 31, name: '豆苗', category: 'vegetables' },
      { id: 32, name: '豌豆', category: 'vegetables' },
      { id: 33, name: '毛豆', category: 'vegetables' },
      { id: 34, name: '蚕豆', category: 'vegetables' },
      { id: 35, name: '冬瓜', category: 'vegetables' },
      { id: 36, name: '南瓜', category: 'vegetables' },
      { id: 37, name: '丝瓜', category: 'vegetables' },
      { id: 38, name: '苦瓜', category: 'vegetables' },
      { id: 39, name: '黄瓜', category: 'vegetables' },
      { id: 40, name: '节瓜', category: 'vegetables' },
      { id: 41, name: '莲藕', category: 'vegetables' },
      { id: 42, name: '山药', category: 'vegetables' },
      { id: 43, name: '芋头', category: 'vegetables' },
      { id: 44, name: '红薯', category: 'vegetables' },
      { id: 45, name: '紫薯', category: 'vegetables' },
      { id: 46, name: '玉米', category: 'vegetables' },
      { id: 47, name: '竹笋', category: 'vegetables' },
      { id: 48, name: '蘑菇', category: 'vegetables' },
      { id: 49, name: '金针菇', category: 'vegetables' },
      { id: 50, name: '香菇', category: 'vegetables' }
    ]
  },
  {
    id: 'meat',
    name: '肉类',
    icon: '🥩',
    items: [
      { id: 51, name: '猪肉', category: 'meat' },
      { id: 52, name: '牛肉', category: 'meat' },
      { id: 53, name: '鸡肉', category: 'meat' },
      { id: 54, name: '羊肉', category: 'meat' },
      { id: 55, name: '鸭肉', category: 'meat' },
      { id: 56, name: '排骨', category: 'meat' },
      { id: 57, name: '鸡翅', category: 'meat' },
      { id: 58, name: '牛排', category: 'meat' },
      { id: 59, name: '里脊肉', category: 'meat' },
      { id: 60, name: '五花肉', category: 'meat' },
      { id: 61, name: '鸡胸肉', category: 'meat' },
      { id: 62, name: '鸡腿', category: 'meat' },
      { id: 63, name: '培根', category: 'meat' },
      { id: 64, name: '香肠', category: 'meat' }
    ]
  },
  {
    id: 'seafood',
    name: '海鲜类',
    icon: '🐟',
    items: [
      { id: 65, name: '鱼', category: 'seafood' },
      { id: 66, name: '虾', category: 'seafood' },
      { id: 67, name: '蟹', category: 'seafood' },
      { id: 68, name: '鱿鱼', category: 'seafood' },
      { id: 69, name: '带鱼', category: 'seafood' },
      { id: 70, name: '扇贝', category: 'seafood' },
      { id: 71, name: '海带', category: 'seafood' },
      { id: 72, name: '紫菜', category: 'seafood' },
      { id: 73, name: '海蛎', category: 'seafood' },
      { id: 74, name: '蛤蜊', category: 'seafood' },
      { id: 75, name: '章鱼', category: 'seafood' },
      { id: 76, name: '墨鱼', category: 'seafood' },
      { id: 77, name: '龙虾', category: 'seafood' },
      { id: 78, name: '鲍鱼', category: 'seafood' }
    ]
  },
  {
    id: 'staple',
    name: '主食类',
    icon: '🍚',
    items: [
      { id: 79, name: '米饭', category: 'staple' },
      { id: 80, name: '面条', category: 'staple' },
      { id: 81, name: '饺子皮', category: 'staple' },
      { id: 82, name: '面包', category: 'staple' },
      { id: 83, name: '馒头', category: 'staple' },
      { id: 84, name: '年糕', category: 'staple' },
      { id: 85, name: '粉丝', category: 'staple' },
      { id: 86, name: '河粉', category: 'staple' },
      { id: 87, name: '意大利面', category: 'staple' },
      { id: 88, name: '通心粉', category: 'staple' },
      { id: 89, name: '燕麦', category: 'staple' },
      { id: 90, name: '小米', category: 'staple' },
      { id: 91, name: '糯米', category: 'staple' },
      { id: 92, name: '薏米', category: 'staple' }
    ]
  },
  {
    id: 'cookware',
    name: '烹饪厨具',
    icon: '🍳',
    items: [
      { id: 93, name: '炒锅', category: 'cookware' },
      { id: 94, name: '平底锅', category: 'cookware' },
      { id: 95, name: '不粘锅', category: 'cookware' },
      { id: 96, name: '蒸锅', category: 'cookware' },
      { id: 97, name: '汤锅', category: 'cookware' },
      { id: 98, name: '砂锅', category: 'cookware' },
      { id: 99, name: '电饭煲', category: 'cookware' },
      { id: 100, name: '高压锅', category: 'cookware' },
      { id: 101, name: '烤箱', category: 'cookware' },
      { id: 102, name: '微波炉', category: 'cookware' },
      { id: 103, name: '空气炸锅', category: 'cookware' },
      { id: 104, name: '电磁炉', category: 'cookware' },
      { id: 105, name: '燃气灶', category: 'cookware' },
      { id: 106, name: '蒸蛋器', category: 'cookware' }
    ]
  }
]

// 烹饪方式数据
export const cookingMethods = [
  {
    id: 'stir-fry',
    name: '炒',
    icon: '🍳',
    description: '快速翻炒，保持食材鲜嫩'
  },
  {
    id: 'boil',
    name: '煮',
    icon: '🍲',
    description: '水煮烹饪，营养健康'
  },
  {
    id: 'steam',
    name: '蒸',
    icon: '🥟',
    description: '蒸汽烹饪，保持原味'
  },
  {
    id: 'bake',
    name: '烤',
    icon: '🔥',
    description: '烘烤制作，香味浓郁'
  },
  {
    id: 'fry',
    name: '炸',
    icon: '🍟',
    description: '油炸烹饪，酥脆可口'
  },
  {
    id: 'stew',
    name: '炖',
    icon: '🍯',
    description: '慢炖细煮，汤汁浓郁'
  },
  {
    id: 'cold',
    name: '凉拌',
    icon: '🥗',
    description: '凉拌制作，清爽开胃'
  },
  {
    id: 'braise',
    name: '焖',
    icon: '🍛',
    description: '焖煮入味，软烂香甜'
  }
]

// 约束条件数据
export const constraints = {
  time: [
    { id: '15min', name: '15分钟内', value: 15 },
    { id: '30min', name: '30分钟内', value: 30 },
    { id: '60min', name: '1小时内', value: 60 },
    { id: 'unlimited', name: '不限时间', value: null }
  ],
  people: [
    { id: '1-2', name: '1-2人', value: '1-2' },
    { id: '3-4', name: '3-4人', value: '3-4' },
    { id: '5-6', name: '5-6人', value: '5-6' },
    { id: '6+', name: '6人以上', value: '6+' }
  ],
  difficulty: [
    { id: 'easy', name: '简单', value: 1 },
    { id: 'medium', name: '中等', value: 2 },
    { id: 'hard', name: '困难', value: 3 },
    { id: 'unlimited', name: '不限', value: null }
  ],
  taste: [
    { id: 'light', name: '清淡', value: 'light' },
    { id: 'medium', name: '适中', value: 'medium' },
    { id: 'heavy', name: '重口味', value: 'heavy' }
  ]
}

// 外部链接数据
export const externalLinks = [
  {
    name: 'B站',
    url: 'https://search.bilibili.com/all?keyword=',
    icon: 'VideoPlay',
    color: '#00a1d6'
  },
  {
    name: '抖音',
    url: 'https://www.douyin.com/search/',
    icon: 'VideoCamera',
    color: '#fe2c55'
  },
  {
    name: '下厨房',
    url: 'https://www.xiachufang.com/search/?keyword=',
    icon: 'Reading',
    color: '#42c02e'
  },
  {
    name: '小红书',
    url: 'https://www.xiaohongshu.com/search_result?keyword=',
    icon: 'Heart',
    color: '#ff2442'
  }
]

// 模拟菜谱数据
export const mockRecipes = [
  {
    id: 1,
    name: '宫保鸡丁',
    description: '经典川菜，鸡肉嫩滑，花生酥脆，酸甜微辣',
    difficulty: 3,
    nutrition: 4,
    time: 25,
    servings: '2-3人',
    tags: ['川菜', '下饭菜', '家常菜'],
    ingredients: [
      { id: 53, name: '鸡肉', category: 'meat' },
      { id: 1, name: '白菜', category: 'vegetables' },
      { id: 8, name: '青椒', category: 'vegetables' }
    ],
    steps: [
      {
        id: 1,
        title: '准备食材',
        description: '鸡胸肉切丁，用料酒、生抽、淀粉腌制15分钟',
        tips: '鸡肉切丁要均匀，腌制时间不要太长'
      },
      {
        id: 2,
        title: '调制酱汁',
        description: '生抽、老抽、醋、糖、淀粉调成酱汁',
        tips: '酱汁要调匀，避免有颗粒'
      },
      {
        id: 3,
        title: '炒制鸡丁',
        description: '热锅下油，下鸡丁炒至变色盛起',
        tips: '火候要大，快速炒制保持嫩滑'
      },
      {
        id: 4,
        title: '爆炒配菜',
        description: '下干辣椒、花椒爆香，下蔬菜丁炒匀',
        tips: '辣椒不要炒糊，影响口感'
      },
      {
        id: 5,
        title: '收汁装盘',
        description: '倒入酱汁，炒匀收汁，撒花生米即可',
        tips: '收汁要快，保持食材脆嫩'
      }
    ],
    createdAt: new Date('2024-01-15')
  },
  {
    id: 2,
    name: '蒸蛋羹',
    description: '嫩滑如豆腐，营养丰富，老少皆宜',
    difficulty: 1,
    nutrition: 5,
    time: 15,
    servings: '1-2人',
    tags: ['蒸菜', '营养', '简单'],
    ingredients: [
      { id: 79, name: '米饭', category: 'staple' }
    ],
    steps: [
      {
        id: 1,
        title: '打散鸡蛋',
        description: '鸡蛋打散，加入温水搅拌均匀',
        tips: '水蛋比例1:1.5，水温不要太热'
      },
      {
        id: 2,
        title: '过筛去泡',
        description: '蛋液过筛，去除泡沫',
        tips: '过筛可以让蛋羹更嫩滑'
      },
      {
        id: 3,
        title: '上锅蒸制',
        description: '盖保鲜膜，大火蒸10分钟',
        tips: '保鲜膜防止水汽滴落'
      }
    ],
    createdAt: new Date('2024-01-16')
  },
  {
    id: 3,
    name: '红烧肉',
    description: '色泽红亮，肥而不腻，入口即化',
    difficulty: 4,
    nutrition: 3,
    time: 90,
    servings: '3-4人',
    tags: ['红烧菜', '下饭菜', '传统菜'],
    ingredients: [
      { id: 60, name: '五花肉', category: 'meat' }
    ],
    steps: [
      {
        id: 1,
        title: '处理五花肉',
        description: '五花肉切块，冷水下锅焯水去腥',
        tips: '焯水时加料酒去腥效果更好'
      },
      {
        id: 2,
        title: '炒糖色',
        description: '锅内放冰糖，小火炒至焦糖色',
        tips: '火候要小，糖色不能炒过头'
      },
      {
        id: 3,
        title: '炒制上色',
        description: '下肉块炒制上色，加调料',
        tips: '要炒到每块肉都上色'
      },
      {
        id: 4,
        title: '焖煮收汁',
        description: '加水没过肉块，大火烧开转小火焖1小时',
        tips: '中途要翻动，防止粘锅'
      }
    ],
    createdAt: new Date('2024-01-17')
  }
]