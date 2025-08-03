// ChefMind 智食谱 - AI菜谱服务

import glmService from './glmService';
import { generateId, generateUUID } from '../utils/idGenerator';
import { cookingMethods } from '../data/cookingMethods';
import { cacheData, getCachedData } from '../utils/cacheUtils';
import type { 
  Recipe, 
  RecipeGenerationRequest, 
  Ingredient, 
  RecipeStep, 
  NutritionInfo,
  UserPreference,
  HealthConstraint,
  RecipeFilters,
  RecipeSearchResult
} from '../types/recipe';

/**
 * 通过AI生成菜谱
 * @param request 菜谱生成请求
 * @returns 生成的菜谱
 */
export async function generateRecipe(request: RecipeGenerationRequest): Promise<Recipe> {
  try {
    // 构建系统提示词
    const systemPrompt = `你是一位专业的中餐厨师，精通各种菜系和烹饪技巧。请根据用户提供的要求，创建一道详细的菜谱。
    返回的菜谱必须是JSON格式，包含以下字段：
    - name: 菜名
    - description: 菜品描述
    - ingredients: 食材列表，每项包含name(名称)、amount(用量)、unit(单位)
    - steps: 步骤列表，每项包含title(标题)、description(详细说明)、tips(小贴士，可选)
    - cookingTime: 烹饪时间(分钟)
    - difficulty: 难度(1-5)
    - servings: 份数
    - nutrition: 营养信息，包含calories(卡路里)、protein(蛋白质,克)、carbs(碳水,克)、fat(脂肪,克)、fiber(纤维,克)
    - tags: 标签列表
    - cuisine: 菜系
    - cookingTips: 烹饪技巧列表
    - healthBenefits: 健康益处列表
    
    请确保返回的是有效的JSON格式，不要包含任何额外的文本说明。`;

    // 构建用户提示词
    let userPrompt = '请创建一道';
    
    // 添加菜系
    if (request.cuisine) {
      userPrompt += `${request.cuisine}`;
    }
    
    // 添加餐点类型
    if (request.mealType) {
      userPrompt += `${request.mealType}`;
    }
    
    // 添加烹饪方式
    if (request.cookingMethod) {
      userPrompt += `，使用${request.cookingMethod}的烹饪方式`;
    }
    
    // 添加食材
    if (request.ingredients && request.ingredients.length > 0) {
      userPrompt += `，使用以下食材：${request.ingredients.join('、')}`;
    }
    
    // 添加饮食限制
    if (request.dietaryRestrictions && request.dietaryRestrictions.length > 0) {
      userPrompt += `，需要符合以下饮食限制：${request.dietaryRestrictions.join('、')}`;
    }
    
    // 添加用户偏好
    if (request.preferences) {
      const { flavors, ingredients, cuisines, dietaryHabits, dislikedIngredients } = request.preferences;
      
      if (flavors && flavors.length > 0) {
        userPrompt += `，口味偏好：${flavors.join('、')}`;
      }
      
      if (ingredients && ingredients.length > 0) {
        userPrompt += `，喜欢的食材：${ingredients.join('、')}`;
      }
      
      if (dislikedIngredients && dislikedIngredients.length > 0) {
        userPrompt += `，不喜欢的食材：${dislikedIngredients.join('、')}`;
      }
      
      if (dietaryHabits && dietaryHabits.length > 0) {
        userPrompt += `，饮食习惯：${dietaryHabits.join('、')}`;
      }
    }
    
    // 添加健康约束
    if (request.constraints && request.constraints.length > 0) {
      const constraintDescriptions = request.constraints.map(c => c.description);
      userPrompt += `，需要考虑以下健康约束：${constraintDescriptions.join('、')}`;
    }
    
    // 添加难度要求
    if (request.difficulty) {
      userPrompt += `，难度级别：${request.difficulty}（1-5）`;
    }
    
    // 添加烹饪时间要求
    if (request.cookingTime) {
      userPrompt += `，烹饪时间不超过${request.cookingTime}分钟`;
    }
    
    // 添加份数
    if (request.servings) {
      userPrompt += `，${request.servings}人份`;
    }
    
    userPrompt += '。请返回完整的菜谱JSON数据。';
    
    console.log('生成菜谱的提示词:', userPrompt);
    
    // 调用GLM API
    const response = await glmService.callGLM(userPrompt, {
      temperature: 0.7,
      maxTokens: 4096,
      systemPrompt
    });
    
    console.log('GLM API响应:', response);
    
    // 解析JSON响应
    const recipeData = glmService.parseJsonResponse<any>(response);
    
    // 转换为Recipe对象
    const recipe: Recipe = {
      id: generateUUID(),
      name: recipeData.name || '未命名菜谱',
      description: recipeData.description || '',
      ingredients: recipeData.ingredients?.map((ing: any, index: number) => ({
        id: index + 1,
        name: ing.name,
        category: ing.category || '其他',
        amount: ing.amount,
        unit: ing.unit
      })) || [],
      method: findCookingMethod(request.cookingMethod) || cookingMethods[0],
      steps: recipeData.steps?.map((step: any, index: number) => ({
        id: index + 1,
        title: step.title || `步骤 ${index + 1}`,
        description: step.description,
        tips: step.tips
      })) || [],
      cookingTime: recipeData.cookingTime || 30,
      difficulty: recipeData.difficulty || 3,
      servings: recipeData.servings || request.servings || 2,
      nutrition: recipeData.nutrition || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      },
      tags: recipeData.tags || [],
      createdAt: new Date(),
      cuisine: recipeData.cuisine || request.cuisine || '',
      cookingTips: recipeData.cookingTips || [],
      healthBenefits: recipeData.healthBenefits || [],
      aiGenerated: true,
      originalGLMResponse: response
    };
    
    // 缓存生成的菜谱
    cacheData(`recipe_${recipe.id}`, recipe, 3600 * 24); // 缓存24小时
    
    return recipe;
  } catch (error) {
    console.error('生成菜谱失败:', error);
    throw new Error(`生成菜谱失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 批量生成菜谱
 * @param requests 菜谱生成请求数组
 * @returns 生成的菜谱数组
 */
export async function batchGenerateRecipes(requests: RecipeGenerationRequest[]): Promise<Recipe[]> {
  try {
    // 限制并发请求数量
    const concurrency = 2;
    const results: Recipe[] = [];
    
    // 分批处理请求
    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);
      const promises = batch.map(request => generateRecipe(request));
      
      // 等待当前批次的所有请求完成
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
      
      // 如果还有更多批次，添加延迟以避免API限流
      if (i + concurrency < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  } catch (error) {
    console.error('批量生成菜谱失败:', error);
    throw new Error(`批量生成菜谱失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 根据食材生成菜谱
 * @param ingredients 食材列表
 * @param options 其他选项
 * @returns 生成的菜谱
 */
export async function generateRecipeByIngredients(
  ingredients: string[],
  options: {
    cuisine?: string;
    cookingMethod?: string;
    difficulty?: number;
    cookingTime?: number;
    preferences?: UserPreference;
    constraints?: HealthConstraint[];
  } = {}
): Promise<Recipe> {
  const request: RecipeGenerationRequest = {
    ingredients,
    cuisine: options.cuisine,
    cookingMethod: options.cookingMethod,
    difficulty: options.difficulty,
    cookingTime: options.cookingTime,
    preferences: options.preferences,
    constraints: options.constraints
  };
  
  return generateRecipe(request);
}

/**
 * 根据用户偏好生成菜谱推荐
 * @param preferences 用户偏好
 * @param count 推荐数量
 * @returns 推荐的菜谱列表
 */
export async function generateRecipeRecommendations(
  preferences: UserPreference,
  count: number = 3
): Promise<Recipe[]> {
  try {
    const requests: RecipeGenerationRequest[] = [];
    
    // 根据用户偏好创建多个不同的菜谱生成请求
    for (let i = 0; i < count; i++) {
      // 随机选择一些用户偏好的元素，以增加多样性
      const request: RecipeGenerationRequest = {
        preferences: { ...preferences },
      };
      
      // 随机选择一种烹饪方式
      if (Math.random() > 0.5 && preferences.cuisines && preferences.cuisines.length > 0) {
        const randomIndex = Math.floor(Math.random() * preferences.cuisines.length);
        request.cuisine = preferences.cuisines[randomIndex];
      }
      
      // 随机设置难度
      request.difficulty = Math.floor(Math.random() * 3) + 2; // 2-4之间的难度
      
      requests.push(request);
    }
    
    return batchGenerateRecipes(requests);
  } catch (error) {
    console.error('生成菜谱推荐失败:', error);
    throw new Error(`生成菜谱推荐失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 根据健康约束生成适合的菜谱
 * @param constraints 健康约束条件
 * @returns 生成的菜谱
 */
export async function generateHealthyRecipe(constraints: HealthConstraint[]): Promise<Recipe> {
  const request: RecipeGenerationRequest = {
    constraints,
    dietaryRestrictions: constraints.map(c => c.type)
  };
  
  return generateRecipe(request);
}

/**
 * 根据菜谱ID获取菜谱
 * @param id 菜谱ID
 * @returns 菜谱对象，如果不存在则返回null
 */
export function getRecipeById(id: string): Recipe | null {
  return getCachedData<Recipe>(`recipe_${id}`);
}

/**
 * 根据烹饪方式名称查找烹饪方式对象
 * @param methodName 烹饪方式名称
 * @returns 烹饪方式对象，如果不存在则返回undefined
 */
function findCookingMethod(methodName?: string) {
  if (!methodName) return undefined;
  return cookingMethods.find(method => method.name === methodName);
}

/**
 * 搜索菜谱
 * @param query 搜索关键词
 * @param filters 过滤条件
 * @returns 搜索结果
 */
export async function searchRecipes(
  query: string,
  filters?: RecipeFilters
): Promise<RecipeSearchResult> {
  try {
    // 构建系统提示词
    const systemPrompt = `你是一位专业的中餐厨师，精通各种菜系和烹饪技巧。请根据用户的搜索关键词和过滤条件，生成3道符合条件的菜谱。
    返回的结果必须是JSON格式的数组，每个菜谱包含以下字段：
    - name: 菜名
    - description: 菜品描述
    - ingredients: 食材列表，每项包含name(名称)、amount(用量)、unit(单位)
    - steps: 步骤列表，每项包含title(标题)、description(详细说明)、tips(小贴士，可选)
    - cookingTime: 烹饪时间(分钟)
    - difficulty: 难度(1-5)
    - servings: 份数
    - nutrition: 营养信息，包含calories(卡路里)、protein(蛋白质,克)、carbs(碳水,克)、fat(脂肪,克)、fiber(纤维,克)
    - tags: 标签列表
    - cuisine: 菜系
    - cookingTips: 烹饪技巧列表
    - healthBenefits: 健康益处列表
    
    请确保返回的是有效的JSON格式数组，不要包含任何额外的文本说明。`;

    // 构建用户提示词
    let userPrompt = `请搜索与"${query}"相关的菜谱`;
    
    if (filters) {
      // 添加烹饪方式过滤
      if (filters.cookingMethod) {
        userPrompt += `，烹饪方式为${filters.cookingMethod}`;
      }
      
      // 添加难度过滤
      if (filters.difficulty) {
        userPrompt += `，难度级别为${filters.difficulty}`;
      }
      
      // 添加烹饪时间过滤
      if (filters.cookingTime) {
        userPrompt += `，烹饪时间不超过${filters.cookingTime}分钟`;
      }
      
      // 添加食材过滤
      if (filters.ingredients && filters.ingredients.length > 0) {
        userPrompt += `，包含以下食材：${filters.ingredients.join('、')}`;
      }
      
      // 添加排除食材过滤
      if (filters.excludeIngredients && filters.excludeIngredients.length > 0) {
        userPrompt += `，不包含以下食材：${filters.excludeIngredients.join('、')}`;
      }
      
      // 添加标签过滤
      if (filters.tags && filters.tags.length > 0) {
        userPrompt += `，包含以下标签：${filters.tags.join('、')}`;
      }
      
      // 添加菜系过滤
      if (filters.cuisine) {
        userPrompt += `，菜系为${filters.cuisine}`;
      }
      
      // 添加餐点类型过滤
      if (filters.mealType) {
        userPrompt += `，适合${filters.mealType}`;
      }
    }
    
    userPrompt += '。请返回3道符合条件的菜谱，以JSON数组格式返回。';
    
    console.log('搜索菜谱的提示词:', userPrompt);
    
    // 调用GLM API
    const response = await glmService.callGLM(userPrompt, {
      temperature: 0.7,
      maxTokens: 4096,
      systemPrompt
    });
    
    console.log('GLM API响应:', response);
    
    // 解析JSON响应
    const recipesData = glmService.parseJsonResponse<any[]>(response);
    
    // 转换为Recipe对象数组
    const recipes: Recipe[] = recipesData.map((recipeData, index) => {
      const recipe: Recipe = {
        id: generateUUID(),
        name: recipeData.name || '未命名菜谱',
        description: recipeData.description || '',
        ingredients: recipeData.ingredients?.map((ing: any, i: number) => ({
          id: i + 1,
          name: ing.name,
          category: ing.category || '其他',
          amount: ing.amount,
          unit: ing.unit
        })) || [],
        method: findCookingMethod(recipeData.cookingMethod) || cookingMethods[0],
        steps: recipeData.steps?.map((step: any, i: number) => ({
          id: i + 1,
          title: step.title || `步骤 ${i + 1}`,
          description: step.description,
          tips: step.tips
        })) || [],
        cookingTime: recipeData.cookingTime || 30,
        difficulty: recipeData.difficulty || 3,
        servings: recipeData.servings || 2,
        nutrition: recipeData.nutrition || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        },
        tags: recipeData.tags || [],
        createdAt: new Date(),
        cuisine: recipeData.cuisine || '',
        cookingTips: recipeData.cookingTips || [],
        healthBenefits: recipeData.healthBenefits || [],
        aiGenerated: true,
        originalGLMResponse: response
      };
      
      // 缓存生成的菜谱
      cacheData(`recipe_${recipe.id}`, recipe, 3600 * 24); // 缓存24小时
      
      return recipe;
    });
    
    return {
      recipes,
      total: recipes.length,
      filters,
      query
    };
  } catch (error) {
    console.error('搜索菜谱失败:', error);
    throw new Error(`搜索菜谱失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 增强菜谱描述
 * @param recipe 原始菜谱
 * @returns 增强后的菜谱
 */
export async function enhanceRecipeDescription(recipe: Recipe): Promise<Recipe> {
  try {
    // 构建系统提示词
    const systemPrompt = `你是一位美食作家和专业厨师，擅长撰写生动、吸引人的菜品描述。请根据提供的菜谱信息，创作一段更加详细、生动、有吸引力的菜品描述。
    描述应该包括菜品的外观、香气、口感、风味特点，以及可能的文化背景或历史渊源。使用生动的形容词和比喻，让读者能够通过文字"看到"、"闻到"和"品尝到"这道菜。
    请直接返回描述文本，不要包含任何额外的解释或格式。`;

    // 构建用户提示词
    const userPrompt = `请为这道名为"${recipe.name}"的菜品创作一段更加生动、详细的描述。
    
    原始描述：${recipe.description}
    
    主要食材：${recipe.ingredients.map(ing => ing.name).join('、')}
    
    烹饪方式：${recipe.method.name}
    
    菜系：${recipe.cuisine || '未指定'}
    
    特点标签：${recipe.tags.join('、')}`;
    
    // 调用GLM API
    const response = await glmService.callGLM(userPrompt, {
      temperature: 0.8, // 稍微提高创意性
      maxTokens: 1024,
      systemPrompt
    });
    
    // 创建增强后的菜谱副本
    const enhancedRecipe: Recipe = {
      ...recipe,
      description: response.trim()
    };
    
    // 更新缓存
    cacheData(`recipe_${recipe.id}`, enhancedRecipe, 3600 * 24);
    
    return enhancedRecipe;
  } catch (error) {
    console.error('增强菜谱描述失败:', error);
    // 如果增强失败，返回原始菜谱
    return recipe;
  }
}

/**
 * 生成菜谱烹饪技巧
 * @param recipe 菜谱
 * @returns 带有烹饪技巧的菜谱
 */
export async function generateCookingTips(recipe: Recipe): Promise<Recipe> {
  try {
    // 构建系统提示词
    const systemPrompt = `你是一位经验丰富的厨师，擅长分享实用的烹饪技巧和窍门。请根据提供的菜谱信息，提供5-8条专业、实用的烹饪技巧，帮助用户更好地完成这道菜。
    技巧应该简洁明了，直接可行，并且针对这道特定菜品的特点和可能的难点。
    请直接返回技巧列表，每条技巧一行，不要包含任何额外的解释或格式。`;

    // 构建用户提示词
    const userPrompt = `请为这道名为"${recipe.name}"的菜品提供5-8条专业、实用的烹饪技巧。
    
    菜品描述：${recipe.description}
    
    主要食材：${recipe.ingredients.map(ing => ing.name).join('、')}
    
    烹饪方式：${recipe.method.name}
    
    烹饪步骤：${recipe.steps.map(step => step.description).join(' ')}`;
    
    // 调用GLM API
    const response = await glmService.callGLM(userPrompt, {
      temperature: 0.7,
      maxTokens: 1024,
      systemPrompt
    });
    
    // 处理响应，将文本分割为技巧数组
    const tips = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('技巧') && !line.startsWith('提示'));
    
    // 创建带有烹饪技巧的菜谱副本
    const enhancedRecipe: Recipe = {
      ...recipe,
      cookingTips: tips
    };
    
    // 更新缓存
    cacheData(`recipe_${recipe.id}`, enhancedRecipe, 3600 * 24);
    
    return enhancedRecipe;
  } catch (error) {
    console.error('生成烹饪技巧失败:', error);
    // 如果生成失败，返回原始菜谱
    return recipe;
  }
}

/**
 * 生成菜谱健康益处
 * @param recipe 菜谱
 * @returns 带有健康益处的菜谱
 */
export async function generateHealthBenefits(recipe: Recipe): Promise<Recipe> {
  try {
    // 构建系统提示词
    const systemPrompt = `你是一位营养学专家，擅长分析食材和菜品的营养价值和健康益处。请根据提供的菜谱信息，分析这道菜的主要健康益处，包括其中食材的营养价值、对人体各系统的益处等。
    请提供4-6条健康益处，每条应该简洁明了，科学准确，避免夸大或不实的健康声明。
    请直接返回健康益处列表，每条一行，不要包含任何额外的解释或格式。`;

    // 构建用户提示词
    const userPrompt = `请分析这道名为"${recipe.name}"的菜品的健康益处。
    
    主要食材：${recipe.ingredients.map(ing => ing.name).join('、')}
    
    烹饪方式：${recipe.method.name}
    
    营养成分：热量 ${recipe.nutrition.calories}卡路里，蛋白质 ${recipe.nutrition.protein}克，碳水 ${recipe.nutrition.carbs}克，脂肪 ${recipe.nutrition.fat}克，膳食纤维 ${recipe.nutrition.fiber}克`;
    
    // 调用GLM API
    const response = await glmService.callGLM(userPrompt, {
      temperature: 0.7,
      maxTokens: 1024,
      systemPrompt
    });
    
    // 处理响应，将文本分割为健康益处数组
    const benefits = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('健康益处') && !line.startsWith('益处'));
    
    // 创建带有健康益处的菜谱副本
    const enhancedRecipe: Recipe = {
      ...recipe,
      healthBenefits: benefits
    };
    
    // 更新缓存
    cacheData(`recipe_${recipe.id}`, enhancedRecipe, 3600 * 24);
    
    return enhancedRecipe;
  } catch (error) {
    console.error('生成健康益处失败:', error);
    // 如果生成失败，返回原始菜谱
    return recipe;
  }
}

/**
 * 完全增强菜谱（包括描述、烹饪技巧和健康益处）
 * @param recipe 原始菜谱
 * @returns 完全增强后的菜谱
 */
export async function fullyEnhanceRecipe(recipe: Recipe): Promise<Recipe> {
  try {
    // 依次应用各种增强
    let enhancedRecipe = await enhanceRecipeDescription(recipe);
    enhancedRecipe = await generateCookingTips(enhancedRecipe);
    enhancedRecipe = await generateHealthBenefits(enhancedRecipe);
    
    return enhancedRecipe;
  } catch (error) {
    console.error('完全增强菜谱失败:', error);
    // 如果增强失败，返回原始菜谱
    return recipe;
  }
}

export default {
  generateRecipe,
  batchGenerateRecipes,
  generateRecipeByIngredients,
  generateRecipeRecommendations,
  generateHealthyRecipe,
  getRecipeById,
  searchRecipes,
  enhanceRecipeDescription,
  generateCookingTips,
  generateHealthBenefits,
  fullyEnhanceRecipe
};