/**
 * 烹饪方式数据
 * 支持多选和不限制选项
 */
import { Dish, Fries, Chicken, Dessert, Bowl, Mug, Goblet, Burger } from '@element-plus/icons-vue'

export interface CookingMethod {
  label: string
  value: string
  icon?: string
  description?: string
}

const cookingMethods: CookingMethod[] = [
  {
    label: '炒',
    value: 'stir-fry',
    icon: 'Dish',
    description: '用少量油快速翻炒食材'
  },
  {
    label: '煎',
    value: 'pan-fry',
    icon: 'Fries',
    description: '在平底锅中用少量油煎制食材'
  },
  {
    label: '炸',
    value: 'deep-fry',
    icon: 'Chicken',
    description: '将食材浸入热油中炸制'
  },
  {
    label: '烤',
    value: 'bake',
    icon: 'Dessert',
    description: '在烤箱中烤制食材'
  },
  {
    label: '蒸',
    value: 'steam',
    icon: 'Bowl',
    description: '利用水蒸气蒸熟食材'
  },
  {
    label: '煮',
    value: 'boil',
    icon: 'Mug',
    description: '将食材放入沸水中煮熟'
  },
  {
    label: '炖',
    value: 'stew',
    icon: 'Bowl',
    description: '长时间慢煮食材'
  },
  {
    label: '焖',
    value: 'braise',
    icon: 'Bowl',
    description: '先煎后用少量液体慢煮'
  },
  {
    label: '烩',
    value: 'saute',
    icon: 'Dish',
    description: '用少量油煸炒后加入液体慢煮'
  },
  {
    label: '卤',
    value: 'marinate',
    icon: 'Goblet',
    description: '用调味料长时间浸泡食材'
  },
  {
    label: '拌',
    value: 'mix',
    icon: 'Dish',
    description: '将不同食材混合在一起'
  },
  {
    label: '腌',
    value: 'pickle',
    icon: 'Goblet',
    description: '用盐、醋等调味料腌制食材'
  },
  {
    label: '烧烤',
    value: 'grill',
    icon: 'Burger',
    description: '在明火上烤制食材'
  },
  {
    label: '微波',
    value: 'microwave',
    icon: 'Mug',
    description: '使用微波炉加热食材'
  },
  {
    label: '冷藏',
    value: 'refrigerate',
    icon: 'Dessert',
    description: '将食材放入冰箱冷藏'
  },
  {
    label: '生食',
    value: 'raw',
    icon: 'Dish',
    description: '不经过加热直接食用'
  }
]

export default cookingMethods