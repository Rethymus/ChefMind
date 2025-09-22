// 图片工具函数

// 食谱图片集合
const recipeImages = [
  '/images/recipe-general-1.jpg',
  '/images/recipe-general-2.jpg',
  '/images/recipe-general-1.jpg',
  '/images/recipe-general-2.jpg',
  '/images/recipe-general-1.jpg',
  '/images/recipe-general-2.jpg',
  '/images/recipe-general-1.jpg',
  '/images/recipe-general-2.jpg',
  '/images/recipe-general-1.jpg',
  '/images/recipe-general-2.jpg'
]

// 中式菜肴图片集合
const chineseFoodImages = [
  '/images/chinese-food-1.jpg',
  '/images/chinese-food-1.jpg',
  '/images/chinese-food-1.jpg',
  '/images/chinese-food-1.jpg',
  '/images/chinese-food-1.jpg',
  '/images/chinese-food-1.jpg',
  '/images/chinese-food-1.jpg',
  '/images/chinese-food-1.jpg'
]

// 按食材分类的图片集合
const ingredientBasedImages: Record<string, string[]> = {
  '肉类': [
    '/images/meat-dish.jpg',
    '/images/meat-dish.jpg',
    '/images/meat-dish.jpg'
  ],
  '蔬菜': [
    '/images/vegetables.jpg',
    '/images/vegetables.jpg',
    '/images/vegetables.jpg'
  ],
  '海鲜': [
    '/images/recipe-general-1.jpg',
    '/images/recipe-general-1.jpg',
    '/images/recipe-general-1.jpg'
  ],
  '豆腐': [
    '/images/recipe-general-2.jpg',
    '/images/recipe-general-2.jpg'
  ],
  '鸡蛋': [
    '/images/recipe-general-1.jpg',
    '/images/recipe-general-1.jpg'
  ],
  '米饭': [
    '/images/recipe-general-2.jpg',
    '/images/recipe-general-2.jpg'
  ],
  '面食': [
    '/images/recipe-general-1.jpg',
    '/images/recipe-general-1.jpg'
  ]
}

// 按烹饪方式分类的图片集合
const cookingMethodImages: Record<string, string[]> = {
  '炒': [
    '/images/chinese-food-1.jpg',
    '/images/chinese-food-1.jpg'
  ],
  '煮': [
    '/images/chinese-food-1.jpg',
    '/images/chinese-food-1.jpg'
  ],
  '蒸': [
    '/images/chinese-food-1.jpg',
    '/images/chinese-food-1.jpg'
  ],
  '炖': [
    '/images/chinese-food-1.jpg',
    '/images/chinese-food-1.jpg'
  ],
  '煎': [
    '/images/meat-dish.jpg',
    '/images/meat-dish.jpg'
  ],
  '烤': [
    '/images/meat-dish.jpg',
    '/images/meat-dish.jpg'
  ]
}

/**
 * 获取随机图片URL
 * @returns 随机图片URL
 */
export const getRandomImage = (): string => {
  const randomIndex = Math.floor(Math.random() * recipeImages.length)
  return recipeImages[randomIndex]
}

/**
 * 根据食材获取相关图片
 * @param ingredients 食材列表
 * @returns 相关图片URL
 */
export const getImageByIngredients = (ingredients: string[]): string => {
  // 检查食材是否包含特定类别
  for (const ingredient of ingredients) {
    for (const [category, images] of Object.entries(ingredientBasedImages)) {
      if (ingredient.includes(category)) {
        const randomIndex = Math.floor(Math.random() * images.length)
        return images[randomIndex]
      }
    }
  }
  
  // 如果没有匹配的食材类别，返回中式菜肴图片
  const randomIndex = Math.floor(Math.random() * chineseFoodImages.length)
  return chineseFoodImages[randomIndex]
}

/**
 * 根据烹饪方式获取相关图片
 * @param method 烹饪方式
 * @returns 相关图片URL
 */
export const getImageByCookingMethod = (method: string): string => {
  for (const [cookMethod, images] of Object.entries(cookingMethodImages)) {
    if (method.includes(cookMethod)) {
      const randomIndex = Math.floor(Math.random() * images.length)
      return images[randomIndex]
    }
  }
  
  // 如果没有匹配的烹饪方式，返回随机中式菜肴图片
  const randomIndex = Math.floor(Math.random() * chineseFoodImages.length)
  return chineseFoodImages[randomIndex]
}

/**
 * 根据食谱信息智能选择最合适的图片
 * @param recipe 食谱信息
 * @returns 相关图片URL
 */
export const getSmartRecipeImage = (recipe: { 
  name: string, 
  ingredients?: string[], 
  cookingMethod?: string 
}): string => {
  // 首先尝试根据烹饪方式获取图片
  if (recipe.cookingMethod) {
    for (const [method, images] of Object.entries(cookingMethodImages)) {
      if (recipe.cookingMethod.includes(method) || recipe.name.includes(method)) {
        const randomIndex = Math.floor(Math.random() * images.length)
        return images[randomIndex]
      }
    }
  }
  
  // 然后尝试根据食材获取图片
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    return getImageByIngredients(recipe.ingredients)
  }
  
  // 最后尝试根据名称中可能包含的食材或烹饪方式获取图片
  for (const [category, images] of Object.entries(ingredientBasedImages)) {
    if (recipe.name.includes(category)) {
      const randomIndex = Math.floor(Math.random() * images.length)
      return images[randomIndex]
    }
  }
  
  // 如果都没有匹配，返回随机图片
  return getRandomImage()
}