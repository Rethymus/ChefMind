// AI 驱动的营养分析服务
import { aiService } from './aiService'
import { nutritionAnalysisService } from './nutritionAnalysisService'
import type { UserProfile } from './nutritionAnalysisService'

// 营养分析结果接口
interface NutrientAnalysis {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  calcium: number
  iron: number
  vitaminC: number
  nutrients?: Record<string, number>
  recommendations?: string[]
}

// 扩展用户配置文件
export interface ExtendedUserProfile extends Omit<UserProfile, 'meals' | 'allergies'> {
  meals: MealRecord[]
  medicalConditions: string[]
  allergies: string[]
  dietaryPreferences: string[]
}

export interface MealRecord {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  description: string
}

export interface AIAnalysisResult {
  nutritionAnalysis: NutrientAnalysis
  personalizedRecommendations: string[]
  healthInsights: string[]
  riskAssessments: string[]
  improvementSuggestions: string[]
  confidenceScore: number
  analysisTimestamp: string
}

export interface AIAnalysisRequest {
  userProfile: ExtendedUserProfile
  analysisType: 'comprehensive' | 'basic' | 'quick'
  includeSeasonalRecommendations: boolean
  includeTCMAnalysis: boolean
}

class AIPersonalizedNutritionService {
  /**
   * 使用AI分析用户的饮食和营养状况
   */
  async analyzeUserNutrition(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    try {
      console.log('开始AI营养分析...', request)

      // 1. 构建AI分析提示词
      const analysisPrompt = this.buildAnalysisPrompt(request)

      // 2. 调用AI服务进行营养分析
      const aiResponse = await aiService.generateText(analysisPrompt, {
        maxTokens: 2000,
        temperature: 0.3,
      })
      console.log('营养分析 AI 响应:', aiResponse)

      // 3. 解析AI响应
      const parsedResult = this.parseAIResponse(aiResponse)

      // 4. 结合传统营养计算进行验证和补充
      const traditionalAnalysis = await this.performTraditionalAnalysis(request.userProfile)

      // 5. 合并AI分析和传统分析结果
      const finalResult = this.mergeAnalysisResults(
        parsedResult,
        traditionalAnalysis,
        request.userProfile
      )

      return finalResult
    } catch (error) {
      console.error('AI营养分析失败:', error)

      // 降级到传统分析方法
      return await this.fallbackAnalysis(request.userProfile)
    }
  }

  /**
   * 构建AI分析提示词
   */
  private buildAnalysisPrompt(request: AIAnalysisRequest): string {
    const { userProfile } = request

    const prompt = `
作为专业的营养师和健康顾问，请基于以下用户信息进行全面的营养分析：

用户基本信息：
- 年龄：${userProfile.age}岁
- 性别：${userProfile.gender === 'male' ? '男性' : '女性'}
- 身高：${userProfile.height}cm
- 体重：${userProfile.weight}kg
- 活动水平：${this.getActivityLevelDesc(userProfile.activityLevel)}
- 健康目标：${userProfile.healthGoals.join('、')}

饮食记录：
${userProfile.meals.map(meal => `${this.getMealName(meal.type)}：${meal.description}`).join('\n')}

健康状况：
- 疾病史：${userProfile.medicalConditions.length > 0 ? userProfile.medicalConditions.join('、') : '无'}
- 食物过敏：${userProfile.allergies || '无'}
- 饮食偏好：${userProfile.dietaryPreferences.length > 0 ? userProfile.dietaryPreferences.join('、') : '无特殊偏好'}

请根据以上信息，结合中国居民膳食指南(2022版)，提供以下分析：

1. 营养素摄入估算（以JSON格式返回，包含：calories, protein, carbs, fat, fiber, sodium, calcium, iron, vitaminC, sugar）
2. 个性化营养建议（3-5条具体建议）
3. 健康洞察（基于用户健康目标和现状的分析）
4. 风险评估（潜在的营养不足或过量风险）
5. 改善建议（具体的饮食调整建议）

请以JSON格式返回结果，格式如下：
{
  "nutritionEstimate": {营养素估算对象},
  "recommendations": [建议数组],
  "insights": [洞察数组],
  "risks": [风险数组],
  "improvements": [改善建议数组],
  "confidence": 置信度分数(0-100)
}
`

    return prompt
  }

  /**
   * 解析AI响应
   */
  private parseAIResponse(content: unknown): Partial<AIAnalysisResult> {
    try {
      // 确保content是字符串类型
      if (typeof content !== 'string') {
        console.warn('AI响应内容不是字符串:', content)
        return this.getDefaultAnalysis()
      }

      console.log('开始解析AI响应:', content.substring(0, 200) + '...')

      // 清理内容
      const cleanContent = this.cleanResponseContent(content)

      // 尝试JSON解析
      const jsonResult = this.tryParseAsJson(cleanContent)
      if (jsonResult) {
        return jsonResult
      }

      // 如果JSON解析失败，尝试文本解析
      return this.parseTextResponse(cleanContent)
    } catch (error) {
      console.error('解析AI响应失败:', error)
      return this.getDefaultAnalysis()
    }
  }

  /**
   * 清理响应内容
   */
  private cleanResponseContent(content: string): string {
    // 移除可能的 markdown 标记
    const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim()
    console.log('移除markdown后:', cleanContent.substring(0, 200) + '...')
    return cleanContent
  }

  /**
   * 尝试将内容解析为JSON
   */
  private tryParseAsJson(content: string): Partial<AIAnalysisResult> | null {
    const jsonString = this.extractJsonFromContent(content)
    if (!jsonString) {
      return null
    }

    try {
      const cleanedJson = this.cleanJsonString(jsonString)
      const parsed = JSON.parse(cleanedJson)
      console.log('成功解析AI响应:', parsed)
      
      return this.convertToAnalysisResult(parsed)
    } catch (parseError) {
      console.error('JSON解析失败:', parseError)
      console.error('失败的JSON字符串:', jsonString.substring(0, 500))
      return null
    }
  }

  /**
   * 从内容中提取JSON字符串
   */
  private extractJsonFromContent(content: string): string | null {
    // 尝试提取第一个完整的 JSON 对象
    const firstBraceIndex = content.indexOf('{')
    console.log('找到第一个{的位置:', firstBraceIndex)

    if (firstBraceIndex === -1) {
      return null
    }

    let braceCount = 0
    let i = firstBraceIndex

    for (; i < content.length; i++) {
      if (content[i] === '{') braceCount++
      else if (content[i] === '}') braceCount--

      if (braceCount === 0) {
        const jsonString = content.substring(firstBraceIndex, i + 1)
        console.log('提取的JSON字符串:', jsonString.substring(0, 300) + '...')
        return jsonString
      }
    }

    return null
  }

  /**
   * 清理JSON字符串
   */
  private cleanJsonString(jsonStr: string): string {
    let cleanJsonStr = jsonStr

    // 第一步：处理不带引号的数字+单位组合: 45g -> "45"
    cleanJsonStr = cleanJsonStr.replace(/:\s*(\d+(?:\.\d+)?)([a-zA-Z]+)/g, ': "$1"')

    // 第二步：处理带引号的数字+单位组合: "45g" -> "45"
    cleanJsonStr = cleanJsonStr.replace(/"(\d+(?:\.\d+)?)([a-zA-Z]+)"/g, '"$1"')

    console.log('清理后的JSON:', cleanJsonStr.substring(0, 300) + '...')
    return cleanJsonStr
  }

  /**
   * 转换解析结果为分析结果
   */
  private convertToAnalysisResult(parsed: Record<string, unknown>): Partial<AIAnalysisResult> {
    const convertedNutrition = this.convertNutritionAnalysis(parsed.nutritionEstimate || {})

    return {
      nutritionAnalysis: convertedNutrition as unknown as NutrientAnalysis,
      personalizedRecommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      healthInsights: Array.isArray(parsed.insights) ? parsed.insights : [],
      riskAssessments: Array.isArray(parsed.risks) ? parsed.risks : [],
      improvementSuggestions: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      confidenceScore: typeof parsed.confidence === 'number' ? parsed.confidence : 75,
    }
  }

  /**
   * 转换营养分析数据
   */
  private convertNutritionAnalysis(nutritionAnalysis: unknown): Record<string, number> {
    const convertedNutrition: Record<string, number> = {}

    if (typeof nutritionAnalysis !== 'object' || nutritionAnalysis === null) {
      return convertedNutrition
    }

    const nutritionData = nutritionAnalysis as Record<string, unknown>

    // 定义营养素字段名称
    const nutrientFields = [
      'calories',
      'protein',
      'carbs',
      'fat',
      'fiber',
      'sodium',
      'calcium',
      'iron',
      'vitaminC',
      'sugar',
    ]

    for (const field of nutrientFields) {
      const value = nutritionData[field]
      if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value)) {
        convertedNutrition[field] = parseFloat(value)
      } else if (typeof value === 'number') {
        convertedNutrition[field] = value
      }
    }

    return convertedNutrition
  }

  /**
   * 解析文本响应
   */
  private parseTextResponse(content: string): Partial<AIAnalysisResult> {
    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)

    return {
      personalizedRecommendations: this.extractRecommendations(lines),
      healthInsights: this.extractInsights(lines),
      riskAssessments: this.extractRisks(lines),
      improvementSuggestions: this.extractImprovements(lines),
      confidenceScore: 70,
    }
  }

  /**
   * 执行传统营养分析
   */
  private async performTraditionalAnalysis(
    userProfile: ExtendedUserProfile
  ): Promise<Partial<AIAnalysisResult>> {
    // 使用现有的营养分析服务
    const basicProfile: UserProfile = {
      name: '用户',
      age: userProfile.age,
      gender: userProfile.gender,
      weight: userProfile.weight,
      height: userProfile.height,
      activityLevel: userProfile.activityLevel,
      healthGoals: userProfile.healthGoals,
      meals: userProfile.meals.map(meal => ({
        type: meal.type,
        foods: [
          {
            name: meal.description,
            amount: 1,
            unit: '份',
          },
        ],
      })),
    }

    // 估算营养摄入（基于饮食描述的关键词分析）
    const estimatedIntake = this.estimateNutritionFromMeals(userProfile.meals)

    // 生成个性化建议
    const personalizedNutrition =
      await nutritionAnalysisService.generatePersonalizedRecommendations(basicProfile)

    return {
      nutritionAnalysis: estimatedIntake,
      personalizedRecommendations: personalizedNutrition,
      confidenceScore: 60,
    }
  }

  /**
   * 从饮食描述估算营养摄入
   */
  private estimateNutritionFromMeals(meals: MealRecord[]): NutrientAnalysis {
    const totalNutrition: NutrientAnalysis = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
      calcium: 0,
      iron: 0,
      vitaminC: 0,
      sugar: 0,
    }

    // 基于食物关键词的简单估算
    meals.forEach(meal => {
      const nutrition = this.estimateMealNutrition(meal.description)
      // 累加数值字段
      totalNutrition.calories += nutrition.calories
      totalNutrition.protein += nutrition.protein
      totalNutrition.carbs += nutrition.carbs
      totalNutrition.fat += nutrition.fat
      totalNutrition.fiber += nutrition.fiber
      totalNutrition.sugar += nutrition.sugar
      totalNutrition.sodium += nutrition.sodium
      totalNutrition.calcium += nutrition.calcium
      totalNutrition.iron += nutrition.iron
      totalNutrition.vitaminC += nutrition.vitaminC
    })

    return totalNutrition
  }

  /**
   * 估算单餐营养
   */
  private estimateMealNutrition(description: string): NutrientAnalysis {
    const desc = description.toLowerCase()

    // 基础营养值
    let calories = 0
    let protein = 0
    let carbs = 0
    let fat = 0
    let fiber = 0
    const sodium = 0
    let calcium = 0
    let iron = 0
    let vitaminC = 0
    let sugar = 0

    // 主食类
    if (desc.includes('米饭') || desc.includes('面条') || desc.includes('馒头')) {
      calories += 200
      carbs += 45
      protein += 4
    }

    // 肉类
    if (desc.includes('猪肉') || desc.includes('牛肉') || desc.includes('鸡肉')) {
      calories += 150
      protein += 20
      fat += 8
      iron += 2
    }

    // 蔬菜类
    if (desc.includes('蔬菜') || desc.includes('菠菜') || desc.includes('白菜')) {
      calories += 25
      fiber += 3
      vitaminC += 30
      calcium += 50
    }

    // 水果类
    if (desc.includes('苹果') || desc.includes('香蕉') || desc.includes('橙子')) {
      calories += 60
      carbs += 15
      fiber += 2
      vitaminC += 50
      sugar += 12
    }

    // 奶制品
    if (desc.includes('牛奶') || desc.includes('酸奶') || desc.includes('奶酪')) {
      calories += 100
      protein += 8
      fat += 5
      calcium += 200
    }

    return {
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sodium,
      calcium,
      iron,
      vitaminC,
      sugar,
    }
  }

  /**
   * 合并分析结果
   */
  private mergeAnalysisResults(
    aiResult: Partial<AIAnalysisResult>,
    traditionalResult: Partial<AIAnalysisResult>,
    userProfile: ExtendedUserProfile
  ): AIAnalysisResult {
    return {
      nutritionAnalysis:
        aiResult.nutritionAnalysis ||
        traditionalResult.nutritionAnalysis ||
        this.getDefaultNutrition(),
      personalizedRecommendations: [
        ...(aiResult.personalizedRecommendations || []),
        ...(traditionalResult.personalizedRecommendations || []),
      ].slice(0, 8), // 限制建议数量
      healthInsights: aiResult.healthInsights || this.getDefaultInsights(userProfile),
      riskAssessments: aiResult.riskAssessments || this.getDefaultRisks(userProfile),
      improvementSuggestions:
        aiResult.improvementSuggestions || this.getDefaultImprovements(userProfile),
      confidenceScore: Math.max(
        aiResult.confidenceScore || 0,
        traditionalResult.confidenceScore || 0
      ),
      analysisTimestamp: new Date().toISOString(),
    }
  }

  /**
   * 降级分析方法
   */
  private async fallbackAnalysis(userProfile: ExtendedUserProfile): Promise<AIAnalysisResult> {
    const traditionalResult = await this.performTraditionalAnalysis(userProfile)

    return {
      nutritionAnalysis: traditionalResult.nutritionAnalysis || this.getDefaultNutrition(),
      personalizedRecommendations:
        traditionalResult.personalizedRecommendations ||
        this.getDefaultRecommendations(userProfile),
      healthInsights: this.getDefaultInsights(userProfile),
      riskAssessments: this.getDefaultRisks(userProfile),
      improvementSuggestions: this.getDefaultImprovements(userProfile),
      confidenceScore: 50,
      analysisTimestamp: new Date().toISOString(),
    }
  }

  // 辅助方法
  private getActivityLevelDesc(level: string): string {
    const levels = {
      low: '轻度活动（久坐办公）',
      moderate: '中度活动（偶尔运动）',
      high: '高度活动（经常运动）',
    }
    return levels[level as keyof typeof levels] || level
  }

  private getMealName(type: string): string {
    const names = {
      breakfast: '早餐',
      lunch: '午餐',
      dinner: '晚餐',
      snack: '加餐',
    }
    return names[type as keyof typeof names] || type
  }

  private extractRecommendations(lines: string[]): string[] {
    return lines
      .filter(line => line.includes('建议') || line.includes('推荐') || line.includes('应该'))
      .slice(0, 5)
  }

  private extractInsights(lines: string[]): string[] {
    return lines
      .filter(line => line.includes('分析') || line.includes('发现') || line.includes('显示'))
      .slice(0, 3)
  }

  private extractRisks(lines: string[]): string[] {
    return lines
      .filter(line => line.includes('风险') || line.includes('注意') || line.includes('警告'))
      .slice(0, 3)
  }

  private extractImprovements(lines: string[]): string[] {
    return lines
      .filter(line => line.includes('改善') || line.includes('优化') || line.includes('调整'))
      .slice(0, 5)
  }

  private getDefaultNutrition(): NutrientAnalysis {
    return {
      calories: 1800,
      protein: 60,
      carbs: 225,
      fat: 60,
      fiber: 25,
      sodium: 2000,
      calcium: 800,
      iron: 12,
      vitaminC: 100,
      sugar: 50,
    }
  }

  private getDefaultRecommendations(userProfile: ExtendedUserProfile): string[] {
    const recommendations = []

    if (userProfile.healthGoals.includes('减重')) {
      recommendations.push('控制总热量摄入，建议每日热量赤字300-500千卡')
      recommendations.push('增加蛋白质摄入，有助于保持肌肉量和增加饱腹感')
    }

    if (userProfile.medicalConditions.includes('高血压')) {
      recommendations.push('减少钠盐摄入，每日控制在5g以内')
      recommendations.push('增加钾含量丰富的食物，如香蕉、菠菜等')
    }

    recommendations.push('保证充足的水分摄入，每日8-10杯水')
    recommendations.push('增加深色蔬菜和水果的摄入量')

    return recommendations.slice(0, 5)
  }

  private getDefaultInsights(userProfile: ExtendedUserProfile): string[] {
    return [
      `根据您的基本信息，建议每日热量摄入约${this.calculateDailyCalories(userProfile)}千卡`,
      '您的饮食结构总体合理，建议继续保持',
      '注意营养素的均衡搭配，避免单一营养素过量',
    ]
  }

  private getDefaultRisks(userProfile: ExtendedUserProfile): string[] {
    const risks = []

    if (userProfile.age > 50) {
      risks.push('注意钙质补充，预防骨质疏松')
    }

    if (userProfile.activityLevel === 'sedentary') {
      risks.push('久坐生活方式可能影响代谢，建议增加运动')
    }

    return risks
  }

  private getDefaultImprovements(_userProfile: ExtendedUserProfile): string[] {
    return [
      '建议增加全谷物食品的摄入比例',
      '适量增加优质蛋白质来源',
      '控制精制糖的摄入',
      '保证充足的膳食纤维摄入',
    ]
  }

  private calculateDailyCalories(userProfile: ExtendedUserProfile): number {
    // 使用Harris-Benedict公式计算基础代谢率
    let bmr: number

    if (userProfile.gender === 'male') {
      bmr =
        88.362 + 13.397 * userProfile.weight + 4.799 * userProfile.height - 5.677 * userProfile.age
    } else {
      bmr =
        447.593 + 9.247 * userProfile.weight + 3.098 * userProfile.height - 4.33 * userProfile.age
    }

    // 活动系数
    const activityFactors = {
      low: 1.2,
      moderate: 1.55,
      high: 1.9,
    }

    return Math.round(bmr * activityFactors[userProfile.activityLevel])
  }

  private getDefaultAnalysis(): Partial<AIAnalysisResult> {
    return {
      personalizedRecommendations: ['保持均衡饮食', '适量运动', '充足睡眠'],
      healthInsights: ['营养分析需要更多信息'],
      riskAssessments: ['暂无明显风险'],
      improvementSuggestions: ['建议咨询专业营养师'],
      confidenceScore: 30,
    }
  }
}

export const aiPersonalizedNutritionService = new AIPersonalizedNutritionService()
