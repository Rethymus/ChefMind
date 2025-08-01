// ChefMind 智食谱 - 菜谱服务

import type { Recipe, GenerateRecipeRequest, Ingredient, CookingMethod, RecipeStep } from '@/types/recipe'
import { mockRecipes, ingredientCategories, cookingMethods, nutritionDatabase } from '@/data/mockData'
import { glmService } from './glmService'
// import { globalNotification } from '@/composables/useNotification' // 暂时未使用

class RecipeService {
  // private baseURL = '/api' // 暂时未使用

  // 检查GLM API是否可用
  private isGLMAvailable(): boolean {
    return !!import.meta.env.VITE_GLM_API_KEY
  }

  // 生成菜谱（主要方法）
  async generateRecipes(request: GenerateRecipeRequest): Promise<Recipe[]> {
    try {
      console.log('开始生成菜谱，请求参数:', request)
      
      // 优先使用GLM API
      if (this.isGLMAvailable()) {
        console.log('使用GLM API生成菜谱')
        return await this.generateRecipesWithGLM(request)
      } else {
        console.warn('GLM API不可用，使用模拟数据')
        return this.getMockRecipes(request)
      }
    } catch (error) {
      console.error('GLM生成菜谱失败，降级到模拟数据:', error)
      return this.getMockRecipes(request)
    }
  }

  // 使用GLM生成菜谱
  private async generateRecipesWithGLM(request: GenerateRecipeRequest): Promise<Recipe[]> {
    const { ingredients, constraints } = request
    // const methods = request.methods // 暂时未使用
    
    // 构建约束条件描述
    const constraintTexts: string[] = []
    if (constraints.cookingTime) {
      constraintTexts.push(`烹饪时间不超过${constraints.cookingTime}分钟`)
    }
    if (constraints.difficulty) {
      const difficultyMap = { 1: '简单', 2: '中等', 3: '困难' }
      constraintTexts.push(`难度等级：${difficultyMap[constraints.difficulty as keyof typeof difficultyMap]}`)
    }
    if (constraints.servings) {
      constraintTexts.push(`${constraints.servings}人份`)
    }
    if (constraints.dietaryRestrictions?.length) {
      constraintTexts.push(`饮食限制：${constraints.dietaryRestrictions.join('、')}`)
    }
    if (constraints.excludeIngredients?.length) {
      constraintTexts.push(`不使用：${constraints.excludeIngredients.join('、')}`)
    }

    // 调用GLM API生成菜谱
    const glmResponse = await glmService.generateRecipeSuggestion(ingredients, constraintTexts)
    
    // 解析GLM响应并转换为Recipe对象
    return this.parseGLMResponse(glmResponse, request)
  }

  // 搜索菜谱
  async searchRecipes(query: string): Promise<Recipe[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      return mockRecipes.filter((recipe: Recipe) =>
        recipe.name.includes(query) ||
        recipe.description.includes(query) ||
        recipe.ingredients.some((ing: Ingredient) => ing.name.includes(query))
      )
    } catch (error) {
      console.error('搜索菜谱失败:', error)
      return []
    }
  }

  // 保存菜谱
  async saveRecipe(recipe: Recipe): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 这里应该调用实际的API保存到数据库
      console.log('保存菜谱:', recipe)
      return true
    } catch (error) {
      console.error('保存菜谱失败:', error)
      return false
    }
  }

  // 获取用户收藏的菜谱
  async getFavoriteRecipes(): Promise<Recipe[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 返回模拟的收藏菜谱
      return mockRecipes.slice(0, 2)
    } catch (error) {
      console.error('获取收藏菜谱失败:', error)
      return []
    }
  }

  // 获取推荐菜谱
  async getRecommendedRecipes(ingredients: string[]): Promise<Recipe[]> {
    try {
      if (this.isGLMAvailable()) {
        // 使用GLM API生成推荐
        const currentRecipe = `使用${ingredients.join('、')}的菜谱`
        const recommendation = await glmService.recommendSimilarRecipes(currentRecipe)
        return this.parseGLMRecommendation(recommendation, ingredients)
      } else {
        await new Promise(resolve => setTimeout(resolve, 500))
        // 基于食材推荐菜谱
        return mockRecipes.filter((recipe: Recipe) =>
          recipe.ingredients.some((ing: Ingredient) => 
            ingredients.includes(ing.name)
          )
        )
      }
    } catch (error) {
      console.error('获取推荐菜谱失败:', error)
      return []
    }
  }

  // 分析菜谱营养

  // 解析GLM响应
  private parseGLMResponse(glmResponse: string, request: GenerateRecipeRequest): Recipe[] {
    try {
      // 这里需要解析GLM的文本响应并转换为结构化的Recipe对象
      // 由于GLM返回的是文本，我们需要进行智能解析
      const recipes: Recipe[] = []
      
      // 简单的解析逻辑（实际项目中可能需要更复杂的NLP处理）
      const sections = glmResponse.split(/\n\s*\n/)
      let currentRecipe: Partial<Recipe> = {}
      
      for (const section of sections) {
        if (section.includes('菜品名称') || section.includes('菜名')) {
          if (currentRecipe.name) {
            // 保存当前菜谱并开始新的
            recipes.push(this.completeRecipeFromGLM(currentRecipe, request))
            currentRecipe = {}
          }
          currentRecipe.name = this.extractRecipeName(section)
        } else if (section.includes('制作步骤') || section.includes('步骤')) {
          currentRecipe.steps = this.extractSteps(section)
        } else if (section.includes('烹饪时间') || section.includes('时间')) {
          currentRecipe.cookingTime = this.extractCookingTime(section)
        }
      }
      
      // 保存最后一个菜谱
      if (currentRecipe.name) {
        recipes.push(this.completeRecipeFromGLM(currentRecipe, request))
      }
      
      // 如果解析失败，生成一个基于GLM响应的通用菜谱
      if (recipes.length === 0) {
        recipes.push(this.createRecipeFromGLMText(glmResponse, request))
      }
      
      return recipes.slice(0, 3) // 最多返回3个菜谱
    } catch (error) {
      console.error('解析GLM响应失败:', error)
      // 降级处理
      return [this.createRecipeFromGLMText(glmResponse, request)]
    }
  }

  // 从GLM文本创建菜谱
  private createRecipeFromGLMText(glmText: string, request: GenerateRecipeRequest): Recipe {
    const { ingredients, methods, constraints } = request
    
    return {
      id: `glm_${Date.now()}`,
      name: `AI推荐：${ingredients[0]}${methods[0] || '料理'}`,
      description: glmText.substring(0, 100) + '...',
      ingredients: this.getRecipeIngredients(ingredients),
      method: cookingMethods.find(m => m.name === methods[0]) || cookingMethods[0],
      steps: this.extractStepsFromText(glmText),
      cookingTime: constraints.cookingTime || this.extractCookingTimeFromText(glmText) || 30,
      difficulty: constraints.difficulty || 2,
      servings: constraints.servings || 2,
      nutrition: this.calculateNutrition(ingredients),
      tags: ['AI生成', 'GLM推荐'],
      createdAt: new Date(),
      aiGenerated: true,
      originalGLMResponse: glmText
    }
  }

  // 完善从GLM解析的菜谱
  private completeRecipeFromGLM(partial: Partial<Recipe>, request: GenerateRecipeRequest): Recipe {
    const { ingredients, methods, constraints } = request
    
    return {
      id: `glm_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name: partial.name || `${ingredients[0]}${methods[0] || '料理'}`,
      description: `使用GLM AI生成的${partial.name || '美味菜谱'}`,
      ingredients: this.getRecipeIngredients(ingredients),
      method: cookingMethods.find(m => m.name === methods[0]) || cookingMethods[0],
      steps: partial.steps || this.generateSteps(ingredients, methods[0] || '炒'),
      cookingTime: partial.cookingTime || constraints.cookingTime || 30,
      difficulty: constraints.difficulty || 2,
      servings: constraints.servings || 2,
      nutrition: this.calculateNutrition(ingredients),
      tags: ['AI生成', 'GLM推荐'],
      createdAt: new Date(),
      aiGenerated: true
    }
  }

  // 解析菜谱名称
  private extractRecipeName(text: string): string {
    const nameRegex = /(?:菜品名称|菜名)[：:]\s*(.+)/i
    const match = nameRegex.exec(text)
    return match ? match[1].trim() : '美味料理'
  }

  // 解析制作步骤
  private extractSteps(text: string): RecipeStep[] {
    const steps: RecipeStep[] = []
    const lines = text.split('\n')
    
    let stepIndex = 1
    const stepRegex = /^\d+[.、]/
    const replaceRegex = /^\d+[.、]\s*/
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && (stepRegex.exec(trimmed) || trimmed.includes('步骤'))) {
        const description = trimmed.replace(replaceRegex, '')
        steps.push({
          id: stepIndex,
          title: `步骤${stepIndex}`,
          description,
          tips: ''
        })
        stepIndex++
      }
    }
    
    return steps.length > 0 ? steps : [{
      id: 1,
      title: '制作',
      description: '按照传统方法制作',
      tips: ''
    }]
  }

  // 从文本中提取步骤
  private extractStepsFromText(text: string): RecipeStep[] {
    const sentences = text.split(/[。！？\n]/).filter(s => s.trim().length > 5)
    return sentences.slice(0, 6).map((s, index) => ({
      id: index + 1,
      title: `步骤${index + 1}`,
      description: s.trim(),
      tips: ''
    }))
  }

  // 解析烹饪时间
  private extractCookingTime(text: string): number {
    const timeRegex = /(\d+)\s*分钟/
    const match = timeRegex.exec(text)
    return match ? parseInt(match[1]) : 30
  }

  // 从文本中提取烹饪时间
  private extractCookingTimeFromText(text: string): number | null {
    const timeRegex = /(\d+)\s*分钟/
    const match = timeRegex.exec(text)
    return match ? parseInt(match[1]) : null
  }

  // 解析GLM推荐响应
  private parseGLMRecommendation(recommendation: string, ingredients: string[]): Recipe[] {
    const recipes: Recipe[] = []
    const splitRegex = /\d+[.、]/
    const sections = recommendation.split(splitRegex).filter(s => s.trim())
    
    sections.forEach((section, index) => {
      if (section.trim()) {
        const recipe: Recipe = {
          id: `glm_rec_${Date.now()}_${index}`,
          name: this.extractRecipeNameFromRecommendation(section),
          description: section.substring(0, 100) + '...',
          ingredients: this.getRecipeIngredients(ingredients),
          method: cookingMethods[index % cookingMethods.length],
          steps: this.extractStepsFromText(section),
          cookingTime: 30,
          difficulty: 2,
          servings: 2,
          nutrition: this.calculateNutrition(ingredients),
          tags: ['AI推荐', 'GLM生成'],
          createdAt: new Date(),
          aiGenerated: true
        }
        recipes.push(recipe)
      }
    })
    
    return recipes.slice(0, 3)
  }

  // 从推荐文本中提取菜谱名称
  private extractRecipeNameFromRecommendation(text: string): string {
    const lines = text.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.includes('推荐理由') && !trimmed.includes('制作说明')) {
        return trimmed.length > 20 ? trimmed.substring(0, 20) : trimmed
      }
    }
    return '推荐菜谱'
  }

  // 分析菜谱营养
  async analyzeRecipeNutrition(recipe: Recipe): Promise<string> {
    try {
      if (this.isGLMAvailable()) {
        const recipeText = `
菜谱名称：${recipe.name}
食材：${recipe.ingredients.map(ing => `${ing.name} ${ing.amount}`).join('、')}
制作步骤：${recipe.steps.map(step => step.description).join('；')}
        `
        return await glmService.analyzeNutrition(recipeText)
      } else {
        return this.getMockNutritionAnalysis(recipe)
      }
    } catch (error) {
      console.error('营养分析失败:', error)
      return this.getMockNutritionAnalysis(recipe)
    }
  }

  // 模拟营养分析
  private getMockNutritionAnalysis(recipe: Recipe): string {
    return `
营养分析：
• 热量：约${recipe.nutrition.calories}千卡
• 蛋白质：${recipe.nutrition.protein}g
• 碳水化合物：${recipe.nutrition.carbs}g
• 脂肪：${recipe.nutrition.fat}g
• 膳食纤维：${recipe.nutrition.fiber}g

健康建议：这道菜营养均衡，适合日常食用。建议搭配蔬菜和水果，保持饮食多样性。
    `
  }

  // 生成模拟菜谱数据
  private getMockRecipes(request: GenerateRecipeRequest): Recipe[] {
    const { ingredients, methods, constraints } = request
    
    // 基于请求参数生成模拟菜谱
    const recipes: Recipe[] = []
    
    for (let i = 0; i < Math.min(3, ingredients.length); i++) {
      const recipe: Recipe = {
        id: `generated_${Date.now()}_${i}`,
        name: `${ingredients[i]}${methods[0] || '炒'}`,
        description: `使用${ingredients.join('、')}制作的美味菜肴`,
        ingredients: this.getRecipeIngredients(ingredients),
        method: cookingMethods.find((m: CookingMethod) => m.name === methods[0]) || cookingMethods[0],
        steps: this.generateSteps(ingredients, methods[0] || '炒'),
        cookingTime: constraints.cookingTime || 30,
        difficulty: constraints.difficulty || 2,
        servings: constraints.servings || 2,
        nutrition: this.calculateNutrition(ingredients),
        tags: ['AI生成', '个性化'],
        createdAt: new Date()
      }
      
      recipes.push(recipe)
    }
    
    return recipes
  }

  // 获取菜谱食材
  private getRecipeIngredients(ingredientNames: string[]): Ingredient[] {
    const allIngredients = ingredientCategories.flatMap(cat => cat.items)
    
    return ingredientNames.map((name: string) => {
      const ingredient = allIngredients.find((ing: Ingredient) => ing.name === name)
      return {
        id: ingredient?.id || Math.floor(Math.random() * 1000),
        name: name,
        category: ingredient?.category || 'vegetables',
        amount: '适量',
        unit: '份'
      } as Ingredient
    })
  }

  // 生成烹饪步骤
  private generateSteps(ingredients: string[], method: string): RecipeStep[] {
    const baseSteps = [
      { id: 1, title: '准备食材', description: `准备${ingredients.join('、')}等食材`, tips: '食材要新鲜' },
      { id: 2, title: '处理食材', description: '清洗并切好所有食材', tips: '切法要均匀' },
      { id: 3, title: '开始烹饪', description: `热锅下油，开始${method}制`, tips: '火候要掌握好' },
      { id: 4, title: '调味', description: '调味并翻炒均匀', tips: '调味要适量' },
      { id: 5, title: '完成', description: '装盘即可享用', tips: '趁热享用最佳' }
    ]
    
    return baseSteps
  }

  // 计算营养信息
  private calculateNutrition(ingredients: string[]) {
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0
    let totalFiber = 0

    ingredients.forEach((ingredient: string) => {
      const nutrition = nutritionDatabase[ingredient]
      if (nutrition) {
        totalCalories += nutrition.calories
        totalProtein += nutrition.protein
        totalCarbs += nutrition.carbs
        totalFat += nutrition.fat
        totalFiber += nutrition.fiber
      }
    })

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      fiber: Math.round(totalFiber * 10) / 10
    }
  }
}

// 导出单例实例
export const recipeService = new RecipeService()
export default recipeService