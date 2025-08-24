// ChefMind 智食谱 - 个性化服务

import type { Recipe, UserPreference, HealthConstraint } from '@/types/recipe'
import { callGLM } from './glmService'
import { getCachedData, setCachedData } from '@/utils/apiCache'
// 本地烹饪方法数据定义
const cookingMethods = [
  { id: 1, name: '炒', time: 15, difficulty: 2, description: '快速翻炒，保持食材鲜嫩' },
  { id: 2, name: '煮', time: 20, difficulty: 1, description: '水煮烹饪，营养保留好' },
  { id: 3, name: '蒸', time: 25, difficulty: 2, description: '蒸汽烹饪，健康清淡' },
  { id: 4, name: '炖', time: 60, difficulty: 3, description: '慢火炖煮，汤汁浓郁' },
  { id: 5, name: '烤', time: 30, difficulty: 3, description: '烘烤制作，香味浓郁' },
  { id: 6, name: '炸', time: 10, difficulty: 4, description: '油炸烹饪，酥脆可口' },
  { id: 7, name: '煎', time: 12, difficulty: 2, description: '平底锅煎制，外焦内嫩' },
  { id: 8, name: '焖', time: 40, difficulty: 3, description: '密封焖煮，入味充分' },
  { id: 9, name: '烧', time: 35, difficulty: 3, description: '红烧制作，色泽诱人' },
  { id: 10, name: '拌', time: 5, difficulty: 1, description: '凉拌制作，清爽开胃' }
];

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * 根据用户偏好和健康约束生成个性化菜谱推荐
 * @param preferences 用户饮食偏好
 * @param constraints 健康约束条件
 * @returns 个性化推荐的菜谱列表
 */
export async function getPersonalizedRecipes(
  preferences: UserPreference,
  constraints: HealthConstraint[]
): Promise<Recipe[]> {
  // 生成缓存键
  const preferencesKey = JSON.stringify(preferences);
  const constraintsKey = constraints.map(c => c.type).sort().join('_');
  const cacheKey = `personalized_${preferencesKey}_${constraintsKey}`;
  
  // 检查缓存
  const cachedRecipes = getCachedData<Recipe[]>(cacheKey);
  if (cachedRecipes) {
    return cachedRecipes;
  }
  
  try {
    // 构建提示词
    const prompt = `请根据以下用户偏好和健康约束，生成3道个性化菜谱推荐:

用户偏好:
- 口味偏好: ${preferences.taste || '不限'}
- 饮食类型: ${preferences.dietType || '不限'}
- 喜欢的食材: ${preferences.favoriteIngredients?.join('、') || '不限'}
- 不喜欢的食材: ${preferences.dislikedIngredients?.join('、') || '无'}

健康约束:
${constraints.map(c => `- ${c.type}: ${c.description}`).join('\n')}

请按照以下JSON格式返回菜谱数据，不要有任何其他内容:
[
  {
    "name": "菜谱名称",
    "description": "菜谱简短描述，包括为什么适合该用户的个性化说明",
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
    "tags": ["标签1", "标签2"],
    "healthBenefits": ["健康益处1", "健康益处2"]
  }
]`;

    // 调用GLM API
    const response = await callGLM(prompt);
    
    try {
      // 提取JSON部分
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('无法从AI响应中提取JSON数据');
      }
      
      const jsonData = JSON.parse(jsonMatch[0]);
      
      // 构建Recipe对象数组
      const recipes: Recipe[] = jsonData.map((item: any) => {
        // 查找匹配的烹饪方法
        const method = cookingMethods.find(m => m.name === item.cookingMethod) || cookingMethods[0];
        
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
          healthBenefits: item.healthBenefits || [],
          createdAt: new Date(),
          aiGenerated: true,
          personalizedFor: {
            preferences,
            constraints
          }
        };
      });
      
      // 缓存结果
      setCachedData(cacheKey, recipes, 24 * 60 * 60 * 1000); // 缓存24小时
      
      return recipes;
    } catch (error) {
      console.error('解析AI生成的个性化菜谱失败:', error);
      throw new Error('生成个性化菜谱推荐失败，请重试');
    }
  } catch (error) {
    console.error('获取个性化菜谱推荐失败:', error);
    // 如果AI生成失败，返回空数组
    return [];
  }
}

/**
 * 根据用户的健康数据生成健康饮食建议
 * @param healthData 用户健康数据
 * @returns 健康饮食建议
 */
export async function generateHealthyEatingAdvice(healthData: any): Promise<string> {
  const cacheKey = `health_advice_${JSON.stringify(healthData)}`;
  
  // 检查缓存
  const cachedAdvice = getCachedData<string>(cacheKey);
  if (cachedAdvice) {
    return cachedAdvice;
  }
  
  try {
    // 构建提示词
    const prompt = `请根据以下用户健康数据，生成个性化的健康饮食建议:

健康数据:
- 年龄: ${healthData.age || '未知'}
- 性别: ${healthData.gender || '未知'}
- 身高: ${healthData.height || '未知'} cm
- 体重: ${healthData.weight || '未知'} kg
- BMI: ${healthData.bmi || '未知'}
- 活动水平: ${healthData.activityLevel || '未知'}
- 健康目标: ${healthData.healthGoals?.join('、') || '未知'}
- 慢性疾病: ${healthData.chronicConditions?.join('、') || '无'}
- 过敏原: ${healthData.allergies?.join('、') || '无'}

请提供以下内容:
1. 总体饮食建议
2. 推荐的食物类型
3. 应避免的食物
4. 每日营养摄入建议
5. 饮食习惯改善建议

请以中文回答，格式清晰易读，使用Markdown格式。`;

    // 调用GLM API
    const response = await callGLM(prompt);
    
    // 缓存结果
    setCachedData(cacheKey, response, 7 * 24 * 60 * 60 * 1000); // 缓存7天
    
    return response;
  } catch (error) {
    console.error('生成健康饮食建议失败:', error);
    // 如果AI生成失败，返回简单的建议
    return generateSimpleHealthAdvice(healthData);
  }
}

/**
 * 生成简单的健康饮食建议
 * @param healthData 用户健康数据
 * @returns 健康饮食建议文本
 */
function generateSimpleHealthAdvice(_healthData: any): string {
  return `
## 个性化健康饮食建议

### 总体饮食建议

保持均衡饮食，多摄入新鲜蔬果，适量摄入优质蛋白质，控制精制碳水化合物和饱和脂肪的摄入。

### 推荐的食物类型

- 新鲜蔬菜和水果
- 全谷物食品
- 优质蛋白质来源，如鱼类、豆类、瘦肉
- 健康脂肪，如橄榄油、坚果

### 应避免的食物

- 高糖食品和饮料
- 高盐加工食品
- 油炸食品
- 精制碳水化合物

### 每日营养摄入建议

- 蛋白质：体重(kg) × 0.8-1.2g
- 碳水化合物：总热量的45-65%
- 脂肪：总热量的20-35%
- 膳食纤维：25-30g
- 水分：2000-2500ml

### 饮食习惯改善建议

1. 定时定量进餐，避免暴饮暴食
2. 细嚼慢咽，有助消化吸收
3. 减少外出就餐频率，自己烹饪更健康
4. 保持食物多样性，确保营养均衡
5. 控制进食速度，给饱腹感留出时间
`;
}

/**
 * 根据季节和地域生成应季菜谱推荐
 * @param season 季节
 * @param region 地域
 * @returns 应季菜谱列表
 */
export async function getSeasonalRecipes(season: string, region: string): Promise<Recipe[]> {
  const cacheKey = `seasonal_${season}_${region}`;
  
  // 检查缓存
  const cachedRecipes = getCachedData<Recipe[]>(cacheKey);
  if (cachedRecipes) {
    return cachedRecipes;
  }
  
  try {
    // 构建提示词
    const prompt = `请根据以下季节和地域，推荐3道应季菜谱:
季节: ${season}
地域: ${region}

请按照以下JSON格式返回菜谱数据，不要有任何其他内容:
[
  {
    "name": "菜谱名称",
    "description": "菜谱简短描述，包括为什么适合该季节和地域",
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
    "tags": ["标签1", "标签2"],
    "seasonalIngredients": ["应季食材1", "应季食材2"]
  }
]`;

    // 调用GLM API
    const response = await callGLM(prompt);
    
    try {
      // 提取JSON部分
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('无法从AI响应中提取JSON数据');
      }
      
      const jsonData = JSON.parse(jsonMatch[0]);
      
      // 构建Recipe对象数组
      const recipes: Recipe[] = jsonData.map((item: any) => {
        // 查找匹配的烹饪方法
        const method = cookingMethods.find(m => m.name === item.cookingMethod) || cookingMethods[0];
        
        return {
          id: generateId(),
          name: item.name,
          description: item.description,
          ingredients: item.ingredients.map((ing: any, index: number) => ({
            id: index + 5000, // 使用大数字避免与现有ID冲突
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
          seasonalIngredients: item.seasonalIngredients || [],
          createdAt: new Date(),
          aiGenerated: true,
          seasonal: {
            season,
            region
          }
        };
      });
      
      // 缓存结果
      setCachedData(cacheKey, recipes, 7 * 24 * 60 * 60 * 1000); // 缓存7天
      
      return recipes;
    } catch (error) {
      console.error('解析AI生成的应季菜谱失败:', error);
      throw new Error('生成应季菜谱推荐失败，请重试');
    }
  } catch (error) {
    console.error('获取应季菜谱推荐失败:', error);
    // 如果AI生成失败，返回空数组
    return [];
  }
}