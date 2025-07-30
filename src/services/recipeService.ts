// ChefMind 智食谱 - 菜谱服务

import type { Recipe, GenerateRecipeRequest, Ingredient, CookingMethod } from '@/types/recipe'
import { mockRecipes, ingredientCategories, cookingMethods, nutritionDatabase } from '@/data/mockData'

class RecipeService {
  // private baseURL = '/api' // 暂时未使用

  // 生成菜谱
  async generateRecipes(request: GenerateRecipeRequest): Promise<Recipe[]> {
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 这里应该调用实际的AI API
      // 现在返回模拟数据
      return this.getMockRecipes(request)
    } catch (error) {
      console.error('生成菜谱失败:', error)
      throw new Error('生成菜谱失败，请稍后重试')
    }
  }

  // 获取菜谱详情
  async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const recipe = mockRecipes.find((r: Recipe) => r.id === id)
      return recipe || null
    } catch (error) {
      console.error('获取菜谱详情失败:', error)
      return null
    }
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
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 基于食材推荐菜谱
      return mockRecipes.filter((recipe: Recipe) =>
        recipe.ingredients.some((ing: Ingredient) => 
          ingredients.includes(ing.name)
        )
      )
    } catch (error) {
      console.error('获取推荐菜谱失败:', error)
      return []
    }
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
  private generateSteps(ingredients: string[], method: string): string[] {
    const baseSteps = [
      `准备${ingredients.join('、')}等食材`,
      '清洗并切好所有食材',
      `热锅下油，开始${method}制`,
      '调味并翻炒均匀',
      '装盘即可享用'
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