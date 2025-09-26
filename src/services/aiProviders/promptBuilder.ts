import type { RecipeGenerationParams } from '@/types/recipe'

/**
 * 通用提示词构建工具
 * 为所有AI提供商提供统一的提示词构建逻辑
 */
export class PromptBuilder {
  /**
   * 构建食谱生成提示词
   */
  static buildRecipePrompt(params: RecipeGenerationParams): string {
    if (params.requestType === 'dish_recreation' && params.dishName) {
      return this.buildDishRecreationPrompt(params)
    } else if (params.requestType === 'search_only') {
      return this.buildSearchOnlyPrompt(params)
    } else {
      return this.buildIngredientBasedPrompt(params)
    }
  }

  /**
   * 构建搜索专用提示词（不包含任何偏好设置）
   */
  private static buildSearchOnlyPrompt(params: RecipeGenerationParams): string {
    return `
请根据以下食材或菜品名称，生成一个详细的食谱：

食材: ${params.ingredients.join(', ')}

请以JSON格式返回食谱，包含以下字段：
- title: 食谱标题
- description: 食谱描述
- ingredients: 食材清单（包括用量）
- instructions: 制作步骤
- cookingTime: 制作时间
- servings: 份数
- difficulty: 难度
- cookingMethods: 烹饪方式
- kitchenware: 厨具
- nutrition: 营养信息
- cookingTips: 烹饪技巧
`
  }

  /**
   * 构建基于食材的提示词
   */
  private static buildIngredientBasedPrompt(params: RecipeGenerationParams): string {
    const parameterLines = [
      `食材: ${params.ingredients.join(', ')}`,
      params.cookingMethods?.length ? `烹饪方式: ${params.cookingMethods.join(', ')}` : '',
      params.noMethodRestriction ? '不限制烹饪方式（请选择最适合的烹饪方式）' : '',
      params.kitchenware?.length ? `厨具: ${params.kitchenware.join(', ')}` : '',
      params.dietaryRestrictions?.length
        ? `饮食限制: ${params.dietaryRestrictions.join(', ')}（必须严格遵守）`
        : '',
      params.healthGoals?.length ? `健康目标: ${params.healthGoals.join(', ')}` : '',
      params.allergies?.length ? `过敏原: ${params.allergies.join(', ')}（绝对不能使用）` : '',
      params.flavorPreferences?.length ? `口味偏好: ${params.flavorPreferences.join(', ')}` : '',
      params.spiceLevel ? `辣度: ${params.spiceLevel}` : '',
      params.sweetnessLevel ? `甜度: ${params.sweetnessLevel}` : '',
      params.servings ? `份量: ${params.servings}人份` : '',
      params.cookingTime ? `制作时间: ${params.cookingTime}` : '',
      params.difficulty ? `难度: ${params.difficulty}` : '',
      params.autoCompleteIngredients ? '请自动添加必要的调料和辅料' : '',
    ].filter(Boolean)

    const restrictions = [
      params.dietaryRestrictions?.length
        ? `饮食限制：${params.dietaryRestrictions.join(', ')}`
        : '',
      params.allergies?.length
        ? `过敏原：${params.allergies.join(', ')}（绝对不能使用这些食材）`
        : '',
    ].filter(Boolean)

    const restrictionsNote =
      restrictions.length > 0
        ? `\n\n⚠️ 重要提醒：${restrictions.join('；')}。生成的食谱必须严格遵守这些限制，绝对不能包含任何禁用食材。`
        : ''

    // 构建味道偏好详细指令
    const flavorInstructions = this.buildFlavorInstructions(params)

    const autoCompleteInstructions = params.autoCompleteIngredients
      ? '请自动添加必要的调料和辅料，使食谱更加完整。'
      : ''

    return `
请根据以下食材和要求，生成一个详细的食谱：

${parameterLines.join('\n')}
${restrictionsNote}
${flavorInstructions}
${autoCompleteInstructions}

请确保生成的食谱完全符合用户的所有饮食限制和偏好。味道偏好必须严格遵循，食材选择和调料搭配必须符合指定的辣度和甜度要求。

请以JSON格式返回食谱，包含以下字段：
- title: 食谱标题
- description: 食谱描述
- ingredients: 食材清单（包括用量）
- instructions: 制作步骤
- cookingTime: 制作时间
- servings: 份数
- difficulty: 难度
- cookingMethods: 烹饪方式
- kitchenware: 厨具
- dietaryRestrictions: 饮食限制
- healthGoals: 健康目标
- allergies: 过敏原
- flavorPreferences: 口味偏好
- spiceLevel: 辣度
- sweetnessLevel: 甜度
- nutrition: 营养信息
`
  }

  /**
   * 构建菜品重建的提示词
   */
  private static buildDishRecreationPrompt(params: RecipeGenerationParams): string {
    const restrictions = [
      params.dietaryRestrictions?.length
        ? `饮食限制：${params.dietaryRestrictions.join(', ')}`
        : '',
      params.allergies?.length
        ? `过敏原：${params.allergies.join(', ')}（绝对不能使用这些食材）`
        : '',
    ].filter(Boolean)

    const restrictionsNote =
      restrictions.length > 0
        ? `\n\n⚠️ 重要提醒：${restrictions.join('；')}。生成的食谱必须严格遵守这些限制，绝对不能包含任何禁用食材。`
        : ''

    // 构建味道偏好详细指令
    const flavorInstructions = this.buildFlavorInstructions(params)

    const autoCompleteInstructions = params.autoCompleteIngredients
      ? '请自动添加必要的调料和辅料，使食谱更加完整。'
      : ''

    return `
请为"${params.dishName}"这道菜生成一个详细的制作食谱。请注意这是一道具体的菜品，不是食材。

请分析这道菜的特点，推断出所需的食材和制作方法，并以JSON格式返回完整的食谱：

菜品名称: ${params.dishName}
${params.servings ? `份量: ${params.servings}人份` : ''}
${params.cookingTime ? `制作时间: ${params.cookingTime}` : ''}
${params.difficulty ? `难度: ${params.difficulty}` : ''}
${params.dietaryRestrictions?.length ? `饮食限制: ${params.dietaryRestrictions.join(', ')}（必须严格遵守）` : ''}
${params.allergies?.length ? `过敏原: ${params.allergies.join(', ')}（绝对不能使用）` : ''}
${params.spiceLevel ? `辣度: ${params.spiceLevel}` : ''}
${params.sweetnessLevel ? `甜度: ${params.sweetnessLevel}` : ''}
${params.healthGoals?.length ? `健康目标: ${params.healthGoals.join(', ')}` : ''}
${restrictionsNote}
${flavorInstructions}
${autoCompleteInstructions}

请确保：
1. 准确还原这道菜的传统做法
2. 提供详细的食材清单（包括用量）
3. 详细的制作步骤
4. 相关的烹饪技巧和注意事项
5. 严格遵守所有饮食限制和过敏原要求
6. 味道偏好必须严格遵循，食材选择和调料搭配必须符合指定的辣度和甜度要求

请以JSON格式返回食谱，包含所有必要的字段。
`
  }

  /**
   * 构建味道偏好详细指令
   */
  private static buildFlavorInstructions(params: RecipeGenerationParams): string {
    const instructions: string[] = []

    // 辣度指令
    if (params.spiceLevel) {
      switch (params.spiceLevel) {
        case 'none':
          instructions.push('🌶️ 辣度要求：完全不吃辣，严禁使用任何辣椒、花椒、胡椒等辛辣调料')
          break
        case 'mild':
          instructions.push('🌶️ 辣度要求：微辣，可以少量使用辣椒粉或少量新鲜辣椒提味')
          break
        case 'medium':
          instructions.push('🌶️ 辣度要求：中辣，适量使用干辣椒、辣椒面或新鲜辣椒')
          break
        case 'hot':
          instructions.push('🌶️ 辣度要求：重辣，必须使用足量的辣椒、花椒、辣椒油等辛辣调料')
          break
      }
    }

    // 甜度指令
    if (params.sweetnessLevel) {
      switch (params.sweetnessLevel) {
        case 'none':
          instructions.push('🍬 甜度要求：完全不甜，严禁使用冰糖、白糖、红糖等任何糖类')
          break
        case 'low':
          instructions.push('🍬 甜度要求：微甜，可以极少量使用糖类调味，主要用于提鲜')
          break
        case 'medium':
          instructions.push('🍬 甜度要求：适中甜度，适量使用糖类调味，平衡其他味道')
          break
        case 'high':
          instructions.push('🍬 甜度要求：很甜，必须使用足量的糖类，冰糖、白糖、蜂蜜等')
          break
      }
    }

    // 口味偏好指令
    if (params.flavorPreferences?.length) {
      const flavorMapping: Record<string, string> = {
        酸甜: '🍋 口味要求：酸甜口味，需要同时使用酸味调料（如醋、柠檬）和甜味调料',
        咸鲜: '🧂 口味要求：咸鲜口味，突出鲜味，适量使用盐、酱油、味精等',
        香辣: '🔥 口味要求：香辣口味，在辣味基础上增加香味，如蒜香、姜香',
        麻辣: '🌶️ 口味要求：麻辣口味，必须同时使用辣椒和花椒',
        清淡: '🌿 口味要求：清淡口味，少油少盐，突出食材本味',
        浓郁: '🍖 口味要求：浓郁口味，使用多种调料，味道厚重',
      }

      params.flavorPreferences.forEach(flavor => {
        if (flavorMapping[flavor]) {
          instructions.push(flavorMapping[flavor])
        }
      })
    }

    return instructions.length > 0 ? `\n\n🎯 味道偏好详细指令：\n${instructions.join('\n')}` : ''
  }
}
