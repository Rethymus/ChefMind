import { Recipe, RecipeGenerationParams, IngredientValidationResult } from '@/types/recipe'
import type { BaseAIProvider } from './baseProvider'

/**
 * 模拟AI提供者
 * 用于开发和测试环境
 */
export class MockAIProvider implements BaseAIProvider {
  async generateRecipe(params: RecipeGenerationParams): Promise<Recipe> {
    console.log('使用模拟AI生成食谱，参数:', params)

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 处理自动补充食材
    const ingredients = [...params.ingredients]
    const autoCompletedIngredients: string[] = []

    if (params.autoCompleteIngredients) {
      // 自动补充调料和辅料
      const basicSeasonings = ['盐', '生抽', '料酒', '白糖', '香油']
      const additionalSeasonings = [
        '葱',
        '姜',
        '蒜',
        '八角',
        '花椒',
        '胡椒粉',
        '醋',
        '蚝油',
        '辣椒粉',
      ]

      // 根据食材数量决定补充多少调料
      const seasoningCount = Math.min(3 + Math.floor(Math.random() * 3), basicSeasonings.length)
      const additionalCount = Math.min(
        2 + Math.floor(Math.random() * 3),
        additionalSeasonings.length
      )

      // 添加基础调料
      for (let i = 0; i < seasoningCount; i++) {
        const seasoning = basicSeasonings[i]
        if (!ingredients.includes(seasoning)) {
          ingredients.push(seasoning)
          autoCompletedIngredients.push(seasoning)
        }
      }

      // 添加额外调料
      const shuffledAdditional = [...additionalSeasonings].sort(() => 0.5 - Math.random())
      for (let i = 0; i < additionalCount; i++) {
        const seasoning = shuffledAdditional[i]
        if (!ingredients.includes(seasoning)) {
          ingredients.push(seasoning)
          autoCompletedIngredients.push(seasoning)
        }
      }

      // 根据烹饪方式补充辅料
      if (params.cookingMethods && params.cookingMethods.length > 0) {
        if (params.cookingMethods.includes('炒') || params.cookingMethods.includes('煎')) {
          if (!ingredients.includes('食用油')) {
            ingredients.push('食用油')
            autoCompletedIngredients.push('食用油')
          }
        }

        if (params.cookingMethods.includes('蒸')) {
          if (!ingredients.includes('清水')) {
            ingredients.push('清水')
            autoCompletedIngredients.push('清水')
          }
        }

        if (params.cookingMethods.includes('炖') || params.cookingMethods.includes('煮')) {
          if (!ingredients.includes('清水')) {
            ingredients.push('清水')
            autoCompletedIngredients.push('清水')
          }
        }
      }
    }

    // 生成菜品标题
    const recipeTitle = this.generateRecipeTitle(params.ingredients)

    // 根据参数生成模拟食谱
    const recipe: Recipe = {
      id: 'mock-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9),
      title: recipeTitle,
      name: recipeTitle,
      description: `这是一道使用${params.ingredients.join('、')}制作的美味食谱，适合${params.servings || 4}人食用。`,
      ingredients: ingredients,
      instructions: this.generateInstructions(
        params.ingredients,
        params.cookingMethods,
        params.noMethodRestriction
      ),
      cookingTime: params.cookingTime || '30分钟内',
      time: parseInt(params.cookingTime?.replace(/\D/g, '') || '30'),
      servings: params.servings || 4,
      difficulty: params.difficulty || '中等',
      cookingMethods: params.noMethodRestriction
        ? this.getRandomCookingMethods()
        : params.cookingMethods || ['炒'],
      kitchenware: params.kitchenware || ['炒锅', '铲子'],
      dietaryRestrictions: params.dietaryRestrictions || [],
      healthGoals: params.healthGoals || [],
      allergies: params.allergies || [],
      flavorPreferences: params.flavorPreferences || [],
      spiceLevel: params.spiceLevel || 'medium',
      sweetnessLevel: params.sweetnessLevel || 'medium',
      nutrition: {
        calories: 350,
        protein: 15,
        carbs: 40,
        fat: 12,
      },
      cookingTips: [
        '食材最好新鲜，可以提前准备好',
        '注意火候控制，避免食材过熟或不熟',
        '可以根据个人口味调整调料用量',
      ],
      tags: this.generateTags(params),
      autoCompletedIngredients: autoCompletedIngredients, // 添加自动补充的食材列表
    }

    return recipe
  }

  async validateIngredient(ingredient: string): Promise<IngredientValidationResult> {
    console.log('验证食材:', ingredient)

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 800))

    // 简单的验证逻辑
    const invalidIngredients = ['洗衣粉', '洗洁精', '肥皂', '洗发水', '沐浴露', '香水']
    const isValid = !invalidIngredients.some(item => ingredient.includes(item))

    return {
      isValid,
      reason: isValid ? `"${ingredient}"是常见的可食用食材` : `"${ingredient}"不是可食用的食材`,
      alternatives: isValid ? [] : ['鸡肉', '牛肉', '猪肉', '土豆', '胡萝卜'].slice(0, 3),
    }
  }

  private generateRecipeTitle(ingredients: string[]): string {
    const mainIngredient = ingredients[0] || '美味'
    const secondIngredient = ingredients.length > 1 ? ingredients[1] : ''

    const cookingStyles = [
      '香煎',
      '爆炒',
      '清蒸',
      '红烧',
      '糖醋',
      '麻辣',
      '五香',
      '酱爆',
      '干锅',
      '香辣',
    ]
    const cookingStyle = cookingStyles[Math.floor(Math.random() * cookingStyles.length)]

    if (secondIngredient) {
      return `${cookingStyle}${mainIngredient}${secondIngredient}`
    } else {
      return `${cookingStyle}${mainIngredient}`
    }
  }

  private generateIngredients(ingredients: string[]): string[] {
    const result = [...ingredients]

    // 添加一些基础调料
    const seasonings = ['盐', '生抽', '料酒', '白糖', '香油', '葱', '姜', '蒜']
    const selectedSeasonings = seasonings.slice(0, 3 + Math.floor(Math.random() * 5))

    return [...result, ...selectedSeasonings]
  }

  private generateInstructions(
    ingredients: string[],
    cookingMethods: string[] = [],
    noMethodRestriction: boolean = false
  ): string[] {
    const mainIngredient = ingredients[0] || '食材'
    let cookingMethod = '烹饪'

    // 如果不限制烹饪方式，随机选择一种
    if (noMethodRestriction) {
      const methods = ['炒', '煎', '炸', '烤', '蒸', '煮', '炖']
      cookingMethod = methods[Math.floor(Math.random() * methods.length)]
    }
    // 如果指定了烹饪方式，使用第一种
    else if (cookingMethods && cookingMethods.length > 0) {
      cookingMethod = cookingMethods[0]
    }

    // 根据烹饪方式生成不同的步骤
    switch (cookingMethod) {
      case '炒':
        return [
          `准备好所有食材，将${mainIngredient}洗净切块。`,
          '热锅凉油，放入葱姜蒜爆香。',
          `放入${mainIngredient}翻炒至变色。`,
          '加入调料，继续翻炒至入味。',
          '调整口味，装盘即可食用。',
        ]
      case '煎':
        return [
          `准备好所有食材，将${mainIngredient}洗净切片。`,
          '热锅倒入适量油，油温六成热时放入食材。',
          `小火煎制${mainIngredient}至一面金黄。`,
          '翻面继续煎制至两面金黄。',
          '加入调料，装盘即可食用。',
        ]
      case '炸':
        return [
          `准备好所有食材，将${mainIngredient}洗净切块。`,
          '准备面糊，将食材裹上面糊。',
          '锅中倒入适量油，油温七成热时放入食材。',
          `炸至${mainIngredient}金黄酥脆。`,
          '捞出沥油，撒上调料即可食用。',
        ]
      case '烤':
        return [
          `准备好所有食材，将${mainIngredient}洗净处理。`,
          '预热烤箱至180度。',
          '将食材放入烤盘，刷上油和调料。',
          `烤制${mainIngredient}约15-20分钟。`,
          '取出后稍微冷却，装盘即可食用。',
        ]
      case '蒸':
        return [
          `准备好所有食材，将${mainIngredient}洗净处理。`,
          '锅中加水烧开。',
          '将食材放入蒸盘，撒上调料。',
          `蒸制${mainIngredient}约10-15分钟。`,
          '取出后撒上葱花，装盘即可食用。',
        ]
      case '煮':
        return [
          `准备好所有食材，将${mainIngredient}洗净处理。`,
          '锅中加水烧开。',
          '放入食材和调料。',
          `煮制${mainIngredient}至熟透。`,
          '调整口味，装盘即可食用。',
        ]
      case '炖':
        return [
          `准备好所有食材，将${mainIngredient}洗净切块。`,
          '锅中加水和调料，烧开。',
          '放入食材，转小火慢炖。',
          `炖制${mainIngredient}约30-40分钟至软烂。`,
          '调整口味，装盘即可食用。',
        ]
      default:
        return [
          `准备好所有食材，将${mainIngredient}洗净处理。`,
          '按照喜好的烹饪方式处理食材。',
          '加入适量调料调味。',
          '烹饪至食材熟透入味。',
          '装盘即可食用。',
        ]
    }
  }

  private generateTags(params: RecipeGenerationParams): string[] {
    const tags: string[] = []

    // 添加主要食材标签
    if (params.ingredients.length > 0) {
      tags.push(params.ingredients[0])
    }

    // 添加烹饪方式标签
    if (params.cookingMethods && params.cookingMethods.length > 0) {
      tags.push(params.cookingMethods[0])
    } else if (params.noMethodRestriction) {
      const methods = ['炒', '煎', '炸', '烤', '蒸', '煮', '炖']
      tags.push(methods[Math.floor(Math.random() * methods.length)])
    }

    // 添加难度标签
    if (params.difficulty) {
      tags.push(params.difficulty)
    }

    // 添加饮食限制标签
    if (params.dietaryRestrictions && params.dietaryRestrictions.length > 0) {
      tags.push(params.dietaryRestrictions[0])
    }

    // 添加健康目标标签
    if (params.healthGoals && params.healthGoals.length > 0) {
      tags.push(params.healthGoals[0])
    }

    // 添加口味偏好标签
    if (params.flavorPreferences && params.flavorPreferences.length > 0) {
      tags.push(params.flavorPreferences[0])
    }

    return tags
  }

  // 随机获取烹饪方式
  private getRandomCookingMethods(): string[] {
    const allMethods = ['炒', '煎', '炸', '烤', '蒸', '煮', '炖', '焖', '烩', '卤', '拌', '腌']
    const count = 1 + Math.floor(Math.random() * 2) // 随机选择1-2种烹饪方式
    const result: string[] = []

    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * allMethods.length)
      result.push(allMethods[index])
      allMethods.splice(index, 1) // 避免重复选择
    }

    return result
  }
}

export default new MockAIProvider()
