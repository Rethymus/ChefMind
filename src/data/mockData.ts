// ChefMind 智食谱 - 数据配置文件（已移除所有mock数据）

import type { 
  IngredientCategory, 
  CookingMethod, 
  Recipe, 
  NutritionInfo
} from '@/types/recipe'

// 基础食材分类结构 - 使用AI动态生成内容
export const getIngredientCategories = async (): Promise<IngredientCategory[]> => {
  try {
    // 从本地存储获取已保存的食材分类
    const stored = localStorage.getItem('chefmind_ingredient_categories');
    if (stored) {
      return JSON.parse(stored);
    }

    // 如果没有存储的数据，使用AI生成
    const { aiService } = await import('@/services/aiService');
    const ingredients = ['蔬菜', '肉类', '海鲜', '调料'];
    const preferences = { type: 'ingredient_categories' };
    
    const response = await aiService.generateRecipe(ingredients, preferences);
    const categories = JSON.parse(response);
    
    // 保存到本地存储
    localStorage.setItem('chefmind_ingredient_categories', JSON.stringify(categories));
    
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    console.error('获取食材分类失败:', error);
    return [];
  }
};

// 基础烹饪方式 - 使用AI动态生成内容
export const getCookingMethods = async (): Promise<CookingMethod[]> => {
  try {
    // 从本地存储获取已保存的烹饪方式
    const stored = localStorage.getItem('chefmind_cooking_methods');
    if (stored) {
      return JSON.parse(stored);
    }

    // 如果没有存储的数据，使用AI生成
    const { aiService } = await import('@/services/aiService');
    const ingredients = ['烹饪方法'];
    const preferences = { type: 'cooking_methods' };
    
    const response = await aiService.generateRecipe(ingredients, preferences);
    const methods = JSON.parse(response);
    
    // 保存到本地存储
    localStorage.setItem('chefmind_cooking_methods', JSON.stringify(methods));
    
    return Array.isArray(methods) ? methods : [];
  } catch (error) {
    console.error('获取烹饪方式失败:', error);
    return [];
  }
};

// 营养数据库 - 使用AI动态查询
export const getNutritionInfo = async (ingredientName: string): Promise<NutritionInfo | null> => {
  try {
    // 先从本地缓存查找
    const cached = localStorage.getItem(`nutrition_${ingredientName}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // 使用AI查询营养信息
    const { aiService } = await import('@/services/aiService');
    const ingredients = [ingredientName];
    const preferences = { type: 'nutrition_info' };
    
    const response = await aiService.generateRecipe(ingredients, preferences);
    const nutrition = JSON.parse(response);
    
    // 缓存结果
    localStorage.setItem(`nutrition_${ingredientName}`, JSON.stringify(nutrition));
    
    return nutrition;
  } catch (error) {
    console.error(`获取${ingredientName}营养信息失败:`, error);
    return null;
  }
};

// 食材推荐 - 使用AI动态生成
export const getIngredientRecommendations = async (ingredientName: string): Promise<any[]> => {
  try {
    const { aiService } = await import('@/services/aiService');
    const ingredients = [ingredientName];
    const preferences = { type: 'ingredient_recommendations' };
    
    const response = await aiService.generateRecipe(ingredients, preferences);
    const recommendations = JSON.parse(response);
    
    return Array.isArray(recommendations) ? recommendations : [];
  } catch (error) {
    console.error(`获取${ingredientName}推荐失败:`, error);
    return [];
  }
};

// 外部链接配置 - 保留静态配置
export const externalLinks = [
  {
    name: 'Bilibili',
    url: 'https://search.bilibili.com/all?keyword=',
    icon: 'VideoPlay',
    color: '#00a1d6'
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/results?search_query=',
    icon: 'VideoCamera',
    color: '#ff0000'
  },
  {
    name: '下厨房',
    url: 'https://www.xiachufang.com/search/?keyword=',
    icon: 'Reading',
    color: '#28b463'
  },
  {
    name: '豆果美食',
    url: 'https://www.douguo.com/search/recipe/',
    icon: 'StarFilled',
    color: '#f39c12'
  }
];

// 热门食谱数据 - 添加缺失的导出
export const popularRecipes: Recipe[] = [
  {
    id: '1',
    title: '宫保鸡丁',
    description: '经典川菜，麻辣鲜香',
    ingredients: ['鸡胸肉 300g', '花生米 100g', '干辣椒 10个', '花椒 1茶匙'],
    instructions: ['鸡肉切丁腌制', '热锅下油炒花生米', '下鸡丁炒至变色', '加调料炒匀即可'],
    cookingTime: 20,
    difficulty: 'medium',
    servings: 2,
    image: '/images/gongbao-chicken.jpg',
    tags: ['川菜', '下饭菜', '家常菜'],
    nutrition: {
      calories: 320,
      protein: 28,
      carbs: 12,
      fat: 18,
      fiber: 3
    },
    rating: 4.5,
    author: 'Chef Wang',
    createdAt: new Date('2024-01-15'),
    category: 'main'
  },
  {
    id: '2',
    title: '番茄鸡蛋面',
    description: '简单快手的家常面条',
    ingredients: ['面条 200g', '鸡蛋 2个', '番茄 2个', '葱花 适量'],
    instructions: ['番茄切块', '鸡蛋打散炒熟', '下番茄炒出汁', '加水煮面条'],
    cookingTime: 15,
    difficulty: 'easy',
    servings: 1,
    image: '/images/tomato-egg-noodles.jpg',
    tags: ['快手菜', '面食', '家常菜'],
    nutrition: {
      calories: 280,
      protein: 15,
      carbs: 45,
      fat: 8,
      fiber: 4
    },
    rating: 4.2,
    author: 'Home Cook',
    createdAt: new Date('2024-01-20'),
    category: 'main'
  }
];

// 向后兼容的导出 - 现在返回空数据，组件应使用上面的异步函数
export const ingredientCategories: IngredientCategory[] = [];
export const cookingMethods: CookingMethod[] = [];
export const nutritionDatabase: Record<string, NutritionInfo> = {};
export const mockRecipes: Recipe[] = [];
export const mockRecipeData = {
  recipes: [],
  cookingMethods: [],
  ingredients: []
};
export const recommendationData = {
  nutrition: {},
  flavor: {},
  classic: {}
};
