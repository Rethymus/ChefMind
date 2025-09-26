import type { RecipeGenerationParams } from '@/types/recipe'
import type { UserPreferences } from '@/services/aiService'

/**
 * 参数适配器
 * 将不同格式的参数统一转换为RecipeGenerationParams格式
 */
export class ParamAdapter {
  /**
   * 将各种参数格式转换为标准的RecipeGenerationParams
   */
  static toRecipeGenerationParams(
    ingredientsOrParams: string[] | RecipeGenerationParams | any,
    preferences?: UserPreferences,
    isSearchMode: boolean = false
  ): RecipeGenerationParams {
    // 如果已经是RecipeGenerationParams格式
    if (
      ingredientsOrParams &&
      typeof ingredientsOrParams === 'object' &&
      ingredientsOrParams.ingredients
    ) {
      return {
        ingredients: ingredientsOrParams.ingredients || [],
        cookingMethods:
          ingredientsOrParams.cookingMethods || ingredientsOrParams.cookingMethod
            ? [ingredientsOrParams.cookingMethod].filter(Boolean)
            : [],
        noMethodRestriction: false,
        kitchenware: ingredientsOrParams.kitchenware || [],
        dietaryRestrictions:
          ingredientsOrParams.dietaryRestrictions || preferences?.dietaryRestrictions || [],
        healthGoals: ingredientsOrParams.healthGoals || preferences?.healthGoals || [],
        allergies: ingredientsOrParams.allergies || preferences?.allergies || [],
        flavorPreferences:
          ingredientsOrParams.flavorPreferences || preferences?.flavorPreferences || [],
        spiceLevel: isSearchMode
          ? 'none'
          : ingredientsOrParams.spiceLevel || preferences?.spiceLevel || 'medium',
        sweetnessLevel: isSearchMode
          ? 'none'
          : ingredientsOrParams.sweetnessLevel || preferences?.sweetnessLevel || 'medium',
        servings: ingredientsOrParams.servings || preferences?.servings || 2,
        cookingTime: ingredientsOrParams.cookingTime || preferences?.cookingTime || '30分钟',
        difficulty: ingredientsOrParams.difficulty || preferences?.difficulty || '中等',
        autoCompleteIngredients: ingredientsOrParams.autoCompleteIngredients ?? true,
        dishName: ingredientsOrParams.dishName,
        requestType: ingredientsOrParams.requestType || 'ingredient_based',
      }
    }

    // 如果是字符串数组格式
    if (Array.isArray(ingredientsOrParams)) {
      return {
        ingredients: ingredientsOrParams,
        cookingMethods: [],
        noMethodRestriction: false,
        kitchenware: [],
        dietaryRestrictions: preferences?.dietaryRestrictions || [],
        healthGoals: preferences?.healthGoals || [],
        allergies: preferences?.allergies || [],
        flavorPreferences: preferences?.flavorPreferences || [],
        spiceLevel: isSearchMode ? 'none' : preferences?.spiceLevel || 'medium',
        sweetnessLevel: isSearchMode ? 'none' : preferences?.sweetnessLevel || 'medium',
        servings: preferences?.servings || 2,
        cookingTime: preferences?.cookingTime || '30分钟',
        difficulty: preferences?.difficulty || '中等',
        autoCompleteIngredients: true,
      }
    }

    // 默认返回空配置
    return {
      ingredients: [],
      cookingMethods: [],
      noMethodRestriction: false,
      kitchenware: [],
      dietaryRestrictions: [],
      healthGoals: [],
      allergies: [],
      flavorPreferences: [],
      spiceLevel: isSearchMode ? 'none' : 'medium',
      sweetnessLevel: isSearchMode ? 'none' : 'medium',
      servings: 2,
      cookingTime: '30分钟',
      difficulty: '中等',
      autoCompleteIngredients: true,
    }
  }

  /**
   * 从UserPreferences创建RecipeGenerationParams
   */
  static fromPreferences(
    ingredients: string[],
    preferences: UserPreferences
  ): RecipeGenerationParams {
    return {
      ingredients,
      cookingMethods: [],
      noMethodRestriction: false,
      kitchenware: [],
      dietaryRestrictions: preferences.dietaryRestrictions || [],
      healthGoals: preferences.healthGoals || [],
      allergies: preferences.allergies || [],
      flavorPreferences: preferences.flavorPreferences || [],
      spiceLevel: preferences.spiceLevel || 'medium',
      sweetnessLevel: preferences.sweetnessLevel || 'medium',
      servings: preferences.servings || 2,
      cookingTime: preferences.cookingTime?.toString() || '30分钟',
      difficulty: preferences.difficulty?.toString() || '中等',
      autoCompleteIngredients: preferences.autoCompleteIngredients ?? true,
    }
  }
}
