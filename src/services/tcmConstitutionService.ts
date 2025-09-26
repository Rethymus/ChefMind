// 中医体质分析服务
import { aiService } from './aiService'
import type { ExtendedUserProfile } from './aiPersonalizedNutritionService'

// 中医体质类型
export interface TCMConstitution {
  type: string
  name: string
  characteristics: string[]
  susceptibleDiseases: string[]
  dietaryRecommendations: string[]
  lifestyleAdvice: string[]
  seasonalAdjustments: {
    spring: string[]
    summer: string[]
    autumn: string[]
    winter: string[]
  }
  confidence: number
}

export interface TCMAnalysisResult {
  primaryConstitution: TCMConstitution
  secondaryConstitution?: TCMConstitution
  mixedConstitutionAnalysis?: string
  overallHealthScore: number
  nutritionalGuidance: string[]
  seasonalDietPlan: {
    currentSeason: string
    recommendations: string[]
  }
  aiInsights: string[]
  analysisTimestamp: string
}

// 九种基本体质类型定义
const CONSTITUTION_TYPES = {
  pinghe: {
    name: '平和质',
    description: '身体壮实、面色润泽、精力充沛',
    characteristics: ['体形匀称', '面色润泽', '头发稠密有光泽', '目光有神', '精力充沛', '睡眠良好'],
    susceptibleDiseases: ['较少生病', '抵抗力强'],
    dietaryPrinciples: ['饮食规律', '营养均衡', '不偏食', '适量进食'],
  },
  qixu: {
    name: '气虚质',
    description: '元气不足、疲乏无力、气短懒言',
    characteristics: ['疲乏无力', '气短懒言', '容易出汗', '声音低怯', '容易感冒'],
    susceptibleDiseases: ['感冒', '内脏下垂', '虚劳'],
    dietaryPrinciples: ['益气健脾', '甘温补益', '忌生冷油腻'],
  },
  yangxu: {
    name: '阳虚质',
    description: '阳气不足、畏寒怕冷、手足不温',
    characteristics: ['畏寒怕冷', '手足不温', '喜热饮食', '精神不振', '舌淡胖嫩'],
    susceptibleDiseases: ['水肿', '腹泻', '哮喘', '痰饮'],
    dietaryPrinciples: ['温阳散寒', '益气助阳', '忌寒凉'],
  },
  yinxu: {
    name: '阴虚质',
    description: '阴液不足、口燥咽干、手足心热',
    characteristics: ['手足心热', '口燥咽干', '喜冷饮', '大便干燥', '舌红少津'],
    susceptibleDiseases: ['虚劳', '失眠', '温病'],
    dietaryPrinciples: ['滋阴润燥', '甘凉清润', '忌辛辣燥热'],
  },
  tanshi: {
    name: '痰湿质',
    description: '痰湿凝聚、形体肥胖、腹部肥满',
    characteristics: ['形体肥胖', '腹部肥满', '胸闷痰多', '口黏腻', '身重不爽'],
    susceptibleDiseases: ['消渴', '中风', '胸痹'],
    dietaryPrinciples: ['化痰祛湿', '健脾利湿', '忌肥甘厚腻'],
  },
  shire: {
    name: '湿热质',
    description: '湿热内蕴、面垢油腻、口苦口干',
    characteristics: ['面垢油腻', '口苦口干', '身重困倦', '大便黏滞', '小便短赤'],
    susceptibleDiseases: ['疮疖', '黄疸', '淋证'],
    dietaryPrinciples: ['清热利湿', '甘淡清热', '忌辛温燥烈'],
  },
  xueyu: {
    name: '血瘀质',
    description: '血行不畅、肤色晦暗、易生瘀斑',
    characteristics: ['肤色晦暗', '易生瘀斑', '口唇暗淡', '舌暗或瘀点', '易忘健忘'],
    susceptibleDiseases: ['中风', '胸痹', '症瘕'],
    dietaryPrinciples: ['活血化瘀', '理气行血', '忌寒凉收敛'],
  },
  qiyu: {
    name: '气郁质',
    description: '气机郁滞、神情抑郁、情绪不稳',
    characteristics: ['神情抑郁', '情绪不稳', '烦闷不乐', '胸肋胀满', '善太息'],
    susceptibleDiseases: ['郁证', '失眠', '梅核气'],
    dietaryPrinciples: ['疏肝理气', '调畅气机', '忌辛辣刺激'],
  },
  tebing: {
    name: '特禀质',
    description: '先天失常、过敏体质、适应力差',
    characteristics: ['过敏体质', '遗传缺陷', '胎传异常', '适应力差'],
    susceptibleDiseases: ['过敏性疾病', '遗传性疾病', '胎传性疾病'],
    dietaryPrinciples: ['益气固表', '养血消风', '忌发物过敏原'],
  },
}

class TCMConstitutionService {
  /**
   * 使用AI分析用户的中医体质
   */
  async analyzeConstitution(userProfile: ExtendedUserProfile): Promise<TCMAnalysisResult> {
    try {
      console.log('开始中医体质分析...', userProfile)

      // 构建中医体质分析提示词
      const prompt = this.buildTCMAnalysisPrompt(userProfile)

      // 调用AI服务进行分析
      const aiResponse = await aiService.generateText(prompt, {
        maxTokens: 1500,
        temperature: 0.3,
      })
      console.log('TCM AI 响应:', aiResponse)

      // 解析AI响应
      const analysisResult = this.parseAIConstitutionResponse(aiResponse, userProfile)

      return analysisResult
    } catch (error) {
      console.error('中医体质分析失败:', error)
      return this.getFallbackAnalysis(userProfile)
    }
  }

  /**
   * 从AI响应中提取分析内容
   */
  private extractAnalysisContent(aiResponse: Record<string, unknown>): string {
    // 尝试从不同可能的字段中提取文本内容
    const recipe = aiResponse.recipe as Record<string, unknown> | undefined

    // 安全转换函数，确保不会出现[object Object]
    const safeStringConvert = (value: unknown): string => {
      if (value === null || value === undefined) return ''
      if (typeof value === 'string') return value
      if (typeof value === 'number' || typeof value === 'boolean') return String(value)
      return JSON.stringify(value)
    }

    if (recipe?.description) {
      return safeStringConvert(recipe.description)
    }

    if (recipe?.instructions) {
      if (Array.isArray(recipe.instructions)) {
        return recipe.instructions.map(safeStringConvert).join(' ')
      }
      return safeStringConvert(recipe.instructions)
    }

    if (recipe?.name) {
      return safeStringConvert(recipe.name)
    }

    // 如果都没有，返回JSON字符串用于解析
    return JSON.stringify(aiResponse)
  }

  /**
   * 构建中医体质分析的AI提示词
   */
  private buildTCMAnalysisPrompt(userProfile: ExtendedUserProfile): string {
    const {
      age,
      gender,
      height,
      weight,
      activityLevel,
      healthGoals,
      meals,
      medicalConditions,
      allergies,
      dietaryPreferences,
    } = userProfile

    // 计算BMI作为体质分析参考
    const bmi = weight / Math.pow(height / 100, 2)
    let bmiStatus: string
    if (bmi < 18.5) {
      bmiStatus = '偏瘦'
    } else if (bmi < 24) {
      bmiStatus = '正常'
    } else if (bmi < 28) {
      bmiStatus = '超重'
    } else {
      bmiStatus = '肥胖'
    }

    // 分析饮食习惯
    const mealDescriptions = meals.map(meal => `${meal.type}: ${meal.description}`).join('; ')

    return `作为一名专业的中医体质分析师，请根据以下用户信息进行详细的中医体质分析：

**基本信息：**
- 性别：${gender === 'male' ? '男' : '女'}
- 年龄：${age}岁
- 身高：${height}cm，体重：${weight}kg
- BMI：${bmi.toFixed(1)} (${bmiStatus})
- 活动水平：${activityLevel}
- 健康目标：${healthGoals.join('、')}

**饮食习惯：**
${mealDescriptions}

**健康状况：**
- 既往病史：${medicalConditions.length > 0 ? medicalConditions.join('、') : '无'}
- 过敏情况：${allergies || '无'}
- 饮食偏好：${dietaryPreferences.join('、')}

**分析要求：**
请基于传统中医"九种体质分类"理论，进行综合体质分析，并提供以下内容：

1. **主要体质类型**（从平和质、气虚质、阳虚质、阴虚质、痰湿质、湿热质、血瘀质、气郁质、特禀质中选择）
2. **次要体质类型**（如果存在混合体质）
3. **体质特征分析**
4. **易患疾病风险**
5. **饮食调理建议**（结合当前饮食习惯）
6. **生活方式建议**
7. **当前季节（${this.getCurrentSeason()}）的特殊调理建议**
8. **基于用户健康目标的个性化指导**

请用专业但易懂的语言回答，避免过于深奥的中医术语。重点关注实用性和可操作性。

返回格式请使用JSON：
{
  "primaryConstitution": "主要体质类型",
  "secondaryConstitution": "次要体质类型（如有）",
  "characteristics": ["体质特征1", "体质特征2", ...],
  "susceptibleDiseases": ["易患疾病1", "易患疾病2", ...],
  "dietaryRecommendations": ["饮食建议1", "饮食建议2", ...],
  "lifestyleAdvice": ["生活建议1", "生活建议2", ...],
  "seasonalAdjustments": ["季节调理建议1", "季节调理建议2", ...],
  "personalizedGuidance": ["个性化指导1", "个性化指导2", ...],
  "aiInsights": ["AI洞察1", "AI洞察2", ...],
  "confidence": 85
}`
  }

  /**
   * 解析AI体质分析响应
   */
  private parseAIConstitutionResponse(
    aiResponse: string,
    userProfile: ExtendedUserProfile
  ): TCMAnalysisResult {
    try {
      console.log('开始解析TCM AI响应:', aiResponse.substring(0, 200) + '...')

      // 解析AI响应数据
      const analysisData = this.extractAnalysisData(aiResponse)

      // 构建分析结果
      return this.buildAnalysisResult(analysisData, userProfile)
    } catch (error) {
      console.error('解析AI体质分析响应失败:', error)
      return this.getFallbackAnalysis(userProfile)
    }
  }

  /**
   * 提取分析数据
   */
  private extractAnalysisData(aiResponse: string): Record<string, unknown> {
    try {
      return this.parseJsonResponse(aiResponse)
    } catch (parseError) {
      console.warn('JSON解析失败，使用文本解析:', parseError)
      return this.parseTextResponse(aiResponse)
    }
  }

  /**
   * 解析JSON响应
   */
  private parseJsonResponse(aiResponse: string): Record<string, unknown> {
    // 移除可能的 markdown 标记
    const cleanResponse = aiResponse.replace(/```json\s*|\s*```/g, '').trim()

    // 提取第一个完整的 JSON 对象
    const jsonString = this.extractJsonFromResponse(cleanResponse)
    if (!jsonString) {
      throw new Error('No JSON found in response')
    }

    const analysisData = JSON.parse(jsonString)
    console.log('成功解析TCM JSON:', analysisData)
    return analysisData
  }

  /**
   * 从响应中提取JSON字符串
   */
  private extractJsonFromResponse(response: string): string | null {
    const firstBraceIndex = response.indexOf('{')
    if (firstBraceIndex === -1) {
      return null
    }

    let braceCount = 0
    let i = firstBraceIndex

    for (; i < response.length; i++) {
      if (response[i] === '{') braceCount++
      else if (response[i] === '}') braceCount--

      if (braceCount === 0) {
        return response.substring(firstBraceIndex, i + 1)
      }
    }

    return null
  }

  /**
   * 构建分析结果
   */
  private buildAnalysisResult(
    analysisData: Record<string, unknown>,
    userProfile: ExtendedUserProfile
  ): TCMAnalysisResult {
    const primaryConstitution = this.buildPrimaryConstitution(analysisData)
    const secondaryConstitution = this.buildSecondaryConstitution(analysisData)

    return {
      primaryConstitution,
      secondaryConstitution,
      mixedConstitutionAnalysis: this.buildMixedAnalysis(
        primaryConstitution,
        secondaryConstitution
      ),
      overallHealthScore: this.calculateHealthScore(userProfile, analysisData),
      nutritionalGuidance: this.extractStringArray(analysisData.dietaryRecommendations),
      seasonalDietPlan: {
        currentSeason: this.getCurrentSeason(),
        recommendations: this.extractStringArray(analysisData.seasonalAdjustments),
      },
      aiInsights: this.extractStringArray(
        analysisData.aiInsights || analysisData.personalizedGuidance
      ),
      analysisTimestamp: new Date().toISOString(),
    }
  }

  /**
   * 构建主要体质信息
   */
  private buildPrimaryConstitution(analysisData: Record<string, unknown>): TCMConstitution {
    const constitutionType = this.mapConstitutionType(analysisData.primaryConstitution as string)
    const primaryType = CONSTITUTION_TYPES[constitutionType]

    return {
      type: constitutionType,
      name: primaryType.name,
      characteristics:
        this.extractStringArray(analysisData.characteristics) || primaryType.characteristics,
      susceptibleDiseases:
        this.extractStringArray(analysisData.susceptibleDiseases) ||
        primaryType.susceptibleDiseases,
      dietaryRecommendations: this.extractStringArray(analysisData.dietaryRecommendations),
      lifestyleAdvice: this.extractStringArray(analysisData.lifestyleAdvice),
      seasonalAdjustments: {
        spring: [],
        summer: [],
        autumn: [],
        winter: this.extractStringArray(analysisData.seasonalAdjustments),
      },
      confidence: typeof analysisData.confidence === 'number' ? analysisData.confidence : 85,
    }
  }

  /**
   * 构建次要体质信息
   */
  private buildSecondaryConstitution(
    analysisData: Record<string, unknown>
  ): TCMConstitution | undefined {
    if (!analysisData.secondaryConstitution) {
      return undefined
    }

    const constitutionType = this.mapConstitutionType(analysisData.secondaryConstitution as string)
    const secondaryType = CONSTITUTION_TYPES[constitutionType]

    return {
      type: constitutionType,
      name: secondaryType.name,
      characteristics: secondaryType.characteristics,
      susceptibleDiseases: secondaryType.susceptibleDiseases,
      dietaryRecommendations: [],
      lifestyleAdvice: [],
      seasonalAdjustments: {
        spring: [],
        summer: [],
        autumn: [],
        winter: [],
      },
      confidence: 70,
    }
  }

  /**
   * 构建混合体质分析
   */
  private buildMixedAnalysis(
    primary: TCMConstitution,
    secondary?: TCMConstitution
  ): string | undefined {
    if (!secondary) {
      return undefined
    }

    return `检测到混合体质特征，主要表现为${primary.name}，兼有${secondary.name}特征`
  }

  /**
   * 提取字符串数组
   */
  private extractStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string')
    }
    return []
  }

  /**
   * 文本响应解析（备选方案）
   */
  private parseTextResponse(_text: string): Record<string, unknown> {
    return {
      primaryConstitution: '平和质',
      characteristics: ['体质分析正在处理中'],
      susceptibleDiseases: ['暂无特殊风险'],
      dietaryRecommendations: ['建议均衡饮食'],
      lifestyleAdvice: ['保持规律作息'],
      seasonalAdjustments: ['根据季节调整饮食'],
      personalizedGuidance: ['基于AI分析的个性化建议'],
      aiInsights: ['AI分析正在完善中'],
      confidence: 75,
    }
  }

  /**
   * 映射体质类型名称到系统标识
   */
  private mapConstitutionType(constitutionName: string): keyof typeof CONSTITUTION_TYPES {
    const mappings: Record<string, keyof typeof CONSTITUTION_TYPES> = {
      平和质: 'pinghe',
      气虚质: 'qixu',
      阳虚质: 'yangxu',
      阴虚质: 'yinxu',
      痰湿质: 'tanshi',
      湿热质: 'shire',
      血瘀质: 'xueyu',
      气郁质: 'qiyu',
      特禀质: 'tebing',
    }

    // 模糊匹配
    for (const [name, key] of Object.entries(mappings)) {
      if (constitutionName?.includes(name) || name.includes(constitutionName)) {
        return key
      }
    }

    return 'pinghe' // 默认返回平和质
  }

  /**
   * 计算综合健康评分
   */
  private calculateHealthScore(
    userProfile: ExtendedUserProfile,
    analysisData: Record<string, unknown>
  ): number {
    let score = 80 // 基础分

    // BMI评分
    const bmi = userProfile.weight / Math.pow(userProfile.height / 100, 2)
    if (bmi >= 18.5 && bmi < 24) score += 10
    else if (bmi >= 24 && bmi < 28) score -= 5
    else score -= 15

    // 年龄调整
    if (userProfile.age <= 30) score += 5
    else if (userProfile.age > 50) score -= 5

    // 健康状况调整
    if (userProfile.medicalConditions.length === 0) score += 10
    else score -= userProfile.medicalConditions.length * 3

    // 活动水平调整
    if (userProfile.activityLevel === 'veryActive') score += 10
    else if (userProfile.activityLevel === 'sedentary') score -= 10

    // AI分析可信度调整
    const confidence = typeof analysisData.confidence === 'number' ? analysisData.confidence : 85
    score = score * (confidence / 100)

    return Math.max(60, Math.min(100, Math.round(score)))
  }

  /**
   * 获取当前季节
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1
    if (month >= 3 && month <= 5) return '春季'
    if (month >= 6 && month <= 8) return '夏季'
    if (month >= 9 && month <= 11) return '秋季'
    return '冬季'
  }

  /**
   * 获取备用分析结果（AI服务失败时使用）
   */
  private getFallbackAnalysis(userProfile: ExtendedUserProfile): TCMAnalysisResult {
    // 简单的BMI基础判断
    const bmi = userProfile.weight / Math.pow(userProfile.height / 100, 2)
    let primaryType: keyof typeof CONSTITUTION_TYPES = 'pinghe'

    if (bmi > 28) primaryType = 'tanshi'
    else if (bmi < 18.5) primaryType = 'qixu'
    else if (
      userProfile.medicalConditions.some(
        condition => condition.includes('高血压') || condition.includes('糖尿病')
      )
    ) {
      primaryType = 'shire'
    }

    const constitutionInfo = CONSTITUTION_TYPES[primaryType]

    return {
      primaryConstitution: {
        type: primaryType,
        name: constitutionInfo.name,
        characteristics: constitutionInfo.characteristics,
        susceptibleDiseases: constitutionInfo.susceptibleDiseases,
        dietaryRecommendations:
          typeof constitutionInfo.dietaryPrinciples === 'string'
            ? [constitutionInfo.dietaryPrinciples]
            : constitutionInfo.dietaryPrinciples || [],
        lifestyleAdvice: ['保持规律作息', '适量运动', '心情愉悦'],
        seasonalAdjustments: {
          spring: ['多食新鲜蔬菜'],
          summer: ['清淡饮食'],
          autumn: ['润燥养肺'],
          winter: ['温补阳气'],
        },
        confidence: 75,
      },
      overallHealthScore: this.calculateHealthScore(userProfile, { confidence: 75 }),
      nutritionalGuidance: ['均衡饮食', '定时定量', '食物多样化'],
      seasonalDietPlan: {
        currentSeason: this.getCurrentSeason(),
        recommendations: ['根据季节特点调整饮食结构'],
      },
      aiInsights: ['基于基础数据的体质分析', '建议进一步详细评估'],
      analysisTimestamp: new Date().toISOString(),
    }
  }

  /**
   * 获取体质相关的营养建议
   */
  getConstitutionBasedNutritionAdvice(constitution: TCMConstitution): string[] {
    const nutritionAdvice: Record<string, string[]> = {
      pinghe: ['保持饮食均衡', '定时定量进餐', '食物搭配合理'],
      qixu: ['多食用益气食物如山药、大枣', '避免过度节食', '增加蛋白质摄入'],
      yangxu: ['多食温热食物', '避免生冷寒凉', '适量补充温阳食材如生姜、肉桂'],
      yinxu: ['多食滋阴润燥食物', '增加蔬果摄入', '避免辛辣燥热食物'],
      tanshi: ['控制总热量摄入', '减少油腻甜腻食物', '增加粗粮和蔬菜比例'],
      shire: ['清淡饮食为主', '多食清热利湿食物', '限制辛辣油炸食品'],
      xueyu: ['多食活血化瘀食物', '增加富含维生素E的食物', '避免过于寒凉的食物'],
      qiyu: ['疏肝理气食物', '保持饮食规律', '避免过量饮酒和刺激性食物'],
      tebing: ['避免过敏原食物', '饮食清淡易消化', '注意食物安全'],
    }

    return nutritionAdvice[constitution.type] || nutritionAdvice.pinghe
  }
}

export const tcmConstitutionService = new TCMConstitutionService()
