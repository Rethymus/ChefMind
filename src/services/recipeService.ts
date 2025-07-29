import type { Recipe, GenerateRecipeRequest, ApiResponse } from '@/types/recipe'
import { mockRecipeData } from '@/data/mockData'

class RecipeService {
  private baseURL = '/api'

  // 生成菜谱
  async generateRecipes(request: GenerateRecipeRequest): Promise<Recipe[]> {
    // 模拟API调用延迟
    await this.delay(2000)
    
    // 在实际项目中，这里会调用真实的AI API
    // const response = await fetch(`${this.baseURL}/recipes/generate`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(request)
    // })
    
    // 目前使用模拟数据
    return this.generateMockRecipes(request)
  }

  // 获取菜谱详情
  async getRecipeDetail(id: string): Promise<Recipe | null> {
    await this.delay(500)
    
    // 在实际项目中调用API
    // const response = await fetch(`${this.baseURL}/recipes/${id}`)
    // return response.json()
    
    // 模拟数据
    const recipe = mockRecipeData.recipes.find(r => r.id === id)
    return recipe || null
  }

  // 搜索菜谱
  async searchRecipes(query: string): Promise<Recipe[]> {
    await this.delay(800)
    
    // 模拟搜索
    return mockRecipeData.recipes.filter(recipe => 
      recipe.name.includes(query) || 
      recipe.description.includes(query) ||
      recipe.ingredients.some(ing => ing.name.includes(query))
    )
  }

  // 获取推荐菜谱
  async getRecommendedRecipes(limit = 6): Promise<Recipe[]> {
    await this.delay(600)
    
    return mockRecipeData.recipes.slice(0, limit)
  }

  // 生成模拟菜谱数据
  private generateMockRecipes(request: GenerateRecipeRequest): Recipe[] {
    const { ingredients, methods, constraints } = request
    const recipes: Recipe[] = []

    const recipeTemplates = [
      {
        nameTemplate: '家常炒{ingredient}',
        description: '简单易做的家常菜，营养丰富，口感鲜美',
        baseTime: 20,
        baseDifficulty: 2,
        baseNutrition: 4
      },
      {
        nameTemplate: '清蒸{ingredient}',
        description: '保持食材原味，营养不流失，清淡健康',
        baseTime: 25,
        baseDifficulty: 1,
        baseNutrition: 5
      },
      {
        nameTemplate: '{ingredient}汤',
        description: '营养丰富的汤品，温暖身心，适合全家享用',
        baseTime: 35,
        baseDifficulty: 2,
        baseNutrition: 4
      },
      {
        nameTemplate: '红烧{ingredient}',
        description: '色泽红亮，味道浓郁，下饭神器',
        baseTime: 30,
        baseDifficulty: 3,
        baseNutrition: 3
      }
    ]

    // 根据选择的方法生成对应数量的菜谱
    methods.slice(0, 4).forEach((method, index) => {
      const template = recipeTemplates[index] || recipeTemplates[0]
      const mainIngredient = ingredients[0] || '蔬菜'
      
      const recipe: Recipe = {
        id: `recipe-${Date.now()}-${index}`,
        name: template.nameTemplate.replace('{ingredient}', mainIngredient),
        description: template.description,
        ingredients: this.getRecipeIngredients(ingredients),
        method: mockRecipeData.cookingMethods.find(m => m.name === method) || mockRecipeData.cookingMethods[0],
        steps: this.generateCookingSteps(mainIngredient, method),
        time: this.calculateTime(template.baseTime, constraints.time),
        difficulty: this.calculateDifficulty(template.baseDifficulty, constraints.difficulty),
        nutrition: template.baseNutrition,
        servings: constraints.people || '2-3人',
        tags: [method, mainIngredient, '家常菜'],
        createdAt: new Date()
      }
      
      recipes.push(recipe)
    })

    return recipes
  }

  // 获取菜谱食材
  private getRecipeIngredients(selectedIngredients: string[]) {
    return selectedIngredients.slice(0, 6).map((name, index) => ({
      id: `ing-${index}`,
      name,
      category: this.categorizeIngredient(name) as any,
      selected: true
    }))
  }

  // 生成烹饪步骤
  private generateCookingSteps(ingredient: string, method: string) {
    const stepTemplates: Record<string, any[]> = {
      '炒': [
        { title: '准备食材', description: `将${ingredient}洗净切好，准备配菜和调料`, tips: '食材切得均匀一些，炒制时受热更均匀' },
        { title: '热锅下油', description: '锅内放油，加热至7成热', tips: '油温不要太高，避免炒糊' },
        { title: '下料炒制', description: `先下${ingredient}大火快炒2-3分钟`, tips: '大火快炒保持食材脆嫩' },
        { title: '调味出锅', description: '加入调料炒匀，即可出锅装盘', tips: '调料要适量，不要掩盖食材本味' }
      ],
      '蒸': [
        { title: '准备蒸具', description: '准备蒸锅，加水烧开', tips: '水量要充足，避免蒸制过程中缺水' },
        { title: '处理食材', description: `将${ingredient}洗净处理，摆放在蒸盘中`, tips: '摆放要整齐，便于受热均匀' },
        { title: '上锅蒸制', description: '大火蒸15-20分钟至熟透', tips: '中途不要开盖，避免影响蒸制效果' },
        { title: '调味装盘', description: '蒸好后淋上调料汁即可', tips: '趁热食用口感最佳' }
      ],
      '煮': [
        { title: '准备汤锅', description: '锅内加适量清水，大火烧开', tips: '水量要充足，根据食材量调整' },
        { title: '下料煮制', description: `将${ingredient}放入开水中煮制`, tips: '先下难熟的食材，再下易熟的' },
        { title: '调味煮透', description: '加入调料，继续煮至食材软烂', tips: '小火慢煮，保持汤汁清澈' },
        { title: '起锅装碗', description: '煮好后盛入碗中即可享用', tips: '可撒些葱花或香菜提味' }
      ]
    }

    const steps = stepTemplates[method] || stepTemplates['炒']
    return steps.map((step, index) => ({
      id: index + 1,
      ...step
    }))
  }

  // 计算烹饪时间
  private calculateTime(baseTime: number, timeConstraint: string | null): number {
    if (!timeConstraint) return baseTime
    
    const timeMap: Record<string, number> = {
      '15': 15,
      '30': 30,
      '60': 60,
      'unlimited': baseTime
    }
    
    const targetTime = timeMap[timeConstraint] || baseTime
    return Math.min(targetTime, baseTime + 10)
  }

  // 计算难度等级
  private calculateDifficulty(baseDifficulty: number, difficultyConstraint: string | null): number {
    if (!difficultyConstraint) return baseDifficulty
    
    const difficultyMap: Record<string, number> = {
      'easy': 1,
      'medium': 2,
      'hard': 3,
      'any': baseDifficulty
    }
    
    return difficultyMap[difficultyConstraint] || baseDifficulty
  }

  // 食材分类
  private categorizeIngredient(ingredient: string): string {
    const categories: Record<string, string[]> = {
      'vegetables': ['白菜', '萝卜', '土豆', '西红柿', '黄瓜', '茄子', '豆角', '青椒', '洋葱', '胡萝卜'],
      'meat': ['猪肉', '牛肉', '鸡肉', '羊肉', '鸭肉', '排骨', '鸡翅', '牛排'],
      'seafood': ['鱼', '虾', '蟹', '鱿鱼', '带鱼', '扇贝', '海带'],
      'staple': ['米饭', '面条', '饺子皮', '面包', '馒头', '年糕'],
      'seasoning': ['生抽', '老抽', '料酒', '醋', '糖', '盐', '蒜', '姜', '葱']
    }
    
    for (const [category, items] of Object.entries(categories)) {
      if (items.includes(ingredient)) {
        return category
      }
    }
    
    return 'vegetables'
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const recipeService = new RecipeService()