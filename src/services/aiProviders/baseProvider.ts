import { Recipe, RecipeGenerationParams, IngredientValidationResult } from '@/types/recipe'

/**
 * AI提供者基础接口
 * 所有AI提供者都应实现此接口
 */
export type BaseAIProvider = {
  /**
   * 生成食谱
   * @param params 食谱生成参数
   * @returns 生成的食谱
   */
  generateRecipe(params: RecipeGenerationParams): Promise<Recipe>
  
  /**
   * 验证食材是否可食用
   * @param ingredient 食材名称
   * @returns 验证结果
   */
  validateIngredient(ingredient: string): Promise<IngredientValidationResult>
}