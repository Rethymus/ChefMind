// @ts-nocheck
import { ElMessage } from 'element-plus'
import { aiService } from './aiService'

// 用户档案接口
export interface UserProfile {
  // 基本信息
  name: string
  age: number
  gender: 'male' | 'female'
  height: number // cm
  weight: number // kg

  // 活动水平
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'

  // 健康目标
  healthGoals: string[]

  // 健康状况（可选）
  medicalConditions?: string[]
  allergies?: string[]
  dietaryRestrictions?: string[]

  // 今日饮食记录
  meals: {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    description: string
    time?: string
  }[]
}

// 营养分析结果接口
export interface NutritionAnalysisResult {
  // 个人营养需求
  dailyNeeds: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sodium: number
    calcium: number
    iron: number
    vitaminC: number
    vitaminD: number
  }

  // 当前摄入量
  currentIntake: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sodium: number
    calcium: number
    iron: number
    vitaminC: number
    vitaminD: number
  }

  // AI分析结果
  analysis: {
    balanceScore: number
    adequacyRatios: Record<string, number>
    recommendations: string[]
    riskAssessments: Array<{
      level: 'low' | 'medium' | 'high'
      title: string
      description: string
    }>
    improvementSuggestions: Array<{
      category: string
      suggestion: string
    }>
  }

  // AI分析可信度
  confidenceScore: number

  // 分析时间
  timestamp: string
}

// 健康指标接口
interface HealthMetrics {
  bmi: number
  bmiStatus: 'underweight' | 'normal' | 'overweight' | 'obese'
  bmiStatusText: string
  bmr: number
  tdee: number
}

// 中国居民膳食指南数据
const CHINESE_DIETARY_GUIDELINES = {
  version: '2022版中国居民膳食指南',

  // 核心推荐
  coreRecommendations: [
    {
      title: '食物多样，谷类为主',
      description: '平均每天摄入12种以上食物，每周25种以上，谷类食物占总能量的50%-65%',
    },
    {
      title: '吃动平衡，健康体重',
      description: '各年龄段人群都应天天进行身体活动，保持健康体重',
    },
    {
      title: '多吃蔬果、奶类、全谷、大豆',
      description: '餐餐有蔬菜，天天吃水果，多选深色蔬果',
    },
    {
      title: '适量吃鱼、禽、蛋、瘦肉',
      description: '每周2-3次鱼类，每天1个鸡蛋，适量禽肉和瘦肉',
    },
    {
      title: '少盐少油，控糖限酒',
      description: '成年人每天食盐不超过6g，烹调油25-30g，添加糖不超过50g',
    },
    {
      title: '规律进餐，足量饮水',
      description: '合理安排一日三餐时间，定时定量，足量饮水',
    },
    {
      title: '会烹会选，会看标签',
      description: '在生命的各个阶段都应做好健康选择',
    },
    {
      title: '公筷分餐，杜绝浪费',
      description: '选择新鲜卫生的食物，不食用野生动物',
    },
  ],

  // 每日推荐摄入量（成年人）
  dailyRecommendations: {
    adult: {
      grains: { min: 200, max: 300 }, // 克/天
      vegetables: { min: 300, max: 500 }, // 克/天
      fruits: { min: 200, max: 350 }, // 克/天
      dairy: { min: 300, max: 500 }, // 毫升/天
      protein: { min: 120, max: 200 }, // 克/天（鱼禽蛋肉类）
      nuts: { min: 25, max: 35 }, // 克/天
      oil: { max: 30 }, // 克/天
      salt: { max: 6 }, // 克/天
      water: { min: 1500, max: 1700 }, // 毫升/天
    },
  },

  // 营养素参考摄入量（成年人）
  nutrients: {
    male: {
      calories: { min: 2000, max: 2400 },
      protein: { min: 65, max: 90 },
      carbs: { min: 250, max: 350 },
      fat: { min: 55, max: 80 },
      fiber: 25,
      vitaminC: 100,
      calcium: 800,
      iron: 12,
    },
    female: {
      calories: { min: 1600, max: 2000 },
      protein: { min: 55, max: 75 },
      carbs: { min: 200, max: 300 },
      fat: { min: 45, max: 65 },
      fiber: 25,
      vitaminC: 100,
      calcium: 800,
      iron: 20,
    },
  },
}

class NutritionAnalysisService {
  /**
   * 计算基础代谢率 (BMR)
   */
  private calculateBMR(userProfile: UserProfile): number {
    const { age, gender, height, weight } = userProfile

    // Harris-Benedict公式 (修正版)
    if (gender === 'male') {
      return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
    } else {
      return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age
    }
  }

  /**
   * 计算每日能量需求 (TDEE)
   */
  private calculateTDEE(userProfile: UserProfile): number {
    const bmr = this.calculateBMR(userProfile)

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    }

    return bmr * activityMultipliers[userProfile.activityLevel]
  }

  /**
   * 计算健康指标
   */
  calculateHealthMetrics(userProfile: UserProfile): HealthMetrics {
    const { height, weight } = userProfile
    const heightInM = height / 100
    const bmi = weight / (heightInM * heightInM)

    let bmiStatus: 'underweight' | 'normal' | 'overweight' | 'obese'
    let bmiStatusText: string

    if (bmi < 18.5) {
      bmiStatus = 'underweight'
      bmiStatusText = '偏瘦'
    } else if (bmi < 24) {
      bmiStatus = 'normal'
      bmiStatusText = '正常'
    } else if (bmi < 28) {
      bmiStatus = 'overweight'
      bmiStatusText = '超重'
    } else {
      bmiStatus = 'obese'
      bmiStatusText = '肥胖'
    }

    return {
      bmi: Math.round(bmi * 10) / 10,
      bmiStatus,
      bmiStatusText,
      bmr: Math.round(this.calculateBMR(userProfile)),
      tdee: Math.round(this.calculateTDEE(userProfile)),
    }
  }

  /**
   * 计算每日营养需求
   */
  private calculateDailyNeeds(userProfile: UserProfile): NutritionAnalysisResult['dailyNeeds'] {
    const tdee = this.calculateTDEE(userProfile)
    const guidelines = CHINESE_DIETARY_GUIDELINES.nutrients[userProfile.gender]

    // 基于TDEE调整营养需求
    const calorieRatio = tdee / (userProfile.gender === 'male' ? 2200 : 1800)

    return {
      calories: Math.round(tdee),
      protein: Math.round(guidelines.protein.min * calorieRatio),
      carbs: Math.round(guidelines.carbs.min * calorieRatio),
      fat: Math.round(guidelines.fat.min * calorieRatio),
      fiber: Math.round(guidelines.fiber * calorieRatio),
      sodium: 2000, // mg/天
      calcium: guidelines.calcium,
      iron: guidelines.iron,
      vitaminC: guidelines.vitaminC,
      vitaminD: 10, // μg/天
    }
  }

  /**
   * 计算当前营养摄入量（通过AI分析）
   */
  private async calculateCurrentIntake(
    meals: UserProfile['meals']
  ): Promise<NutritionAnalysisResult['currentIntake']> {
    if (!meals || meals.length === 0) {
      console.log('🔥 没有饮食记录，返回基于基本信息的默认估算值')
      // 返回一个基于标准膳食模式的合理估算，而不是全0
      return {
        calories: 1800, // 基础代谢估算
        protein: 60,   // 推荐蛋白质摄入
        carbs: 225,    // 推荐碳水化合物摄入
        fat: 60,       // 推荐脂肪摄入
        fiber: 25,     // 推荐膳食纤维摄入
        sodium: 2000,  // 推荐钠摄入上限
        calcium: 800,  // 推荐钙摄入
        iron: 12,      // 推荐铁摄入
        vitaminC: 100, // 推荐维生素C摄入
        vitaminD: 10,  // 推荐维生素D摄入
      }
    }

    try {
      // 构建AI分析提示
      const mealDescriptions = meals
        .map(meal => `${meal.type}: ${meal.description}`)
        .join('\n')

      console.log('🔥 饮食记录:', mealDescriptions)

      const prompt = `
请作为营养专家，分析以下一日饮食的营养成分：

${mealDescriptions}

请严格按照以下JSON格式返回营养分析结果（只返回JSON，不要其他文字）：
{
  "calories": 总热量(千卡),
  "protein": 蛋白质(克),
  "carbs": 碳水化合物(克),
  "fat": 脂肪(克),
  "fiber": 膳食纤维(克),
  "sodium": 钠(毫克),
  "calcium": 钙(毫克),
  "iron": 铁(毫克),
  "vitaminC": 维生素C(毫克),
  "vitaminD": 维生素D(微克)
}

请基于中国食物成分表进行准确计算。
`

      // 使用带重试机制的AI调用
      const response = await this.callAIWithRetry(prompt, {
        maxTokens: 2000,
        temperature: 0.3
      })

      // 使用统一的响应解析方法
      const defaultData = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sodium: 0,
        calcium: 0,
        iron: 0,
        vitaminC: 0,
        vitaminD: 0,
      }

      const nutritionData = this.parseAIResponse(response, defaultData, {
        requiredFields: ['calories', 'protein', 'carbs', 'fat'],
        strictMode: false,
        dataTransform: (data) => ({
          calories: this.cleanNumericValue(data.calories),
          protein: this.cleanNumericValue(data.protein),
          carbs: this.cleanNumericValue(data.carbs),
          fat: this.cleanNumericValue(data.fat),
          fiber: this.cleanNumericValue(data.fiber),
          sodium: this.cleanNumericValue(data.sodium),
          calcium: this.cleanNumericValue(data.calcium),
          iron: this.cleanNumericValue(data.iron),
          vitaminC: this.cleanNumericValue(data.vitaminC),
          vitaminD: this.cleanNumericValue(data.vitaminD),
        })
      })

      console.log('✅ AI营养分析完成:', nutritionData)
      return nutritionData

    } catch (error) {
      console.error('❌ AI营养分析失败，使用智能估算:', error)

      // 基于饮食描述的智能估算
      const estimatedIntake = this.estimateNutritionFromMeals(meals)
      console.log('🔥 使用估算值:', estimatedIntake)

      ElMessage.info('AI分析暂时不可用，使用智能估算值')
      return estimatedIntake
    }
  }

  /**
   * 检查AI配置状态
   */
  private async checkAIServiceStatus(): Promise<{
    available: boolean
    provider: string
    initialized: boolean
    reason?: string
  }> {
    console.log('🔥 检查AI服务状态')

    try {
      // 检查AI服务是否已初始化
      if (!aiService || typeof aiService !== 'object') {
        return {
          available: false,
          provider: 'unknown',
          initialized: false,
          reason: 'AI服务未初始化'
        }
      }

      // 检查AI服务状态
      const status = aiService.getStatus()
      console.log('📊 AI服务状态:', status)

      if (!status.initialized) {
        return {
          available: false,
          provider: status.currentProvider,
          initialized: false,
          reason: 'AI服务未完成初始化'
        }
      }

      // 检查API配置
      try {
        const testPrompt = '测试连接'
        const testResponse = await aiService.generateText(testPrompt, {
          maxTokens: 10,
          temperature: 0.1
        })

        if (testResponse && testResponse.length > 0) {
          console.log('✅ AI服务连接测试成功')
          return {
            available: true,
            provider: status.currentProvider,
            initialized: true
          }
        } else {
          return {
            available: false,
            provider: status.currentProvider,
            initialized: true,
            reason: 'AI服务返回空响应'
          }
        }
      } catch (error) {
        console.error('❌ AI服务连接测试失败:', error)
        return {
          available: false,
          provider: status.currentProvider,
          initialized: true,
          reason: `AI服务连接失败: ${error instanceof Error ? error.message : '未知错误'}`
        }
      }
    } catch (error) {
      console.error('❌ AI服务状态检查失败:', error)
      return {
        available: false,
        provider: 'unknown',
        initialized: false,
        reason: `状态检查失败: ${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  }

  /**
   * 本地营养分析（备选方案）
   */
  private performLocalNutritionAnalysis(
    userProfile: UserProfile,
    dailyNeeds: NutritionAnalysisResult['dailyNeeds'],
    currentIntake: NutritionAnalysisResult['currentIntake']
  ): NutritionAnalysisResult['analysis'] {
    console.log('🔥 开始本地营养分析')

    // 计算营养充足率
    const adequacyRatios = this.calculateAdequacyRatios(currentIntake, dailyNeeds)

    // 计算BMI和相关指标
    const bmi = this.cleanNumericValue(userProfile.weight) / Math.pow(this.cleanNumericValue(userProfile.height) / 100, 2)
    const bmiStatus = this.getBMIStatus(bmi)

    // 生成基础分析建议
    const suggestions: string[] = []
    const warnings: string[] = []

    // 热量分析
    const calorieRatio = adequacyRatios.calories || 0
    if (calorieRatio < 0.8) {
      warnings.push('热量摄入不足，可能影响身体正常功能')
      suggestions.push('适当增加健康食物的摄入量')
    } else if (calorieRatio > 1.2) {
      warnings.push('热量摄入过多，可能导致体重增加')
      suggestions.push('控制总热量摄入，增加运动量')
    }

    // 蛋白质分析
    const proteinRatio = adequacyRatios.protein || 0
    if (proteinRatio < 0.8) {
      warnings.push('蛋白质摄入不足，可能影响肌肉维护')
      suggestions.push('增加优质蛋白质来源，如瘦肉、鱼类、豆类')
    }

    // 膳食纤维分析
    const fiberRatio = adequacyRatios.fiber || 0
    if (fiberRatio < 0.8) {
      warnings.push('膳食纤维摄入不足，可能影响消化健康')
      suggestions.push('增加蔬菜、水果和全谷物的摄入')
    }

    // 钠摄入分析
    const sodiumRatio = adequacyRatios.sodium || 0
    if (sodiumRatio > 1) {
      warnings.push('钠摄入过多，可能影响血压健康')
      suggestions.push('减少盐的使用，选择低钠食物')
    }

    // 基于BMI的建议
    if (bmiStatus.status === 'underweight') {
      suggestions.push('体重偏轻，建议增加营养摄入')
    } else if (bmiStatus.status === 'overweight' || bmiStatus.status === 'obese') {
      suggestions.push('体重超重，建议控制饮食并增加运动')
    }

    // 基于活动水平的建议
    const activityLevel = userProfile.activityLevel
    if (activityLevel === 'sedentary' || activityLevel === 'light') {
      suggestions.push('活动量较少，建议增加日常运动')
    }

    const analysis: NutritionAnalysisResult['analysis'] = {
      summary: `本地分析：当前BMI为${bmi.toFixed(1)}，属于${bmiStatus.text}。热量摄入为需求的${Math.round(calorieRatio * 100)}%。`,
      suggestions: suggestions,
      warnings: warnings,
      mealRecommendations: this.generateBasicMealRecommendations(userProfile, dailyNeeds, adequacyRatios),
      balanceScore: this.calculateBalanceScore(adequacyRatios),
      adequacyRatios: adequacyRatios
    }

    console.log('✅ 本地营养分析完成:', analysis)
    return analysis
  }

  /**
   * 生成基础饮食推荐
   */
  private generateBasicMealRecommendations(
    userProfile: UserProfile,
    dailyNeeds: NutritionAnalysisResult['dailyNeeds'],
    adequacyRatios: Record<string, number>
  ): string[] {
    const recommendations: string[] = []

    // 基于健康目标的推荐
    if (userProfile.healthGoals.includes('减重')) {
      recommendations.push('控制总热量摄入，选择低热量高营养的食物')
      recommendations.push('增加蛋白质比例，有助于保持肌肉量')
    } else if (userProfile.healthGoals.includes('增重')) {
      recommendations.push('适当增加热量摄入，选择营养密度高的食物')
      recommendations.push('规律进餐，避免跳餐')
    }

    // 基于营养充足率的推荐
    if ((adequacyRatios.protein || 0) < 0.8) {
      recommendations.push('增加优质蛋白质：鸡蛋、瘦肉、鱼类、豆制品')
    }

    if ((adequacyRatios.fiber || 0) < 0.8) {
      recommendations.push('增加膳食纤维：全谷物、蔬菜、水果、豆类')
    }

    if ((adequacyRatios.calories || 0) < 0.8) {
      recommendations.push('增加健康热量：坚果、牛油果、橄榄油')
    }

    // 基于过敏信息的推荐
    if (userProfile.allergies && userProfile.allergies.length > 0) {
      userProfile.allergies.forEach(allergy => {
        recommendations.push(`避免${allergy}及相关食物`)
      })
    }

    return recommendations.slice(0, 5) // 限制推荐数量
  }

  /**
   * 验证和清理用户数据
   */
  private validateAndCleanUserProfile(userProfile: UserProfile): UserProfile {
    console.log('🔥 开始验证和清理用户数据')

    const cleanedProfile: UserProfile = {
      ...userProfile,
      // 清理基本信息
      age: Math.max(1, Math.min(120, this.cleanNumericValue(userProfile.age) || 25)),
      height: Math.max(100, Math.min(250, this.cleanNumericValue(userProfile.height) || 165)),
      weight: Math.max(30, Math.min(300, this.cleanNumericValue(userProfile.weight) || 60)),
      gender: ['male', 'female', 'other'].includes(userProfile.gender) ? userProfile.gender : 'male',
      activityLevel: ['sedentary', 'light', 'moderate', 'active', 'very_active'].includes(userProfile.activityLevel)
        ? userProfile.activityLevel
        : 'moderate',

      // 清理健康目标
      healthGoals: Array.isArray(userProfile.healthGoals)
        ? userProfile.healthGoals.filter(goal => goal && typeof goal === 'string' && goal.trim().length > 0)
        : [],

      // 清理过敏信息
      allergies: Array.isArray(userProfile.allergies)
        ? userProfile.allergies.filter(allergy => allergy && typeof allergy === 'string' && allergy.trim().length > 0)
        : [],

      // 清理健康状况
      medicalConditions: Array.isArray(userProfile.medicalConditions)
        ? userProfile.medicalConditions.filter(condition => condition && typeof condition === 'string' && condition.trim().length > 0)
        : [],

      // 清理饮食记录
      meals: Array.isArray(userProfile.meals)
        ? userProfile.meals
            .filter(meal => meal && typeof meal === 'object' && meal.type && meal.description)
            .map(meal => ({
              type: ['breakfast', 'lunch', 'dinner', 'snack'].includes(meal.type) ? meal.type : 'snack',
              description: String(meal.description || '').trim(),
              time: meal.time || new Date().toISOString()
            }))
        : []
    }

    // 确保必要的字段存在
    if (!cleanedProfile.healthGoals || cleanedProfile.healthGoals.length === 0) {
      cleanedProfile.healthGoals = ['保持健康']
    }

    if (!cleanedProfile.meals || cleanedProfile.meals.length === 0) {
      console.log('⚠️ 用户没有提供饮食记录，将使用基于用户基本信息的营养估算')
      // 不要设置默认的"暂无记录"，让AI基于用户基本信息进行估算
    }

    console.log('✅ 用户数据验证和清理完成:', cleanedProfile)
    return cleanedProfile
  }

  /**
   * 带重试机制的AI调用
   */
  private async callAIWithRetry(
    prompt: string,
    options: { maxTokens?: number; temperature?: number } = {},
    maxRetries: number = 2
  ): Promise<string> {
    console.log('🔄 开始带重试机制的AI调用')

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        console.log(`🔥 AI调用尝试 ${attempt}/${maxRetries + 1}`)

        const response = await aiService.generateText(prompt, {
          maxTokens: options.maxTokens || 2000,
          temperature: options.temperature || 0.7,
        })

        if (response && response.trim().length > 0) {
          console.log(`✅ AI调用成功，尝试 ${attempt}`)
          return response
        }

        throw new Error('AI返回空响应')
      } catch (error) {
        console.error(`❌ AI调用尝试 ${attempt} 失败:`, error)

        if (attempt <= maxRetries) {
          console.log(`⏳ 等待 ${attempt * 1000}ms 后重试...`)
          await new Promise(resolve => setTimeout(resolve, attempt * 1000))
        } else {
          console.error('❌ 所有重试尝试均失败')
          throw new Error(`AI服务调用失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
      }
    }

    throw new Error('AI调用失败')
  }

  /**
   * 营养分析数据结构转换（修复字段丢失问题）
   */
  private convertNutritionAnalysisData(
    aiData: any,
    userProfile: UserProfile,
    dailyNeeds: NutritionAnalysisResult['dailyNeeds'],
    currentIntake: NutritionAnalysisResult['currentIntake'],
    adequacyRatios: Record<string, number>
  ): NutritionAnalysisResult['analysis'] {
    console.log('🔥 开始转换营养分析数据结构')
    console.log('📊 AI原始数据:', aiData)

    // 首先检查并提取营养估算数据（关键修复）
    let nutritionEstimate = aiData.nutritionEstimate || aiData.currentIntake || {}
    if (!nutritionEstimate || Object.keys(nutritionEstimate).length === 0) {
      // 如果没有找到营养估算数据，从其他可能的位置提取
      nutritionEstimate = this.extractNutritionDataFromResponse(aiData)
      console.log('🔥 从其他位置提取的营养数据:', nutritionEstimate)
    }

    // 如果有营养估算数据，更新当前摄入数据
    if (nutritionEstimate && Object.keys(nutritionEstimate).length > 0) {
      console.log('🔥 使用AI返回的营养数据更新当前摄入')
      Object.assign(currentIntake, {
        calories: this.cleanNumericValue(nutritionEstimate.calories),
        protein: this.cleanNumericValue(nutritionEstimate.protein),
        carbs: this.cleanNumericValue(nutritionEstimate.carbs),
        fat: this.cleanNumericValue(nutritionEstimate.fat),
        fiber: this.cleanNumericValue(nutritionEstimate.fiber),
        sodium: this.cleanNumericValue(nutritionEstimate.sodium),
        calcium: this.cleanNumericValue(nutritionEstimate.calcium),
        iron: this.cleanNumericValue(nutritionEstimate.iron),
        vitaminC: this.cleanNumericValue(nutritionEstimate.vitaminC),
        vitaminD: this.cleanNumericValue(nutritionEstimate.vitaminD),
      })
      console.log('🔥 更新后的当前摄入:', currentIntake)

      // 重新计算营养充足率
      const updatedAdequacyRatios = this.calculateAdequacyRatios(currentIntake, dailyNeeds)
      Object.assign(adequacyRatios, updatedAdequacyRatios)
      console.log('🔥 更新后的营养充足率:', adequacyRatios)
    }

    // 智能字段映射和转换（修复字段名匹配问题）
    const convertedData: NutritionAnalysisResult['analysis'] = {
      summary: this.extractField(aiData, ['summary', '总览', '概述', '分析总结', '总体评价'],
        `基于用户数据的营养分析：BMI ${this.calculateBMI(userProfile)}，健康目标：${userProfile.healthGoals.join('、')}`),

      // AnalyticsView期望的字段名
      recommendations: this.extractArrayField(aiData, ['recommendations', 'suggestions', '建议', '营养建议', 'insights'],
        ['保持均衡饮食，多样化摄入各类营养素', '适量运动，保持健康体重', '定期体检，监控健康状况']),

      // 处理健康风险评估
      riskAssessments: this.extractRiskAssessments(aiData, ['risks', 'riskAssessments', 'warnings', '风险提示', '风险评估']),

      // 处理改进建议
      improvementSuggestions: this.extractImprovementSuggestions(aiData, ['improvements', 'improvementSuggestions', 'mealRecommendations', '改进建议']),

      balanceScore: this.cleanNumericValue(
        this.extractField(aiData, ['balanceScore', '平衡分数', 'balance', 'nutritionScore', 'confidence'], 75)
      ),

      adequacyRatios: adequacyRatios
    }

    // 确保balanceScore在合理范围内
    convertedData.balanceScore = Math.max(0, Math.min(100, convertedData.balanceScore))

    console.log('✅ 数据结构转换完成:', convertedData)
    return convertedData
  }

  /**
   * 提取健康风险评估数据
   */
  private extractRiskAssessments(aiData: any, fieldNames: string[]): Array<{level: string; title: string; description: string}> {
    console.log('🔥 提取健康风险评估数据')

    // 尝试多种方式获取风险数据
    let riskData: any[] = []

    for (const fieldName of fieldNames) {
      const data = aiData[fieldName]
      if (Array.isArray(data) && data.length > 0) {
        riskData = data
        break
      }
    }

    // 转换为AnalyticsView期望的格式
    const riskAssessments = riskData.map(risk => {
      // 处理不同格式的风险数据
      if (typeof risk === 'string') {
        return {
          level: 'low',
          title: '营养建议',
          description: risk
        }
      } else if (typeof risk === 'object' && risk !== null) {
        return {
          level: this.normalizeRiskLevel(risk.level || risk.riskLevel || 'low'),
          title: risk.title || risk.name || risk.riskTitle || '健康风险',
          description: risk.description || risk.desc || risk.content || risk.riskDesc || '需要注意的健康问题'
        }
      } else {
        return {
          level: 'low',
          title: '一般建议',
          description: '保持健康的生活方式'
        }
      }
    })

    // 如果没有找到风险数据，提供默认的基于营养充足率的风险评估
    if (riskAssessments.length === 0) {
      console.log('🔥 使用基于营养充足率的默认风险评估')
      return this.generateDefaultRiskAssessments(adequacyRatios)
    }

    console.log('✅ 健康风险评估提取完成:', riskAssessments)
    return riskAssessments.slice(0, 3) // 限制显示数量
  }

  /**
   * 提取改进建议数据
   */
  private extractImprovementSuggestions(aiData: any, fieldNames: string[]): Array<{category: string; suggestion: string}> {
    console.log('🔥 提取改进建议数据')

    // 尝试多种方式获取改进建议数据
    let improvementData: any[] = []

    for (const fieldName of fieldNames) {
      const data = aiData[fieldName]
      if (Array.isArray(data) && data.length > 0) {
        improvementData = data
        break
      }
    }

    // 转换为AnalyticsView期望的格式
    const improvementSuggestions = improvementData.map(improvement => {
      // 处理不同格式的改进建议数据
      if (typeof improvement === 'string') {
        return {
          category: '饮食建议',
          suggestion: improvement
        }
      } else if (typeof improvement === 'object' && improvement !== null) {
        return {
          category: improvement.category || improvement.type || improvement.area || '饮食建议',
          suggestion: improvement.suggestion || improvement.content || improvement.text || improvement.advice || '改进建议'
        }
      } else {
        return {
          category: '一般建议',
          suggestion: '保持健康的生活方式'
        }
      }
    })

    // 如果没有找到改进建议，提供默认建议
    if (improvementSuggestions.length === 0) {
      console.log('🔥 使用默认改进建议')
      return [
        { category: '饮食结构', suggestion: '按照膳食指南调整食物比例' },
        { category: '营养均衡', suggestion: '保证蛋白质、碳水化合物、脂肪的合理配比' },
        { category: '生活方式', suggestion: '结合适量运动，维持健康体重' }
      ]
    }

    console.log('✅ 改进建议提取完成:', improvementSuggestions)
    return improvementSuggestions.slice(0, 3) // 限制显示数量
  }

  /**
   * 标准化风险等级
   */
  private normalizeRiskLevel(level: string): 'low' | 'medium' | 'high' {
    const levelMap: Record<string, 'low' | 'medium' | 'high'> = {
      'low': 'low',
      'medium': 'medium',
      'high': 'high',
      '低': 'low',
      '中': 'medium',
      '高': 'high',
      '低风险': 'low',
      '中风险': 'medium',
      '高风险': 'high'
    }
    return levelMap[level] || 'low'
  }

  /**
   * 生成默认的健康风险评估
   */
  private generateDefaultRiskAssessments(adequacyRatios: Record<string, number>): Array<{level: string; title: string; description: string}> {
    const assessments: Array<{level: string; title: string; description: string}> = []

    // 基于营养充足率生成风险评估
    if ((adequacyRatios.calories || 0) < 0.7) {
      assessments.push({
        level: 'medium',
        title: '热量摄入不足',
        description: '长期热量摄入不足可能影响身体正常功能，建议适当增加健康食物摄入'
      })
    }

    if ((adequacyRatios.protein || 0) < 0.7) {
      assessments.push({
        level: 'medium',
        title: '蛋白质摄入不足',
        description: '蛋白质摄入不足可能影响肌肉维护和免疫功能，建议增加优质蛋白质来源'
      })
    }

    if ((adequacyRatios.sodium || 0) > 1.2) {
      assessments.push({
        level: 'medium',
        title: '钠摄入过多',
        description: '过量钠摄入可能增加高血压风险，建议减少盐和加工食品的摄入'
      })
    }

    // 如果没有特别风险，添加一般性建议
    if (assessments.length === 0) {
      assessments.push({
        level: 'low',
        title: '营养状况良好',
        description: '当前饮食结构基本合理，建议继续保持均衡饮食习惯'
      })
    }

    return assessments.slice(0, 3)
  }

  /**
   * 从AI响应中提取营养数据
   */
  private extractNutritionDataFromResponse(data: any): any {
    // 可能的字段路径
    const possiblePaths = [
      'nutritionEstimate',
      'currentIntake',
      'nutritionData',
      'intake',
      'nutrition',
      'nutrients'
    ]

    for (const path of possiblePaths) {
      if (data[path] && typeof data[path] === 'object') {
        return data[path]
      }
    }

    // 如果没有找到对象，尝试直接在根级别查找营养相关字段
    const nutritionFields = ['calories', 'protein', 'carbs', 'fat']
    const foundNutritionData: any = {}

    for (const field of nutritionFields) {
      if (data[field] !== undefined && data[field] !== null) {
        foundNutritionData[field] = data[field]
      }
    }

    return Object.keys(foundNutritionData).length > 0 ? foundNutritionData : null
  }

  /**
   * 提取字段（支持多个可能的字段名）
   */
  private extractField(data: any, fieldNames: string[], defaultValue: any): any {
    for (const fieldName of fieldNames) {
      if (data[fieldName] !== undefined && data[fieldName] !== null) {
        return data[fieldName]
      }
    }
    return defaultValue
  }

  /**
   * 提取数组字段（支持多个可能的字段名）
   */
  private extractArrayField(data: any, fieldNames: string[], defaultValue: string[]): string[] {
    for (const fieldName of fieldNames) {
      const value = data[fieldName]
      if (Array.isArray(value) && value.length > 0) {
        return value.filter(item => typeof item === 'string' && item.trim().length > 0)
      } else if (typeof value === 'string' && value.trim().length > 0) {
        // 如果是字符串，尝试分割为数组
        return value.split(/[，,、\n]/).filter(item => item.trim().length > 0)
      }
    }
    return defaultValue
  }

  /**
   * 计算BMI
   */
  private calculateBMI(userProfile: UserProfile): number {
    const weight = this.cleanNumericValue(userProfile.weight)
    const height = this.cleanNumericValue(userProfile.height) / 100
    return height > 0 ? weight / (height * height) : 0
  }

  /**
   * 统一的AI响应解析方法
   */
  private parseAIResponse<T>(
    response: string,
    defaultData: T,
    options: {
      strictMode?: boolean
      requiredFields?: string[]
      dataTransform?: (data: any) => T
    } = {}
  ): T {
    console.log('🔥 开始解析AI响应')

    try {
      // 策略1: 尝试直接解析JSON
      let parsedData: any = null
      let parseSuccess = false

      try {
        parsedData = JSON.parse(response)
        parseSuccess = true
        console.log('✅ 直接JSON解析成功')
      } catch (e) {
        console.log('⚠️ 直接JSON解析失败，尝试其他策略')
      }

      // 策略2: 提取JSON代码块
      if (!parseSuccess) {
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          try {
            parsedData = JSON.parse(jsonMatch[1].trim())
            parseSuccess = true
            console.log('✅ 代码块JSON解析成功')
          } catch (e) {
            console.log('⚠️ 代码块JSON解析失败')
          }
        }
      }

      // 策略3: 提取花括号内容
      if (!parseSuccess) {
        const braceMatch = response.match(/\{[\s\S]*\}/)
        if (braceMatch) {
          try {
            parsedData = JSON.parse(braceMatch[0])
            parseSuccess = true
            console.log('✅ 花括号JSON解析成功')
          } catch (e) {
            console.log('⚠️ 花括号JSON解析失败')
          }
        }
      }

      // 验证解析结果
      if (!parseSuccess || !parsedData) {
        throw new Error('无法解析AI响应为有效数据')
      }

      // 检查必需字段
      if (options.requiredFields && options.requiredFields.length > 0) {
        const missingFields = options.requiredFields.filter(field =>
          parsedData[field] === undefined || parsedData[field] === null
        )
        if (missingFields.length > 0) {
          console.warn('⚠️ 缺少必需字段:', missingFields)
          if (options.strictMode) {
            throw new Error(`缺少必需字段: ${missingFields.join(', ')}`)
          }
        }
      }

      // 数据转换
      let finalData: T
      if (options.dataTransform) {
        finalData = options.dataTransform(parsedData)
      } else {
        finalData = parsedData as T
      }

      console.log('✅ AI响应解析成功:', finalData)
      return finalData

    } catch (error) {
      console.error('❌ AI响应解析失败:', error)
      console.log('📝 原始响应:', response)

      if (options.strictMode) {
        throw error
      }

      console.log('🔥 返回默认数据')
      return defaultData
    }
  }

  /**
   * 清理数值，确保为有效数字
   */
  private cleanNumericValue(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0
    }

    // 如果是字符串，移除非数字字符（保留小数点和负号）
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.-]/g, '')
      const parsed = parseFloat(cleaned)
      return isNaN(parsed) ? 0 : Math.max(0, parsed)
    }

    // 如果是数字，确保不为负数
    return Math.max(0, Number(value) || 0)
  }

  /**
   * 计算营养充足率（增强版）
   */
  private calculateAdequacyRatios(
    currentIntake: NutritionAnalysisResult['currentIntake'],
    dailyNeeds: NutritionAnalysisResult['dailyNeeds']
  ): Record<string, number> {
    console.log('🔥 开始计算营养充足率')
    console.log('📊 当前摄入:', currentIntake)
    console.log('📊 每日需求:', dailyNeeds)

    const adequacyRatios: Record<string, number> = {}

    // 定义需要计算充足率的营养素
    const nutrients = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sodium', 'calcium', 'iron', 'vitaminC', 'vitaminD']

    nutrients.forEach(nutrient => {
      const intake = this.cleanNumericValue(currentIntake[nutrient])
      const need = this.cleanNumericValue(dailyNeeds[nutrient])

      // 特殊处理某些营养素的最大限制
      let adjustedNeed = need
      if (nutrient === 'sodium') {
        // 钠的摄入量不应该超过需求量，充足率最大为100%
        adjustedNeed = Math.max(need, 1)
      } else if (nutrient === 'calories') {
        // 热量需求最少为100千卡，避免除零
        adjustedNeed = Math.max(need, 100)
      } else {
        // 其他营养素需求最少为1，避免除零
        adjustedNeed = Math.max(need, 1)
      }

      // 计算充足率
      let ratio = 0
      if (adjustedNeed > 0) {
        ratio = intake / adjustedNeed

        // 对于某些营养素，限制最大充足率
        if (nutrient === 'sodium') {
          ratio = Math.min(ratio, 1) // 钠最多100%
        } else {
          ratio = Math.min(ratio, 2) // 其他营养素最多200%
        }
      }

      adequacyRatios[nutrient] = ratio

      console.log(`🔥 ${nutrient}: 摄入=${intake}, 需求=${adjustedNeed}, 充足率=${ratio}`)
    })

    console.log('✅ 营养充足率计算完成:', adequacyRatios)
    return adequacyRatios
  }

  /**
   * 基于饮食描述智能估算营养摄入
   */
  private estimateNutritionFromMeals(
    meals: UserProfile['meals']
  ): NutritionAnalysisResult['currentIntake'] {
    console.log('🔥 开始智能估算营养摄入')

    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0
    let totalFiber = 0
    let totalSodium = 0
    let totalCalcium = 0
    let totalIron = 0
    let totalVitaminC = 0
    let totalVitaminD = 0

    meals.forEach(meal => {
      if (!meal.description || meal.description.trim() === '') {
        // 如果没有饮食描述，基于餐次类型估算
        const baseEstimate = this.getMealTypeEstimate(meal.type)
        totalCalories += baseEstimate.calories
        totalProtein += baseEstimate.protein
        totalCarbs += baseEstimate.carbs
        totalFat += baseEstimate.fat
        totalFiber += baseEstimate.fiber
        totalSodium += baseEstimate.sodium
        totalCalcium += baseEstimate.calcium
        totalIron += baseEstimate.iron
        totalVitaminC += baseEstimate.vitaminC
        totalVitaminD += baseEstimate.vitaminD
      } else {
        // 基于饮食描述进行估算
        const descriptionEstimate = this.estimateNutritionFromDescription(meal.description, meal.type)
        totalCalories += descriptionEstimate.calories
        totalProtein += descriptionEstimate.protein
        totalCarbs += descriptionEstimate.carbs
        totalFat += descriptionEstimate.fat
        totalFiber += descriptionEstimate.fiber
        totalSodium += descriptionEstimate.sodium
        totalCalcium += descriptionEstimate.calcium
        totalIron += descriptionEstimate.iron
        totalVitaminC += descriptionEstimate.vitaminC
        totalVitaminD += descriptionEstimate.vitaminD
      }
    })

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
      fiber: Math.round(totalFiber),
      sodium: Math.round(totalSodium),
      calcium: Math.round(totalCalcium),
      iron: Math.round(totalIron),
      vitaminC: Math.round(totalVitaminC),
      vitaminD: Math.round(totalVitaminD),
    }
  }

  /**
   * 基于饮食描述估算营养成分
   */
  private estimateNutritionFromDescription(description: string, mealType: string): NutritionAnalysisResult['currentIntake'] {
    console.log('🔥 基于描述估算营养:', description)

    // 获取该餐次的基础估算值
    const baseEstimate = this.getMealTypeEstimate(mealType)

    // 分析描述中的关键词，调整估算值
    const desc = description.toLowerCase()
    let multiplier = 1.0

    // 分析食物分量
    if (desc.includes('大份') || desc.includes('大量') || desc.includes('很多')) {
      multiplier = 1.3
    } else if (desc.includes('小份') || desc.includes('少量') || desc.includes('一点')) {
      multiplier = 0.7
    }

    // 分析主要食物类型
    let calories = baseEstimate.calories
    let protein = baseEstimate.protein
    let carbs = baseEstimate.carbs
    let fat = baseEstimate.fat

    // 肉类为主的食物
    if (desc.includes('肉') || desc.includes('鸡') || desc.includes('猪') || desc.includes('牛') || desc.includes('鱼') || desc.includes('虾')) {
      protein *= 1.4
      fat *= 1.2
      carbs *= 0.8
    }

    // 主食为主的食物
    if (desc.includes('饭') || desc.includes('米') || desc.includes('面') || desc.includes('馒头') || desc.includes('面包')) {
      carbs *= 1.3
      protein *= 0.9
    }

    // 蔬菜为主的食物
    if (desc.includes('菜') || desc.includes('蔬菜') || desc.includes('沙拉') || desc.includes('青菜')) {
      calories *= 0.8
      carbs *= 0.9
      fat *= 0.7
    }

    // 油炸食物
    if (desc.includes('炸') || desc.includes('油') || desc.includes('煎')) {
      fat *= 1.5
      calories *= 1.2
    }

    // 甜食
    if (desc.includes('甜') || desc.includes('糖') || desc.includes('蛋糕') || desc.includes('点心')) {
      carbs *= 1.4
      fat *= 1.1
    }

    return {
      calories: Math.round(calories * multiplier),
      protein: Math.round(protein * multiplier),
      carbs: Math.round(carbs * multiplier),
      fat: Math.round(fat * multiplier),
      fiber: Math.round(baseEstimate.fiber * multiplier),
      sodium: Math.round(baseEstimate.sodium * multiplier),
      calcium: Math.round(baseEstimate.calcium * multiplier),
      iron: Math.round(baseEstimate.iron * multiplier),
      vitaminC: Math.round(baseEstimate.vitaminC * multiplier),
      vitaminD: Math.round(baseEstimate.vitaminD * multiplier),
    }
  }

  /**
   * 获取餐次类型的基础估算值
   */
  private getMealTypeEstimate(mealType: string): NutritionAnalysisResult['currentIntake'] {
    const estimates = {
      breakfast: {
        calories: 400,
        protein: 15,
        carbs: 50,
        fat: 12,
        fiber: 5,
        sodium: 400,
        calcium: 200,
        iron: 3,
        vitaminC: 20,
        vitaminD: 1,
      },
      lunch: {
        calories: 600,
        protein: 25,
        carbs: 70,
        fat: 18,
        fiber: 8,
        sodium: 600,
        calcium: 150,
        iron: 4,
        vitaminC: 30,
        vitaminD: 2,
      },
      dinner: {
        calories: 500,
        protein: 20,
        carbs: 60,
        fat: 15,
        fiber: 6,
        sodium: 500,
        calcium: 100,
        iron: 3,
        vitaminC: 25,
        vitaminD: 1,
      },
      snack: {
        calories: 200,
        protein: 5,
        carbs: 25,
        fat: 8,
        fiber: 2,
        sodium: 200,
        calcium: 50,
        iron: 1,
        vitaminC: 10,
        vitaminD: 0,
      },
    }

    return estimates[mealType as keyof typeof estimates] || estimates.snack
  }

  /**
   * 基于食物名称估算营养成分
   */
  private estimateFoodNutrition(
    foodName: string,
    amount: number,
    unit: string
  ): NutritionAnalysisResult['currentIntake'] {
    const name = foodName.toLowerCase()
    const multiplier = amount || 1

    // 主食类
    if (
      name.includes('饭') ||
      name.includes('米') ||
      name.includes('面') ||
      name.includes('馒头') ||
      name.includes('面包')
    ) {
      return {
        calories: 150 * multiplier,
        protein: 4 * multiplier,
        carbs: 35 * multiplier,
        fat: 1 * multiplier,
        fiber: 2 * multiplier,
        sodium: 100 * multiplier,
        calcium: 20 * multiplier,
        iron: 1 * multiplier,
        vitaminC: 0,
        vitaminD: 0,
      }
    }

    // 肉类
    if (
      name.includes('肉') ||
      name.includes('鸡') ||
      name.includes('猪') ||
      name.includes('牛') ||
      name.includes('鱼')
    ) {
      return {
        calories: 200 * multiplier,
        protein: 25 * multiplier,
        carbs: 0,
        fat: 10 * multiplier,
        fiber: 0,
        sodium: 300 * multiplier,
        calcium: 15 * multiplier,
        iron: 2 * multiplier,
        vitaminC: 0,
        vitaminD: 1 * multiplier,
      }
    }

    // 蔬菜类
    if (
      name.includes('菜') ||
      name.includes('蔬菜') ||
      name.includes('菠菜') ||
      name.includes('白菜') ||
      name.includes('萝卜')
    ) {
      return {
        calories: 30 * multiplier,
        protein: 2 * multiplier,
        carbs: 6 * multiplier,
        fat: 0.5 * multiplier,
        fiber: 3 * multiplier,
        sodium: 100 * multiplier,
        calcium: 50 * multiplier,
        iron: 1 * multiplier,
        vitaminC: 30 * multiplier,
        vitaminD: 0,
      }
    }

    // 蛋类
    if (name.includes('蛋')) {
      return {
        calories: 80 * multiplier,
        protein: 7 * multiplier,
        carbs: 1 * multiplier,
        fat: 5 * multiplier,
        fiber: 0,
        sodium: 70 * multiplier,
        calcium: 25 * multiplier,
        iron: 1 * multiplier,
        vitaminC: 0,
        vitaminD: 1 * multiplier,
      }
    }

    // 豆制品
    if (name.includes('豆腐') || name.includes('豆')) {
      return {
        calories: 100 * multiplier,
        protein: 10 * multiplier,
        carbs: 6 * multiplier,
        fat: 5 * multiplier,
        fiber: 1 * multiplier,
        sodium: 200 * multiplier,
        calcium: 150 * multiplier,
        iron: 2 * multiplier,
        vitaminC: 0,
        vitaminD: 0,
      }
    }

    // 默认值
    return {
      calories: 100 * multiplier,
      protein: 8 * multiplier,
      carbs: 15 * multiplier,
      fat: 3 * multiplier,
      fiber: 2 * multiplier,
      sodium: 150 * multiplier,
      calcium: 50 * multiplier,
      iron: 1 * multiplier,
      vitaminC: 10 * multiplier,
      vitaminD: 0,
    }
  }

  /**
   * 进行AI营养分析
   */
  private async performAIAnalysis(
    userProfile: UserProfile,
    dailyNeeds: NutritionAnalysisResult['dailyNeeds'],
    currentIntake: NutritionAnalysisResult['currentIntake']
  ): Promise<NutritionAnalysisResult['analysis']> {
    try {
      console.log('🔥 开始AI营养分析')

      // 检查AI服务状态
      const aiStatus = await this.checkAIServiceStatus()
      console.log('📊 AI服务状态:', aiStatus)

      if (!aiStatus.available) {
        console.warn('⚠️ AI服务不可用，使用本地分析:', aiStatus.reason)
        ElMessage.info(`AI服务暂时不可用(${aiStatus.reason})，使用本地智能分析`)
        return this.performLocalNutritionAnalysis(userProfile, dailyNeeds, currentIntake)
      }

      // 使用增强的营养充足率计算方法
      const adequacyRatios = this.calculateAdequacyRatios(currentIntake, dailyNeeds)

      console.log('🔥 营养充足率计算完成:', adequacyRatios)

      // 检查是否有饮食记录
      const hasMealData = userProfile.meals && userProfile.meals.length > 0

      // 构建详细的分析提示
      const prompt = `
作为专业营养师，请基于中国居民膳食指南分析以下营养状况：

用户信息：
- 年龄: ${userProfile.age}岁
- 性别: ${userProfile.gender === 'male' ? '男' : '女'}
- 身高: ${userProfile.height}cm
- 体重: ${userProfile.weight}kg
- 活动水平: ${userProfile.activityLevel}
- 健康目标: ${userProfile.healthGoals.join('、')}
${userProfile.allergies && userProfile.allergies.length > 0 ? `- 过敏食物: ${userProfile.allergies.join('、')}` : ''}
${userProfile.medicalConditions && userProfile.medicalConditions.length > 0 ? `- 健康状况: ${userProfile.medicalConditions.join('、')}` : ''}

${
  hasMealData
    ? `营养对比：
每日需求 vs 当前摄入
- 热量: ${dailyNeeds.calories}千卡 / ${currentIntake.calories}千卡
- 蛋白质: ${dailyNeeds.protein}g / ${currentIntake.protein}g
- 碳水化合物: ${dailyNeeds.carbs}g / ${currentIntake.carbs}g
- 脂肪: ${dailyNeeds.fat}g / ${currentIntake.fat}g
- 膳食纤维: ${dailyNeeds.fiber}g / ${currentIntake.fiber}g`
    : `每日营养需求：
- 热量: ${dailyNeeds.calories}千卡
- 蛋白质: ${dailyNeeds.protein}g
- 碳水化合物: ${dailyNeeds.carbs}g
- 脂肪: ${dailyNeeds.fat}g
- 膳食纤维: ${dailyNeeds.fiber}g

注意：用户尚未提供具体饮食记录，请基于用户的年龄、性别、体重、活动水平和健康目标估算一个典型的营养摄入模式。`
}

请按以下JSON格式提供分析结果（只返回JSON）：
{
  "nutritionEstimate": {
    "calories": 估算的热量摄入(千卡),
    "protein": 估算的蛋白质摄入(克),
    "carbs": 估算的碳水化合物摄入(克),
    "fat": 估算的脂肪摄入(克),
    "fiber": 估算的膳食纤维摄入(克),
    "sodium": 估算的钠摄入(毫克),
    "calcium": 估算的钙摄入(毫克),
    "iron": 估算的铁摄入(毫克),
    "vitaminC": 估算的维生素C摄入(毫克),
    "vitaminD": 估算的维生素D摄入(微克)
  },
  "balanceScore": 营养平衡评分(0-100),
  "recommendations": [
    "具体的饮食建议1",
    "具体的饮食建议2",
    "具体的饮食建议3"
  ],
  "insights": [
    "营养洞察1",
    "营养洞察2"
  ],
  "risks": [
    {
      "level": "low/medium/high",
      "title": "风险标题",
      "description": "风险描述"
    }
  ],
  "improvementSuggestions": [
    {
      "category": "改进类别",
      "suggestion": "具体改进建议"
    }
  ]
}

请结合中国居民膳食指南，提供科学、实用的建议。
`

      // 检查AI服务是否需要初始化
      if (!aiService['isInitialized']) {
        console.log('🔥 AI服务未初始化，正在初始化...')
        await aiService.init()
      }

      const response = await aiService.generateText(prompt)
      console.log('🔥 AI分析原始响应:', response)

      // 多种JSON解析策略
      let analysisData: any = null

      // 策略1: 标准JSON提取
      try {
        const jsonRegex = /\{[\s\S]*\}/
        const analysisMatch = jsonRegex.exec(response)
        if (analysisMatch) {
          analysisData = JSON.parse(analysisMatch[0])
          console.log('🔥 策略1解析成功:', analysisData)
        }
      } catch (e) {
        console.log('🔥 策略1解析失败:', e)
      }

      // 策略2: 直接尝试解析整个响应
      if (!analysisData) {
        try {
          analysisData = JSON.parse(response.trim())
          console.log('🔥 策略2直接解析成功:', analysisData)
        } catch (e) {
          console.log('🔥 策略2直接解析失败:', e)
        }
      }

      // 策略3: 从文本中提取JSON
      if (!analysisData) {
        try {
          let jsonStart = response.indexOf('{')
          let jsonEnd = response.lastIndexOf('}')
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            const jsonStr = response.substring(jsonStart, jsonEnd + 1)
            analysisData = JSON.parse(jsonStr)
            console.log('🔥 策略3提取解析成功:', analysisData)
          }
        } catch (e) {
          console.log('🔥 策略3提取解析失败:', e)
        }
      }

      // 策略4: 如果还是没有数据，使用智能分析
      if (!analysisData) {
        console.log('🔥 使用智能分析策略')
        return this.generateSmartAnalysis(
          userProfile,
          dailyNeeds,
          currentIntake,
          adequacyRatios
        )
      }

      // 使用新的数据结构转换方法
      const convertedData = this.convertNutritionAnalysisData(
        analysisData,
        userProfile,
        dailyNeeds,
        currentIntake,
        adequacyRatios
      )

      console.log('✅ 营养分析数据转换完成:', convertedData)
      return convertedData
    } catch (error) {
      console.error('❌ AI营养分析失败:', error)

      // 返回智能分析结果
      // 使用增强的营养充足率计算方法
      const adequacyRatios = this.calculateAdequacyRatios(currentIntake, dailyNeeds)

      const smartAnalysis = this.generateSmartAnalysis(
        userProfile,
        dailyNeeds,
        currentIntake,
        adequacyRatios
      )
      console.log('🔥 使用智能分析作为fallback:', smartAnalysis)

      ElMessage.info('AI分析暂时不可用，使用智能分析结果')
      return smartAnalysis
    }
  }

  /**
   * 生成智能营养分析（当AI分析失败时使用）
   */
  private generateSmartAnalysis(
    userProfile: UserProfile,
    dailyNeeds: NutritionAnalysisResult['dailyNeeds'],
    currentIntake: NutritionAnalysisResult['currentIntake'],
    adequacyRatios: Record<string, number>
  ) {
    console.log('🔥 生成智能营养分析')

    // 计算平衡分数
    let balanceScore = 75

    // 基于营养充足率调整平衡分数
    const avgAdequacy =
      Object.values(adequacyRatios).reduce((sum, ratio) => sum + ratio, 0) /
      Object.values(adequacyRatios).length
    console.log('🔥 平均营养充足率:', avgAdequacy)

    if (avgAdequacy >= 0.8 && avgAdequacy <= 1.2) {
      balanceScore = 85 + Math.min(10, (1 - Math.abs(avgAdequacy - 1)) * 20)
    } else if (avgAdequacy >= 0.6 && avgAdequacy <= 1.4) {
      balanceScore = 70 + (1 - Math.abs(avgAdequacy - 1) / 0.4) * 15
    } else {
      balanceScore = Math.max(50, 70 - Math.abs(avgAdequacy - 1) * 20)
    }

    // 基于用户具体情况生成建议
    const recommendations = []
    const riskAssessments = []
    const improvementSuggestions = []

    // 热量分析
    const calorieRatio = adequacyRatios.calories || 0
    if (calorieRatio < 0.7) {
      recommendations.push('建议适当增加热量摄入，可选择营养密度高的食物')
      riskAssessments.push({
        level: 'medium',
        title: '热量摄入不足',
        description: '当前热量摄入可能无法满足基础代谢需求',
      })
    } else if (calorieRatio > 1.3) {
      recommendations.push('建议控制总热量摄入，避免过量')
      riskAssessments.push({
        level: 'medium',
        title: '热量摄入偏高',
        description: '长期过量摄入可能导致体重增加',
      })
    }

    // 蛋白质分析
    const proteinRatio = adequacyRatios.protein || 0
    if (proteinRatio < 0.8) {
      recommendations.push('增加优质蛋白质摄入，如鱼类、禽肉、蛋类、豆制品')
      improvementSuggestions.push({
        category: '蛋白质优化',
        suggestion: '每餐保证适量蛋白质，分布到三餐摄入',
      })
    }

    // 膳食纤维分析
    const fiberRatio = adequacyRatios.fiber || 0
    if (fiberRatio < 0.6) {
      recommendations.push('增加蔬菜、水果和全谷物摄入，补充膳食纤维')
      improvementSuggestions.push({
        category: '膳食纤维',
        suggestion: '每天保证500g蔬菜，其中深色蔬菜占一半',
      })
    }

    // 健康目标导向的建议
    if (userProfile.healthGoals.includes('减重')) {
      recommendations.push('控制总热量摄入，增加运动量，建议每日热量缺口300-500千卡')
    } else if (userProfile.healthGoals.includes('增肌')) {
      recommendations.push('增加蛋白质摄入至1.6-2.0g/kg体重，配合力量训练')
    }

    // 默认建议
    if (recommendations.length === 0) {
      recommendations.push(
        '保持当前饮食结构，定期进行营养评估',
        '注意食物多样性，确保各种营养素均衡摄入',
        '保持规律作息和适量运动'
      )
    }

    // 默认风险评估
    if (riskAssessments.length === 0) {
      riskAssessments.push({
        level: 'low',
        title: '营养状况良好',
        description: '当前饮食结构基本合理，建议保持',
      })
    }

    // 默认改进建议
    if (improvementSuggestions.length === 0) {
      improvementSuggestions.push({
        category: '饮食优化',
        suggestion: '按照膳食指南金字塔调整各类食物比例',
      })
    }

    console.log('🔥 智能分析结果:', {
      balanceScore: Math.round(balanceScore),
      recommendations,
      riskAssessments,
      improvementSuggestions,
    })

    return {
      balanceScore: Math.round(balanceScore),
      adequacyRatios,
      recommendations,
      riskAssessments,
      improvementSuggestions,
    }
  }

  /**
   * 主要的营养分析方法
   */
  async analyzeNutrition(userProfile: UserProfile): Promise<NutritionAnalysisResult> {
    try {
      console.log('🔥 开始营养分析，原始用户数据:', userProfile)

      // 验证和清理用户数据
      const validatedProfile = this.validateAndCleanUserProfile(userProfile)
      console.log('✅ 验证后的用户数据:', validatedProfile)

      // 计算每日营养需求
      const dailyNeeds = this.calculateDailyNeeds(validatedProfile)
      console.log('📊 每日营养需求:', dailyNeeds)

      // 计算当前营养摄入
      const currentIntake = await this.calculateCurrentIntake(validatedProfile.meals)
      console.log('📊 当前营养摄入:', currentIntake)

      // 进行AI分析
      const analysis = await this.performAIAnalysis(validatedProfile, dailyNeeds, currentIntake)
      console.log('📊 AI分析结果:', analysis)

      return {
        dailyNeeds,
        currentIntake,
        analysis,
        confidenceScore: 85, // AI分析可信度
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('营养分析失败:', error)
      throw new Error('营养分析失败，请稍后重试')
    }
  }

  /**
   * 获取个性化推荐
   */
  async generatePersonalizedRecommendations(userProfile: UserProfile): Promise<string[]> {
    try {
      const healthMetrics = this.calculateHealthMetrics(userProfile)

      const prompt = `
基于以下用户信息，提供5条个性化的营养建议：

用户信息：
- BMI: ${healthMetrics.bmi} (${healthMetrics.bmiStatusText})
- 健康目标: ${userProfile.healthGoals.join('、')}
- 活动水平: ${userProfile.activityLevel}
- 年龄: ${userProfile.age}岁
- 性别: ${userProfile.gender === 'male' ? '男' : '女'}

请提供实用的建议，每条建议简洁明了，符合中国居民膳食指南。
请直接返回建议列表，每行一条，不要编号。
`

      // 检查AI服务是否需要初始化
      if (!aiService['isInitialized']) {
        console.log('🔥 AI服务未初始化，正在初始化...')
        await aiService.init()
      }

      const response = await aiService.generateText(prompt)
      return response
        .split('\n')
        .filter(line => line.trim())
        .slice(0, 5)
    } catch (error) {
      console.error('生成个性化推荐失败:', error)

      // 返回通用建议
      return [
        '每天保证300-500g蔬菜，深色蔬菜占一半以上',
        '适量摄入优质蛋白质，如鱼类、禽肉、蛋类、豆制品',
        '主食以全谷物为主，减少精制米面',
        '每天饮水1500-1700ml，少喝含糖饮料',
        '规律进餐，避免暴饮暴食',
      ]
    }
  }

  /**
   * 获取中国膳食指南信息
   */
  getDietaryGuidelines() {
    return CHINESE_DIETARY_GUIDELINES
  }
}

// 导出服务实例
export const nutritionAnalysisService = new NutritionAnalysisService()
