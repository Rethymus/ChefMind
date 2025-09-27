/**
 * 烹饪方式数据
 * 支持多选和不限制选项
 */

interface CookingMethod {
  id?: string
  label: string
  value: string
  name?: string
  icon?: string
  description?: string
}

export const cookingMethods: CookingMethod[] = [
  {
    id: '1',
    label: '炒',
    value: 'stir-fry',
    name: '炒',
    icon: 'Dish',
    description: '用少量油快速翻炒食材',
  },
  {
    id: '2',
    label: '煎',
    value: 'pan-fry',
    name: '煎',
    icon: 'Fries',
    description: '在平底锅中用少量油煎制食材',
  },
  {
    id: '3',
    label: '炸',
    value: 'deep-fry',
    name: '炸',
    icon: 'Chicken',
    description: '将食材浸入热油中炸制',
  },
  {
    id: '4',
    label: '烤',
    value: 'bake',
    name: '烤',
    icon: 'Dessert',
    description: '在烤箱中烤制食材',
  },
  {
    id: '5',
    label: '蒸',
    value: 'steam',
    name: '蒸',
    icon: 'Bowl',
    description: '利用水蒸气蒸熟食材',
  },
  {
    id: '6',
    label: '煮',
    value: 'boil',
    name: '煮',
    icon: 'Mug',
    description: '将食材放入沸水中煮熟',
  },
  {
    id: '7',
    label: '炖',
    value: 'stew',
    name: '炖',
    icon: 'Bowl',
    description: '长时间慢煮食材',
  },
  {
    id: '8',
    label: '焖',
    value: 'braise',
    name: '焖',
    icon: 'Bowl',
    description: '先煎后用少量液体慢煮',
  },
  {
    id: '9',
    label: '烩',
    value: 'saute',
    name: '烩',
    icon: 'Dish',
    description: '用少量油煸炒后加入液体慢煮',
  },
  {
    id: '10',
    label: '卤',
    value: 'marinate',
    name: '卤',
    icon: 'Goblet',
    description: '用调味料长时间浸泡食材',
  },
  {
    id: '11',
    label: '拌',
    value: 'mix',
    name: '拌',
    icon: 'Dish',
    description: '将不同食材混合在一起',
  },
  {
    id: '12',
    label: '腌',
    value: 'pickle',
    name: '腌',
    icon: 'Goblet',
    description: '用盐、醋等调味料腌制食材',
  },
  {
    id: '13',
    label: '烧烤',
    value: 'grill',
    name: '烧烤',
    icon: 'Burger',
    description: '在明火上烤制食材',
  },
  {
    id: '14',
    label: '微波',
    value: 'microwave',
    name: '微波',
    icon: 'Mug',
    description: '使用微波炉加热食材',
  },
  {
    id: '15',
    label: '凉拌',
    value: 'cold-mix',
    name: '凉拌',
    icon: 'Dish',
    description: '不加热直接调味拌制',
  },
]

// 获取所有烹饪方式
function getAllCookingMethods(): CookingMethod[] {
  return cookingMethods
}

// 根据值查找烹饪方式
function findCookingMethod(value: string): CookingMethod | undefined {
  return cookingMethods.find(method => method.value === value)
}

// 根据ID查找烹饪方式
function findCookingMethodById(id: string): CookingMethod | undefined {
  return cookingMethods.find(method => method.id === id)
}

