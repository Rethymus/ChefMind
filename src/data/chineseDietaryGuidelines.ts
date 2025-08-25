// 中国居民膳食指南 (2022版) 数据
// Chinese Dietary Guidelines for Residents (2022 Edition)

export interface NutrientRecommendation {
  nutrient: string
  dailyRecommendation: {
    adult: number
    unit: string
    range?: { min: number; max: number }
  }
  sources: string[]
  benefits: string[]
}

export interface FoodGroupRecommendation {
  group: string
  dailyIntake: {
    amount: number
    unit: string
    range?: { min: number; max: number }
  }
  examples: string[]
  nutritionFocus: string[]
}

// 中国居民膳食指南核心推荐
export const CHINESE_DIETARY_GUIDELINES = {
  // 八条膳食指南
  principles: [
    {
      id: 1,
      title: '食物多样，合理搭配',
      description: '平衡膳食模式是最大程度上保障人体营养需要和健康的基础',
      recommendations: [
        '每天的膳食应包括谷薯类、蔬菜水果、畜禽鱼蛋奶、大豆坚果等食物',
        '平均每天摄入12种以上食物，每周25种以上',
        '每天摄入谷薯类食物250-400g，其中全谷物和杂豆类50-150g，薯类50-100g',
      ],
    },
    {
      id: 2,
      title: '吃动平衡，健康体重',
      description: '各个年龄段人群都应该坚持天天运动、维持能量平衡、保持健康体重',
      recommendations: [
        '坚持日常身体活动，每周至少进行5天中等强度身体活动，累计150分钟以上',
        '主动身体活动最好每天6000步',
        '减少久坐时间，每小时起来动一动',
      ],
    },
    {
      id: 3,
      title: '多吃蔬果、奶类、全谷、大豆',
      description: '蔬菜水果、全谷物和奶制品是平衡膳食的重要组成部分',
      recommendations: [
        '餐餐有蔬菜，保证每天摄入不少于300g的新鲜蔬菜，深色蔬菜应占1/2',
        '天天吃水果，保证每天摄入200-350g的新鲜水果',
        '吃各种奶制品，摄入量相当于每天液体奶300ml',
      ],
    },
    {
      id: 4,
      title: '适量吃鱼、禽、蛋、瘦肉',
      description: '鱼、禽、蛋类和瘦肉摄入要适量，少吃肥肉、烟熏和腌制肉制品',
      recommendations: [
        '每周吃鱼2次或300-500g，蛋类300-350g，畜禽肉300-500g',
        '少吃肥肉、烟熏和腌制肉制品',
        '坚持选择鱼和禽类',
      ],
    },
    {
      id: 5,
      title: '少盐少油，控糖限酒',
      description: '培养清淡饮食习惯，少吃高盐和油炸食品',
      recommendations: [
        '成年人每天摄入食盐不超过5g，烹调油25-30g',
        '控制添加糖的摄入量，每天不超过50g，最好控制在25g以下',
        '反式脂肪酸每天摄入量不超过2g',
        '不喝或少喝含糖饮料',
      ],
    },
    {
      id: 6,
      title: '规律进餐，足量饮水',
      description: '合理安排一日三餐，定时定量，不漏餐，每天足量饮水',
      recommendations: [
        '合理安排一日三餐，定时定量，不漏餐',
        '早餐提供的能量应占全天总能量的25-30%',
        '每天足量饮水，少量多次。在温和气候条件下，低身体活动水平成年男性每天喝水1700ml，成年女性每天喝水1500ml',
      ],
    },
    {
      id: 7,
      title: '会烹会选，会看标签',
      description: '在生命的各个阶段都应该坚持合理的膳食，学会选择食物',
      recommendations: [
        '认识食物，选择新鲜的、营养素密度高的食物',
        '学会阅读食品标签，合理选择预包装食品',
        '学习烹饪，传承传统饮食，享受食物天然美味',
      ],
    },
    {
      id: 8,
      title: '公筷分餐，杜绝浪费',
      description: '选择新鲜卫生的食物，不食用野生动物',
      recommendations: [
        '选择新鲜卫生的食物和适宜的烹调方式',
        '食物制备生熟分开、熟食二次加热要热透',
        '讲究卫生，从分餐做起',
        '珍惜食物，按需备餐，提倡分餐不浪费',
      ],
    },
  ],

  // 食物分组推荐摄入量
  foodGroups: [
    {
      group: '谷薯类',
      dailyIntake: { amount: 250, unit: 'g', range: { min: 250, max: 400 } },
      subGroups: [
        { name: '全谷物和杂豆类', amount: 50, unit: 'g', range: { min: 50, max: 150 } },
        { name: '薯类', amount: 50, unit: 'g', range: { min: 50, max: 100 } },
      ],
      examples: [
        '大米',
        '小麦',
        '玉米',
        '燕麦',
        '糙米',
        '全麦面粉',
        '红豆',
        '绿豆',
        '土豆',
        '红薯',
      ],
      nutritionFocus: ['碳水化合物', '膳食纤维', 'B族维生素', '矿物质'],
    },
    {
      group: '蔬菜类',
      dailyIntake: { amount: 300, unit: 'g', range: { min: 300, max: 500 } },
      subGroups: [{ name: '深色蔬菜', amount: 150, unit: 'g', description: '应占蔬菜总量的1/2' }],
      examples: [
        '菠菜',
        '胡萝卜',
        '西兰花',
        '番茄',
        '黄瓜',
        '白菜',
        '茄子',
        '豆角',
        '蘑菇',
        '洋葱',
      ],
      nutritionFocus: ['维生素C', '胡萝卜素', '叶酸', '钾', '膳食纤维', '植物化学物'],
    },
    {
      group: '水果类',
      dailyIntake: { amount: 200, unit: 'g', range: { min: 200, max: 350 } },
      examples: ['苹果', '香蕉', '橙子', '葡萄', '草莓', '猕猴桃', '梨', '桃', '西瓜', '芒果'],
      nutritionFocus: ['维生素C', '钾', '膳食纤维', '天然果糖', '抗氧化物质'],
    },
    {
      group: '畜禽鱼蛋类',
      dailyIntake: { amount: 120, unit: 'g', range: { min: 120, max: 200 } },
      subGroups: [
        { name: '水产品', amount: 300, unit: 'g/周', range: { min: 300, max: 500 } },
        { name: '蛋类', amount: 300, unit: 'g/周', range: { min: 300, max: 350 } },
        { name: '畜禽肉', amount: 300, unit: 'g/周', range: { min: 300, max: 500 } },
      ],
      examples: ['鱼类', '虾', '鸡肉', '鸭肉', '猪瘦肉', '牛肉', '鸡蛋', '鸭蛋'],
      nutritionFocus: ['优质蛋白质', '维生素A', 'B族维生素', '铁', '锌', '硒'],
    },
    {
      group: '奶及奶制品',
      dailyIntake: { amount: 300, unit: 'ml', description: '相当于液体奶' },
      examples: ['牛奶', '酸奶', '奶酪', '奶粉'],
      nutritionFocus: ['优质蛋白质', '钙', '维生素B2', '维生素A'],
    },
    {
      group: '大豆及坚果类',
      dailyIntake: { amount: 25, unit: 'g', range: { min: 25, max: 35 } },
      subGroups: [
        { name: '大豆及豆制品', amount: 15, unit: 'g', description: '以大豆计' },
        { name: '坚果', amount: 10, unit: 'g' },
      ],
      examples: ['黄豆', '黑豆', '豆腐', '豆浆', '核桃', '杏仁', '花生', '腰果'],
      nutritionFocus: ['优质蛋白质', '不饱和脂肪酸', '维生素E', '钙', '磷'],
    },
  ],

  // 关键营养素推荐
  nutrients: [
    {
      nutrient: '能量',
      dailyRecommendation: {
        adult: 2000,
        unit: 'kcal',
        description: '轻体力活动成年女性',
      },
      notes: '成年男性约2400kcal，根据年龄、性别、身体活动水平调整',
    },
    {
      nutrient: '蛋白质',
      dailyRecommendation: {
        adult: 65,
        unit: 'g',
        description: '成年男性，女性约55g',
      },
      sources: ['鱼类', '肉类', '蛋类', '奶类', '大豆制品'],
      benefits: ['肌肉合成', '免疫功能', '酶和激素合成'],
    },
    {
      nutrient: '钙',
      dailyRecommendation: {
        adult: 800,
        unit: 'mg',
      },
      sources: ['奶类', '绿叶蔬菜', '豆制品', '芝麻'],
      benefits: ['骨骼健康', '牙齿健康', '肌肉收缩', '神经传导'],
    },
    {
      nutrient: '铁',
      dailyRecommendation: {
        adult: 12,
        unit: 'mg',
        description: '成年男性，女性约20mg',
      },
      sources: ['红肉', '动物肝脏', '血制品', '绿叶蔬菜'],
      benefits: ['造血功能', '氧气运输', '能量代谢'],
    },
    {
      nutrient: '维生素C',
      dailyRecommendation: {
        adult: 100,
        unit: 'mg',
      },
      sources: ['新鲜蔬菜', '水果', '特别是柑橘类'],
      benefits: ['抗氧化', '免疫功能', '胶原蛋白合成', '铁吸收促进'],
    },
    {
      nutrient: '膳食纤维',
      dailyRecommendation: {
        adult: 25,
        unit: 'g',
      },
      sources: ['全谷物', '蔬菜', '水果', '豆类'],
      benefits: ['消化健康', '血糖控制', '胆固醇调节', '肠道健康'],
    },
  ],

  // 限制摄入指标
  limitations: [
    {
      nutrient: '钠（食盐）',
      maxDaily: { amount: 5, unit: 'g' },
      currentIntake: { amount: 10.5, unit: 'g', description: '中国居民平均摄入量' },
      healthRisks: ['高血压', '心血管疾病', '脑卒中', '胃癌'],
    },
    {
      nutrient: '添加糖',
      maxDaily: { amount: 25, unit: 'g', description: '最好控制在25g以下，不超过50g' },
      sources: ['含糖饮料', '糖果', '甜点', '加工食品'],
      healthRisks: ['肥胖', '糖尿病', '心血管疾病', '龋齿'],
    },
    {
      nutrient: '饱和脂肪酸',
      maxDaily: { amount: 22, unit: 'g', description: '占总能量的10%以下' },
      sources: ['动物脂肪', '棕榈油', '椰子油', '奶油'],
      healthRisks: ['心血管疾病', '高胆固醇'],
    },
    {
      nutrient: '反式脂肪酸',
      maxDaily: { amount: 2, unit: 'g', description: '占总能量的1%以下' },
      sources: ['人造奶油', '酥油', '油炸食品', '加工食品'],
      healthRisks: ['心血管疾病', '炎症反应'],
    },
  ],

  // 特殊人群建议
  specialPopulations: [
    {
      group: '孕妇',
      modifications: [
        '叶酸补充：每日400-800μg',
        '铁：每日24-29mg',
        '钙：每日1000-1200mg',
        '避免生食和酒精',
      ],
    },
    {
      group: '儿童青少年',
      modifications: [
        '充足的钙和维生素D',
        '限制含糖饮料和零食',
        '保证充足的优质蛋白质',
        '规律三餐，适量加餐',
      ],
    },
    {
      group: '老年人',
      modifications: [
        '质地适宜，易于咀嚼消化',
        '充足的蛋白质摄入',
        '注意维生素B12和维生素D',
        '保持适当的身体活动',
      ],
    },
  ],
}

// 季节性食材推荐
export const SEASONAL_FOODS = {
  spring: {
    vegetables: ['韭菜', '菠菜', '豆苗', '春笋', '荠菜', '马兰头'],
    fruits: ['草莓', '樱桃', '枇杷', '桑葚'],
    characteristics: '养肝护肝，清热解毒',
  },
  summer: {
    vegetables: ['冬瓜', '苦瓜', '黄瓜', '番茄', '茄子', '丝瓜'],
    fruits: ['西瓜', '桃子', '李子', '杏子', '葡萄'],
    characteristics: '清热消暑，补充水分',
  },
  autumn: {
    vegetables: ['南瓜', '胡萝卜', '白萝卜', '莲藕', '山药', '芋头'],
    fruits: ['苹果', '梨', '柿子', '石榴', '柚子'],
    characteristics: '润燥养肺，补益脾胃',
  },
  winter: {
    vegetables: ['白菜', '萝卜', '土豆', '红薯', '大葱', '生姜'],
    fruits: ['橙子', '柚子', '猕猴桃', '苹果'],
    characteristics: '温补阳气，增强抵抗力',
  },
}

// 中医食疗理论
export const TCM_FOOD_THERAPY = {
  foodNatures: {
    hot: ['羊肉', '狗肉', '韭菜', '生姜', '辣椒', '桂圆'],
    warm: ['牛肉', '鸡肉', '核桃', '栗子', '大枣', '桃子'],
    neutral: ['猪肉', '鸡蛋', '大米', '玉米', '胡萝卜', '苹果'],
    cool: ['鸭肉', '兔肉', '萝卜', '冬瓜', '梨', '香蕉'],
    cold: ['蟹', '柿子', '西瓜', '苦瓜', '绿豆', '海带'],
  },
  constitution: {
    yangDeficiency: {
      description: '阳虚体质',
      recommendations: ['温性食物', '少食生冷', '适量运动'],
      avoidFoods: ['寒性食物', '生冷饮品', '过多水果'],
    },
    yinDeficiency: {
      description: '阴虚体质',
      recommendations: ['滋阴食物', '少食辛辣', '充足睡眠'],
      avoidFoods: ['热性食物', '辛辣刺激', '油炸食品'],
    },
  },
}
