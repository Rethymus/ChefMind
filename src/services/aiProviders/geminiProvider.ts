import type { BaseAIProvider } from './baseProvider'
import type {
  Recipe,
  RecipeGenerationParams,
  IngredientValidationResult,
  IngredientAnalysisResult,
  NutritionAnalysisResult,
  PersonalizedRecommendation,
} from '@/types/recipe'
import type { UserHistoryItem, UserPreferences } from '@/services/aiService'
import { PromptBuilder } from './promptBuilder'
import { ParamAdapter } from './paramAdapter'

export class GeminiProvider implements BaseAIProvider {
  private readonly apiKey: string
  private readonly baseURL: string
  private readonly model: string

  constructor(
    apiKey?: string,
    baseURL: string = 'https://generativelanguage.googleapis.com/v1beta'
  ) {
    this.apiKey = apiKey || import.meta.env.VITE_GOOGLE_API_KEY || ''
    this.baseURL = baseURL || 'https://generativelanguage.googleapis.com/v1beta'
    this.model = import.meta.env.VITE_GOOGLE_MODEL || 'gemini-1.5-flash'
  }

  private async callGemini(
    prompt: string,
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Google Gemini API密钥未配置')
    }

    try {
      const response = await fetch(
        `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: options?.maxTokens || 1000,
              temperature: options?.temperature || 0.7,
            },
          }),
        }
      )

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Gemini API错误: ${response.status} - ${error}`)
      }

      const data = await response.json()
      return data.candidates[0].content.parts[0].text
    } catch (error) {
      console.error('Gemini API调用失败:', error)
      throw error
    }
  }

  private parseJsonResponse<T>(response: string): T {
    try {
      // 尝试提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('响应中未找到有效的JSON')
    } catch (error) {
      console.error('解析Gemini JSON响应失败:', error)
      throw new Error('解析响应失败')
    }
  }

  async generateRecipe(
    ingredientsOrParams: string[] | RecipeGenerationParams,
    preferences?: UserPreferences
  ): Promise<Recipe> {
    try {
      // 转换为标准参数格式
      const standardParams = ParamAdapter.toRecipeGenerationParams(ingredientsOrParams, preferences)

      // 构建通用提示词
      const prompt = PromptBuilder.buildRecipePrompt(standardParams)

      const response = await this.callGemini(prompt, {
        maxTokens: 2000,
        temperature: 0.7,
      })

      const recipeResult = this.parseJsonResponse<Partial<Recipe>>(response)
      const recipe = this.buildRecipeFromResult(recipeResult, standardParams)

      return recipe
    } catch (error) {
      console.error('Gemini生成食谱失败:', error)
      return this.createFallbackRecipe(
        standardParams || (ingredientsOrParams as RecipeGenerationParams)
      )
    }
  }

  private buildRecipeFromResult(
    recipeResult: Partial<Recipe>,
    params: RecipeGenerationParams
  ): Recipe {
    const title = recipeResult.title || `${params.ingredients[0]}食谱`

    return {
      id: 'gemini-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9),
      title,
      name: title,
      description: recipeResult.description || `使用${params.ingredients.join('、')}制作的美味食谱`,
      ingredients: recipeResult.ingredients || params.ingredients.map(i => `${i} 适量`),
      instructions: recipeResult.instructions || ['准备食材', '烹饪', '装盘'],
      steps: recipeResult.steps || recipeResult.instructions || ['准备食材', '烹饪', '装盘'],
      cookingTime: recipeResult.cookingTime || params.cookingTime || '30分钟',
      time: parseInt(recipeResult.cookingTime?.replace(/\D/g, '') || '30'),
      servings: recipeResult.servings || params.servings || 2,
      difficulty: recipeResult.difficulty || params.difficulty || '中等',
      cookingMethods: recipeResult.cookingMethods || params.cookingMethods || ['炒'],
      nutrition: recipeResult.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 },
      cookingTips: recipeResult.cookingTips || ['食材新鲜，提前准备', '注意火候控制'],
      tags: recipeResult.tags || [params.ingredients[0], '家常菜'],
      autoCompletedIngredients: [],
    }
  }

  private createFallbackRecipe(params: RecipeGenerationParams): Recipe {
    const title = `${params.ingredients[0]}食谱`

    return {
      id: 'gemini-fallback-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9),
      title,
      name: title,
      description: `使用${params.ingredients.join('、')}制作的美味食谱`,
      ingredients: params.ingredients.map(i => `${i} 适量`),
      instructions: ['准备食材', '烹饪', '装盘'],
      steps: ['准备食材', '烹饪', '装盘'],
      cookingTime: params.cookingTime || '30分钟',
      time: parseInt(params.cookingTime?.replace(/\D/g, '') || '30'),
      servings: params.servings || 2,
      difficulty: params.difficulty || '中等',
      cookingMethods: params.cookingMethods || ['炒'],
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      cookingTips: ['食材新鲜，提前准备', '注意火候控制'],
      tags: [params.ingredients[0], '家常菜'],
      autoCompletedIngredients: [],
    }
  }

  async validateIngredient(ingredient: string): Promise<IngredientValidationResult> {
    try {
      const prompt = `
请判断"${ingredient}"是否是可食用的食材。
请严格按照以下JSON格式回答：
{
  "isValid": true/false,
  "reason": "判断原因",
  "alternatives": ["替代食材1", "替代食材2"]
}

判断标准：
1. 是否是真实存在的食材
2. 是否可以安全食用
3. 是否常用于烹饪

只回答JSON格式，不要其他内容。
`

      const response = await this.callGemini(prompt, {
        maxTokens: 200,
        temperature: 0.3,
      })

      const result = this.parseJsonResponse<{
        isValid: boolean
        reason?: string
        alternatives?: string[]
      }>(response)

      return {
        isValid: result.isValid,
        reason: result.reason,
        alternatives: result.alternatives,
      }
    } catch (error) {
      console.error('Gemini验证食材失败:', error)
      return {
        isValid: true,
        reason: '验证服务暂时不可用，请自行确认是否为可食用食材',
      }
    }
  }

  async analyzeIngredient(imageFile: File): Promise<IngredientAnalysisResult> {
    try {
      // Gemini支持图片分析，但需要将图片转换为base64
      const base64Image = await this.fileToBase64(imageFile)

      const prompt = `
请分析这张食材图片，并以JSON格式返回以下信息：
1. 食材名称
2. 识别置信度（0-1之间的小数）
3. 食材类别（如蔬菜、肉类、水果等）
4. 营养成分信息
5. 新鲜度评估（0-1之间的小数）
6. 烹饪建议

请严格按照以下JSON格式返回：
{
  "name": "食材名称",
  "confidence": 0.95,
  "category": "食材类别",
  "nutrition": {
    "calories": 100,
    "protein": 5,
    "carbs": 10,
    "fat": 2,
    "fiber": 3
  },
  "freshness": 0.9,
  "suggestions": ["烹饪建议1", "烹饪建议2"]
}
`

      // 对于图片分析，我们需要使用不同的API端点
      const response = await fetch(
        `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                  {
                    inline_data: {
                      mime_type: imageFile.type,
                      data: base64Image.split(',')[1], // 移除data:image/...;base64,前缀
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: 1000,
              temperature: 0.3,
            },
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Gemini图片分析失败: ${response.status}`)
      }

      const data = await response.json()
      const textResponse = data.candidates[0].content.parts[0].text

      return this.parseJsonResponse<IngredientAnalysisResult>(textResponse)
    } catch (error) {
      console.error('Gemini分析食材失败:', error)
      return {
        name: '未知食材',
        confidence: 0.5,
        category: '其他',
        nutrition: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
        },
        freshness: 0.5,
        suggestions: ['无法识别食材，请尝试更清晰的图片'],
      }
    }
  }

  async analyzeNutrition(recipe: Recipe): Promise<NutritionAnalysisResult> {
    try {
      const prompt = `
请分析以下食谱的营养成分：

食谱名称: ${recipe.title || '未命名食谱'}
食材列表: ${JSON.stringify(recipe.ingredients || [])}
烹饪方法: ${recipe.cookingMethods?.join(', ') || '未指定'}

请严格按照以下JSON格式返回营养分析结果：
{
  "calories": 350,
  "protein": 25,
  "carbs": 45,
  "fat": 12,
  "fiber": 8,
  "vitamins": ["维生素A", "维生素C", "维生素D"],
  "minerals": ["钙", "铁", "锌"],
  "healthScore": 85,
  "dietaryInfo": {
    "isVegetarian": false,
    "isVegan": false,
    "isGlutenFree": true,
    "allergens": []
  },
  "recommendations": ["营养均衡", "适合减脂期食用"]
}
`

      const response = await this.callGemini(prompt, {
        maxTokens: 1000,
        temperature: 0.3,
      })

      return this.parseJsonResponse<NutritionAnalysisResult>(response)
    } catch (error) {
      console.error('Gemini分析营养成分失败:', error)
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        vitamins: [],
        minerals: [],
        healthScore: 0,
        dietaryInfo: {
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          allergens: [],
        },
        recommendations: ['无法分析营养成分'],
      }
    }
  }

  async getPersonalizedRecommendations(
    userHistory: UserHistoryItem[],
    preferences: UserPreferences,
    limit: number = 5
  ): Promise<PersonalizedRecommendation[]> {
    try {
      const prompt = `
请根据用户的历史记录和偏好，生成${limit}个个性化食谱推荐：

用户历史: ${JSON.stringify(userHistory)}
用户偏好: ${JSON.stringify(preferences)}

请严格按照以下JSON格式返回推荐列表：
[
  {
    "id": "recommendation_1",
    "title": "推荐食谱1",
    "description": "食谱简短描述",
    "matchScore": 0.95,
    "tags": ["标签1", "标签2"],
    "ingredients": ["主要食材1", "主要食材2"],
    "cookingTime": 30,
    "difficulty": "easy",
    "imageUrl": "https://example.com/image.jpg",
    "reasonForRecommendation": "推荐原因"
  }
]

请确保推荐的食谱多样化，并与用户的历史和偏好相匹配。
`

      const response = await this.callGemini(prompt, {
        maxTokens: 2000,
        temperature: 0.7,
      })

      return this.parseJsonResponse<PersonalizedRecommendation[]>(response)
    } catch (error) {
      console.error('Gemini获取个性化推荐失败:', error)
      return []
    }
  }

  async getCookingGuidance(
    recipe: Recipe,
    currentStep: number
  ): Promise<{
    guidance: string
    tips: string[]
    nextStep?: string
    estimatedTime: number
  }> {
    try {
      const prompt = `
请为以下食谱的第${currentStep}步提供详细的烹饪指导：

食谱名称: ${recipe.title || '未命名食谱'}
食谱步骤: ${JSON.stringify(recipe.instructions || [])}
当前步骤: ${recipe.instructions?.[currentStep - 1] || '未知步骤'}

请严格按照以下JSON格式返回烹饪指导：
{
  "guidance": "详细的步骤指导说明",
  "tips": ["技巧1", "技巧2", "技巧3"],
  "nextStep": "下一步的简要预告",
  "estimatedTime": 5
}

请确保指导详细、实用，并包含专业的烹饪技巧。
`

      const response = await this.callGemini(prompt, {
        maxTokens: 1000,
        temperature: 0.5,
      })

      return this.parseJsonResponse<{
        guidance: string
        tips: string[]
        nextStep?: string
        estimatedTime: number
      }>(response)
    } catch (error) {
      console.error('Gemini获取烹饪指导失败:', error)
      return {
        guidance: '按照步骤进行操作',
        tips: ['注意火候', '及时调味'],
        nextStep: '继续下一步',
        estimatedTime: 5,
      }
    }
  }

  // 辅助方法：将文件转换为base64
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('文件读取失败'))
    })
  }
}

export default new GeminiProvider()
