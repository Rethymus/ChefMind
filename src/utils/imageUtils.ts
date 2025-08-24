// 图片工具函数

// 食谱图片集合
const recipeImages = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZvb2R8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGZvb2R8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGZvb2R8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D',
  'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGZvb2R8ZW58MHx8MHx8fDA%3D'
]

// 中式菜肴图片集合
const chineseFoodImages = [
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1623689046286-01d442216df1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1617692855027-33b14f061079?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1583077874340-79db6564682e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1625398407796-82650a8c9dd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNoaW5lc2UlMjBmb29kfGVufDB8fDB8fHww'
]

// 按食材分类的图片集合
const ingredientBasedImages: Record<string, string[]> = {
  '肉类': [
    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWVhdCUyMGRpc2h8ZW58MHx8MHx8fDA%3D',
    'https://images.unsplash.com/photo-1611315764615-3e788573f31e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWVhdCUyMGRpc2h8ZW58MHx8MHx8fDA%3D',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1lYXQlMjBkaXNofGVufDB8fDB8fHww'
  ],
  '蔬菜': [
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dmVnZXRhYmxlJTIwZGlzaHxlbnwwfHwwfHx8MA%3D%3D',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnZXRhYmxlJTIwZGlzaHxlbnwwfHwwfHx8MA%3D%3D',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dmVnZXRhYmxlJTIwZGlzaHxlbnwwfHwwfHx8MA%3D%3D'
  ],
  '海鲜': [
    'https://images.unsplash.com/photo-1579631542720-3a87824fff86?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2VhZm9vZCUyMGRpc2h8ZW58MHx8MHx8fDA%3D',
    'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2VhZm9vZCUyMGRpc2h8ZW58MHx8MHx8fDA%3D',
    'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2VhZm9vZCUyMGRpc2h8ZW58MHx8MHx8fDA%3D'
  ],
  '豆腐': [
    'https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dG9mdSUyMGRpc2h8ZW58MHx8MHx8fDA%3D',
    'https://images.unsplash.com/photo-1546069901-5ec6a79120b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9mdSUyMGRpc2h8ZW58MHx8MHx8fDA%3D'
  ],
  '鸡蛋': [
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWdnJTIwZGlzaHxlbnwwfHwwfHx8MA%3D%3D',
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZWdnJTIwZGlzaHxlbnwwfHwwfHx8MA%3D%3D'
  ],
  '米饭': [
    'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmljZSUyMGRpc2h8ZW58MHx8MHx8fDA%3D',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmljZSUyMGRpc2h8ZW58MHx8MHx8fDA%3D'
  ],
  '面食': [
    'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bm9vZGxlJTIwZGlzaHxlbnwwfHwwfHx8MA%3D%3D',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bm9vZGxlJTIwZGlzaHxlbnwwfHwwfHx8MA%3D%3D'
  ]
}

// 按烹饪方式分类的图片集合
const cookingMethodImages: Record<string, string[]> = {
  '炒': [
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D',
    'https://images.unsplash.com/photo-1625398407796-82650a8c9dd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNoaW5lc2UlMjBmb29kfGVufDB8fDB8fHww'
  ],
  '煮': [
    'https://images.unsplash.com/photo-1583077874340-79db6564682e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D',
    'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D'
  ],
  '蒸': [
    'https://images.unsplash.com/photo-1617692855027-33b14f061079?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D',
    'https://images.unsplash.com/photo-1623689046286-01d442216df1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D'
  ],
  '炖': [
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D',
    'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D'
  ],
  '煎': [
    'https://images.unsplash.com/photo-1625398407796-82650a8c9dd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNoaW5lc2UlMjBmb29kfGVufDB8fDB8fHww',
    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWVhdCUyMGRpc2h8ZW58MHx8MHx8fDA%3D'
  ],
  '烤': [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1lYXQlMjBkaXNofGVufDB8fDB8fHww',
    'https://images.unsplash.com/photo-1611315764615-3e788573f31e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWVhdCUyMGRpc2h8ZW58MHx8MHx8fDA%3D'
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