import { Recipe, RecipeGenerationParams, IngredientValidationResult, PersonalizedRecommendation, IngredientAnalysisResult, NutritionAnalysisResult } from '@/types/recipe'
import { UserPreferences, UserHistoryItem } from '@/services/aiService'

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

  /**
   * 分析食材（可选）
   * @param imageFile 食材图片文件
   * @returns 分析结果
   */
  analyzeIngredient?(imageFile: File): Promise<IngredientAnalysisResult>

  /**
   * 分析营养（可选）
   * @param recipe 食谱
   * @returns 营养分析结果
   */
  analyzeNutrition?(recipe: Recipe): Promise<NutritionAnalysisResult>

  /**
   * 获取个性化推荐（可选）
   * @param userHistory 用户历史
   * @param preferences 用户偏好
   * @param limit 推荐数量限制
   * @returns 推荐结果
   */
  getPersonalizedRecommendations?(userHistory: UserHistoryItem[], preferences: UserPreferences, limit?: number): Promise<PersonalizedRecommendation[]>

  /**
   * 获取烹饪指导（可选）
   * @param recipe 食谱
   * @param currentStep 当前步骤
   * @returns 指导内容
   */
  getCookingGuidance?(recipe: Recipe, currentStep: number): Promise<{ guidance: string; tips: string[]; nextStep?: string; estimatedTime: number }>
}
