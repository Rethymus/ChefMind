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
    foods: {
      name: string
      amount: number
      unit: string
    }[]
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
export interface HealthMetrics {
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

export class NutritionAnalysisService {
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
      return {
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
    }

    try {
      // 构建AI分析提示
      const mealDescriptions = meals
        .map(meal => {
          const foodList = meal.foods
            .map(food => `${food.name} ${food.amount}${food.unit}`)
            .join('、')
          return `${meal.type}: ${foodList}`
        })
        .join('\n')

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

      const response = await aiService.generateText(prompt)

      // 解析AI返回的JSON
      const jsonRegex = /\{[\s\S]*\}/
      const nutritionMatch = jsonRegex.exec(response)
      if (nutritionMatch) {
        const nutritionData = JSON.parse(nutritionMatch[0])
        return nutritionData
      }

      throw new Error('AI返回格式无效')
    } catch (error) {
      console.error('计算营养摄入量失败:', error)
      ElMessage.warning('营养分析失败，使用默认估算值')

      // 返回简单估算值
      return {
        calories: meals.length * 400,
        protein: meals.length * 20,
        carbs: meals.length * 50,
        fat: meals.length * 15,
        fiber: meals.length * 8,
        sodium: meals.length * 600,
        calcium: meals.length * 150,
        iron: meals.length * 3,
        vitaminC: meals.length * 20,
        vitaminD: meals.length * 2,
      }
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
      const adequacyRatios: Record<string, number> = {}
      Object.keys(dailyNeeds).forEach(nutrient => {
        adequacyRatios[nutrient] = currentIntake[nutrient] / dailyNeeds[nutrient]
      })

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

注意：用户尚未提供具体饮食记录，请基于个人信息提供一般性营养建议。`
}

请按以下JSON格式提供分析结果（只返回JSON）：
{
  "balanceScore": 营养平衡评分(0-100),
  "recommendations": [
    "具体的饮食建议1",
    "具体的饮食建议2",
    "具体的饮食建议3"
  ],
  "riskAssessments": [
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

      const response = await aiService.generateText(prompt)

      // 解析AI返回的JSON
      const jsonRegex = /\{[\s\S]*\}/
      const analysisMatch = jsonRegex.exec(response)
      if (analysisMatch) {
        const analysisData = JSON.parse(analysisMatch[0])

        return {
          balanceScore: analysisData.balanceScore || 75,
          adequacyRatios,
          recommendations: analysisData.recommendations || ['请保持均衡饮食'],
          riskAssessments: analysisData.riskAssessments || [],
          improvementSuggestions: analysisData.improvementSuggestions || [],
        }
      }

      throw new Error('AI分析返回格式无效')
    } catch (error) {
      console.error('AI营养分析失败:', error)

      // 返回基础分析结果
      const adequacyRatios: Record<string, number> = {}
      Object.keys(dailyNeeds).forEach(nutrient => {
        adequacyRatios[nutrient] = currentIntake[nutrient] / dailyNeeds[nutrient]
      })

      return {
        balanceScore: 75,
        adequacyRatios,
        recommendations: ['建议增加蔬菜和水果的摄入量', '保持规律的三餐时间', '适量增加全谷物食品'],
        riskAssessments: [
          {
            level: 'low',
            title: '营养风险较低',
            description: '当前饮食结构基本合理，建议保持',
          },
        ],
        improvementSuggestions: [
          {
            category: '饮食结构',
            suggestion: '按照膳食指南调整食物比例',
          },
        ],
      }
    }
  }

  /**
   * 主要的营养分析方法
   */
  async analyzeNutrition(userProfile: UserProfile): Promise<NutritionAnalysisResult> {
    try {
      // 计算每日营养需求
      const dailyNeeds = this.calculateDailyNeeds(userProfile)

      // 计算当前营养摄入
      const currentIntake = await this.calculateCurrentIntake(userProfile.meals)

      // 进行AI分析
      const analysis = await this.performAIAnalysis(userProfile, dailyNeeds, currentIntake)

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
