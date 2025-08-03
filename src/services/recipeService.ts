// ChefMind 智食谱 - 菜谱服务

import type { Recipe, CookingMethod, Ingredient, RecipeStep, RecipeFilters, RecipeSearchResult, RecipeGenerationRequest } from '@/types/recipe'
import { cookingMethods, ingredientCategories } from '@/data/mockData'
import { getCachedData, setCachedData } from '@/utils/apiCache'
import aiRecipeService from './aiRecipeService'
import glmService from './glmService'

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * 获取所有菜谱
 * @returns 菜谱列表
 */
export async function getAllRecipes(): Promise<Recipe[]> {
  const cacheKey = 'all_recipes';
  
  // 检查缓存
  const cachedRecipes = getCachedData<Recipe[]>(cacheKey);
  if (cachedRecipes && cachedRecipes.length > 0) {
    return cachedRecipes;
  }
  
  try {
    // 创建一个包含不同食材组合的请求数组
    const requests: RecipeGenerationRequest[] = [
      { 
        cuisine: '川菜', 
        ingredients: ['牛肉', '豆瓣酱', '花椒'],
        cookingMethod: '炒'
      },
      { 
        cuisine: '粤菜', 
        ingredients: ['虾', '姜', '葱'],
        cookingMethod: '蒸'
      },
      { 
        cuisine: '素食', 
        ingredients: ['豆腐', '木耳', '香菇'],
        cookingMethod: '煮'
      },
      { 
        cuisine: '汤类', 
        ingredients: ['排骨', '玉米', '胡萝卜'],
        cookingMethod: '炖'
      },
      { 
        cuisine: '甜点', 
        ingredients: ['糯米粉', '红豆', '椰汁'],
        cookingMethod: '蒸'
      }
    ];
    
    // 并行生成多个菜谱
    const recipesPromises = requests.map(request => 
      aiRecipeService.generateRecipe(request)
    );
    
    const recipes = await Promise.all(recipesPromises);
    
    // 缓存结果
    setCachedData(cacheKey, recipes, 24 * 60 * 60 * 1000); // 缓存24小时
    
    return recipes;
  } catch (error) {
    console.error('获取菜谱列表失败:', error);
    // 如果API调用失败，返回空数组
    return [];
  }
}

/**
 * 获取所有烹饪方式
 * @returns 烹饪方式列表
 */
export function getAllCookingMethods(): CookingMethod[] {
  return cookingMethods
}

/**
 * 获取所有食材
 * @returns 食材列表
 */
export function getAllIngredients(): Ingredient[] {
  return ingredientCategories.flatMap(category => category.items)
}

/**
 * 根据ID获取菜谱详情
 * @param id 菜谱ID
 * @returns 菜谱详情
 */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    // 检查缓存
    const cacheKey = `recipe_${id}`
    const cachedRecipe = getCachedData<Recipe>(cacheKey)
    if (cachedRecipe) {
      return cachedRecipe
    }

    // 获取所有菜谱并查找匹配的ID
    const allRecipes = await getAllRecipes()
    const recipe = allRecipes.find(r => r.id === id)
    
    if (!recipe) {
      return null
    }
    
    // 使用AI丰富菜谱内容
    const enrichedRecipe = await aiRecipeService.fullyEnhanceRecipe(recipe)
    
    
    // 缓存结果
    setCachedData(cacheKey, enrichedRecipe, 60 * 60 * 1000) // 缓存1小时
    
    return enrichedRecipe
  } catch (error) {
    console.error('获取菜谱详情失败:', error)
    return null
  }
}

/**
 * 根据食材和烹饪方式生成菜谱
 * @param ingredients 选择的食材列表
 * @param cookingMethod 选择的烹饪方式
 * @returns 生成的菜谱
 */
export async function generateRecipe(
  ingredients: Ingredient[],
  cookingMethod: CookingMethod
): Promise<Recipe> {
  // 直接使用AI菜谱服务
  return aiRecipeService.generateRecipeByIngredients(
    ingredients.map(ing => ing.name),
    { cookingMethod: cookingMethod.name }
  );
}

/**
 * 获取菜谱推荐
 * @param ingredients 基于的食材
 * @returns 推荐的菜谱列表
 */
export async function getRecipeRecommendations(ingredients: Ingredient[]): Promise<Recipe[]> {
  // 直接使用AI菜谱服务
  return aiRecipeService.generateRecipeRecommendations(
    { ingredients: ingredients.map(ing => ing.name) },
    3
  );
}

/**
 * 分析菜谱营养
 * @param recipe 要分析的菜谱
 * @returns 营养分析文本
 */
export async function analyzeRecipeNutrition(recipe: Recipe): Promise<string> {
  try {
    // 构建系统提示词
    const systemPrompt = `你是一位营养学专家，擅长分析食材和菜品的营养价值。请根据提供的菜谱信息，分析这道菜的营养价值，包括热量、蛋白质、碳水化合物、脂肪、维生素和矿物质等。
    请提供专业、科学的分析，避免夸大或不实的健康声明。`;

    // 构建用户提示词
    const userPrompt = `请分析这道名为"${recipe.name}"的菜品的营养价值。
    
    主要食材：${recipe.ingredients.map(ing => ing.name).join('、')}
    
    烹饪方式：${recipe.method.name}
    
    已知营养成分：热量 ${recipe.nutrition.calories}卡路里，蛋白质 ${recipe.nutrition.protein}克，碳水 ${recipe.nutrition.carbs}克，脂肪 ${recipe.nutrition.fat}克，膳食纤维 ${recipe.nutrition.fiber}克`;
    
    // 调用GLM API
    const response = await glmService.callGLM(userPrompt, {
      temperature: 0.7,
      maxTokens: 1024
    });
    
    return response;
  } catch (error) {
    console.error('分析菜谱营养失败:', error);
    return '无法获取营养分析信息';
  }
}

/**
 * 获取烹饪技巧
 * @param recipe 菜谱
 * @returns 烹饪技巧文本
 */
export async function getCookingTips(recipe: Recipe): Promise<string> {
  try {
    const enhancedRecipe = await aiRecipeService.generateCookingTips(recipe);
    return enhancedRecipe.cookingTips.join('\n\n');
  } catch (error) {
    console.error('获取烹饪技巧失败:', error);
    return '无法获取烹饪技巧';
  }
}

/**
 * 生成菜谱步骤的语音指导
 * @param step 菜谱步骤
 * @returns 语音指导文本
 */
export async function generateVoiceGuidance(step: RecipeStep): Promise<string> {
  try {
    // 构建系统提示词
    const systemPrompt = `你是一位专业的烹饪指导，擅长提供清晰、简洁的语音指导。请根据提供的菜谱步骤，生成适合语音播报的指导文本。
    语音指导应该简洁明了，使用口语化的表达，避免复杂的术语，并且包含必要的安全提醒和技巧。`;

    // 构建用户提示词
    const userPrompt = `请为以下烹饪步骤生成语音指导文本：
    
    步骤标题：${step.title}
    
    步骤描述：${step.description}
    
    ${step.tips ? `相关技巧：${step.tips}` : ''}`;
    
    // 调用GLM API
    const response = await glmService.callGLM(userPrompt, {
      temperature: 0.7,
      maxTokens: 512
    });
    
    return response;
  } catch (error) {
    console.error('生成语音指导失败:', error);
    return step.description;
  }
}

/**
 * 根据特定要求生成菜谱
 * @param request 菜谱生成请求
 * @returns 生成的菜谱
 */
export async function generateRecipeByRequest(request: RecipeGenerationRequest): Promise<Recipe> {
  // 直接使用AI菜谱服务
  return aiRecipeService.generateRecipe(request);
}

/**
 * 搜索菜谱
 * @param query 搜索关键词
 * @param filters 过滤条件
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 搜索结果
 */
export async function searchRecipes(
  query: string,
  filters: RecipeFilters = {},
  page: number = 1,
  pageSize: number = 10
): Promise<RecipeSearchResult> {
  // 生成缓存键
  const cacheKey = `search_${query}_${JSON.stringify(filters)}_${page}_${pageSize}`
  
  // 检查缓存
  const cachedResult = getCachedData<RecipeSearchResult>(cacheKey)
  if (cachedResult) {
    return cachedResult
  }
  
  try {
    // 如果有搜索关键词，使用AI搜索
    if (query) {
      return await searchRecipesWithAI(query, filters, page, pageSize)
    }
    
    // 否则使用本地过滤
    const allRecipes = await getAllRecipes()
    
    // 应用过滤器
    let filteredRecipes = allRecipes
    
    if (filters.cookingMethod) {
      filteredRecipes = filteredRecipes.filter(r => r.method.name === filters.cookingMethod)
    }
    
    if (filters.difficulty) {
      filteredRecipes = filteredRecipes.filter(r => r.difficulty <= filters.difficulty!)
    }
    
    if (filters.cookingTime) {
      filteredRecipes = filteredRecipes.filter(r => r.cookingTime <= filters.cookingTime!)
    }
    
    if (filters.ingredients && filters.ingredients.length > 0) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        filters.ingredients!.every(ingredient => 
          recipe.ingredients.some(i => i.name.includes(ingredient))
        )
      )
    }
    
    if (filters.tags && filters.tags.length > 0) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        filters.tags!.some(tag => recipe.tags.includes(tag))
      )
    }
    
    if (filters.cuisine) {
      filteredRecipes = filteredRecipes.filter(r => r.cuisine === filters.cuisine)
    }
    
    // 分页
    const total = filteredRecipes.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedRecipes = filteredRecipes.slice(start, end)
    
    const result: RecipeSearchResult = {
      recipes: paginatedRecipes,
      total,
      page,
      pageSize,
      filters
    }
    
    // 缓存结果
    setCachedData(cacheKey, result, 60 * 60 * 1000) // 缓存1小时
    
    return result
  } catch (error) {
    console.error('搜索菜谱失败:', error)
    // 如果搜索失败，返回空结果
    return {
      recipes: [],
      total: 0,
      page,
      pageSize,
      filters
    }
  }
}

/**
 * 使用AI搜索菜谱
 * @param query 搜索关键词
 * @param filters 过滤条件
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 搜索结果
 */
async function searchRecipesWithAI(
  query: string,
  filters: RecipeFilters = {},
  page: number = 1,
  pageSize: number = 10
): Promise<RecipeSearchResult> {
  try {
    // 构建提示词
    let prompt = `请根据以下搜索条件，生成${pageSize}道符合要求的菜谱：
搜索关键词: ${query}\n`
    
    if (filters.cookingMethod) {
      prompt += `烹饪方式: ${filters.cookingMethod}\n`
    }
    
    if (filters.difficulty) {
      prompt += `最大难度: ${filters.difficulty}级\n`
    }
    
    if (filters.cookingTime) {
      prompt += `最大烹饪时间: ${filters.cookingTime}分钟\n`
    }
    
    if (filters.ingredients && filters.ingredients.length > 0) {
      prompt += `必须包含的食材: ${filters.ingredients.join('、')}\n`
    }
    
    if (filters.tags && filters.tags.length > 0) {
      prompt += `相关标签: ${filters.tags.join('、')}\n`
    }
    
    if (filters.cuisine) {
      prompt += `菜系: ${filters.cuisine}\n`
    }
    
    prompt += `\n请按照以下JSON格式返回菜谱数据，不要有任何其他内容:
[
  {
    "name": "菜谱名称",
    "description": "菜谱简短描述",
    "cookingMethod": "烹饪方式",
    "ingredients": [
      {"name": "食材名称", "amount": "用量", "unit": "单位"}
    ],
    "steps": [
      {"title": "步骤标题", "description": "步骤详细描述", "tips": "烹饪技巧"}
    ],
    "cookingTime": 烹饪时间(分钟),
    "difficulty": 难度(1-5),
    "servings": 份数,
    "nutrition": {
      "calories": 卡路里,
      "protein": 蛋白质(克),
      "carbs": 碳水化合物(克),
      "fat": 脂肪(克),
      "fiber": 纤维(克)
    },
    "tags": ["标签1", "标签2"]
  }
]`

    // 调用GLM API
    const response = await glmService.callGLM(prompt, {
      temperature: 0.7,
      maxTokens: 4096
    })
    
    try {
      // 解析JSON响应
      const jsonData = glmService.parseJsonResponse<any[]>(response)
      
      // 构建Recipe对象数组
      const recipes: Recipe[] = jsonData.map((item: any) => {
        // 查找匹配的烹饪方法
        const method = cookingMethods.find(m => m.name === item.cookingMethod) || cookingMethods[0]
        
        return {
          id: generateId(),
          name: item.name,
          description: item.description,
          ingredients: item.ingredients.map((ing: any, index: number) => ({
            id: index + 4000, // 使用大数字避免与现有ID冲突
            name: ing.name,
            category: 'ai_generated',
            amount: ing.amount,
            unit: ing.unit
          })),
          method,
          steps: item.steps.map((step: any, index: number) => ({
            id: index + 1,
            title: step.title,
            description: step.description,
            tips: step.tips
          })),
          cookingTime: item.cookingTime || method.time,
          difficulty: item.difficulty || method.difficulty,
          servings: item.servings || 2,
          nutrition: item.nutrition || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
          },
          tags: item.tags || [],
          cuisine: filters.cuisine,
          createdAt: new Date(),
          aiGenerated: true,
          originalGLMResponse: response // 保存原始响应用于调试
        }
      })
      
      // 构建搜索结果
      const result: RecipeSearchResult = {
        recipes,
        total: recipes.length, // AI生成的结果总数就是返回的数量
        page,
        pageSize,
        filters
      }
      
      return result
    } catch (error) {
      console.error('解析AI生成的搜索结果失败:', error)
      throw new Error('搜索菜谱失败，请重试')
    }
  } catch (error) {
    console.error('使用AI搜索菜谱失败:', error)
    throw new Error('搜索菜谱失败，请重试')
  }
}

export default {
  searchRecipes,
  getAllRecipes,
  getAllCookingMethods,
  getAllIngredients,
  getRecipeById,
  generateRecipe,
  getRecipeRecommendations,
  analyzeRecipeNutrition,
  getCookingTips,
  generateVoiceGuidance,
  generateRecipeByRequest
}
