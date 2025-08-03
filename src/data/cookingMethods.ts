import type { CookingMethod } from '../types/recipe';

/**
 * 烹饪方式列表
 */
export const cookingMethods: CookingMethod[] = [
  {
    id: 1,
    name: '炒',
    description: '用少量油快速烹饪食材',
    time: 15,
    difficulty: 2,
    icon: 'wok'
  },
  {
    id: 2,
    name: '煮',
    description: '将食材放入沸水中烹饪',
    time: 30,
    difficulty: 1,
    icon: 'pot'
  },
  {
    id: 3,
    name: '蒸',
    description: '利用水蒸气烹饪食材',
    time: 25,
    difficulty: 2,
    icon: 'steamer'
  },
  {
    id: 4,
    name: '炖',
    description: '长时间慢火烹饪食材',
    time: 60,
    difficulty: 2,
    icon: 'stew'
  },
  {
    id: 5,
    name: '煎',
    description: '在平底锅中用油烹饪食材',
    time: 20,
    difficulty: 3,
    icon: 'pan'
  },
  {
    id: 6,
    name: '烤',
    description: '在烤箱中烹饪食材',
    time: 40,
    difficulty: 3,
    icon: 'oven'
  },
  {
    id: 7,
    name: '焖',
    description: '密闭容器中慢火烹饪',
    time: 45,
    difficulty: 2,
    icon: 'pot'
  },
  {
    id: 8,
    name: '炸',
    description: '将食材放入热油中烹饪',
    time: 20,
    difficulty: 4,
    icon: 'deep-fryer'
  },
  {
    id: 9,
    name: '凉拌',
    description: '将食材与调料混合',
    time: 10,
    difficulty: 1,
    icon: 'salad'
  },
  {
    id: 10,
    name: '腌制',
    description: '用调料浸泡食材',
    time: 120,
    difficulty: 1,
    icon: 'jar'
  }
];