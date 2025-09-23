# 📚 ChefMind API 文档

## 🌟 概述

ChefMind 提供了完整的 API 服务层，涵盖 AI 菜谱生成、用户管理、数据分析等功能。本文档详细介绍了各个服务的接口和使用方法。

## 📋 目录

- [AI 服务 API](#ai-服务-api)
- [菜谱服务 API](#菜谱服务-api)
- [用户服务 API](#用户服务-api)
- [收藏服务 API](#收藏服务-api)
- [搜索服务 API](#搜索服务-api)
- [分析服务 API](#分析服务-api)
- [数据库服务 API](#数据库服务-api)
- [缓存服务 API](#缓存服务-api)

---

## 🤖 AI 服务 API

### AI 配置服务 (`aiConfigService.ts`)

#### 主要功能
- 管理 AI 提供商配置
- 动态切换 AI 提供商
- API 密钥管理

#### 主要方法

```typescript
// 保存 API 密钥
saveApiKey(provider: string, apiKey: string, config?: any): Promise<void>

// 获取 API 密钥
getApiKey(provider: string): Promise<string | null>

// 获取提供商配置
getProviderConfig(provider: string): Promise<any>

// 检查提供商是否已配置
isProviderConfigured(provider: string): Promise<boolean>

// 获取已配置的提供商列表
getConfiguredProviders(): Promise<string[]>

// 获取当前 AI 提供商
getCurrentProvider(): string

// 切换 AI 提供商
switchProvider(provider: string): Promise<void>
```

### AI 菜谱服务 (`aiRecipeService.ts`)

#### 主要功能
- 智能菜谱生成
- 菜谱优化和改进
- 批量菜谱生成

#### 主要方法

```typescript
// 生成菜谱
generateRecipe(params: RecipeGenerationParams): Promise<Recipe>

// 批量生成菜谱
generateRecipes(paramsList: RecipeGenerationParams[]): Promise<Recipe[]>

// 优化菜谱
optimizeRecipe(recipe: Recipe, preferences: UserPreferences): Promise<Recipe>

// 验证食材
validateIngredient(ingredient: string): Promise<IngredientValidationResult>
```

#### 请求结构
```typescript
interface RecipeGenerationParams {
  ingredients: string[];
  cookingMethods?: string[];
  kitchenware?: string[];
  dietaryRestrictions?: string[];
  healthGoals?: string[];
  allergies?: string[];
  flavorPreferences?: string[];
  spiceLevel?: 'mild' | 'medium' | 'hot';
  sweetnessLevel?: 'low' | 'medium' | 'high';
  servings?: number;
  cookingTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  autoCompleteIngredients?: boolean;
}
```

### AI 营养分析服务 (`aiPersonalizedNutritionService.ts`)

#### 主要功能
- 个性化营养分析
- 膳食建议
- 营养成分计算

#### 主要方法

```typescript
// 分析营养成分
analyzeNutrition(recipe: Recipe): Promise<NutritionAnalysisResult>

// 生成膳食建议
generateDietarySuggestions(userProfile: UserProfile, nutritionData: NutritionAnalysisResult): Promise<DietarySuggestion[]>

// 计算每日营养需求
calculateDailyNutritionNeeds(userProfile: UserProfile): Promise<DailyNutritionNeeds>
```

### AI 提供商服务 (`aiProviders/`)

#### 主要功能
- 统一的 AI 提供商接口
- 支持多种 AI 提供商
- 动态切换 AI 提供商
- 提供商工厂模式

#### 主要类和方法

```typescript
// AI 提供商工厂
class AIProviderFactory {
  // 获取工厂实例
  static getInstance(): AIProviderFactory
  
  // 获取当前 AI 提供者
  getProvider(): BaseAIProvider
  
  // 切换 AI 提供者
  switchProvider(providerName: string): BaseAIProvider
  
  // 获取所有可用的 AI 提供者列表
  getAvailableProviders(): Array<{ name: string; displayName: string; description: string }>
}

// 基础 AI 提供商接口
interface BaseAIProvider {
  // 生成菜谱
  generateRecipe(params: RecipeGenerationParams): Promise<Recipe>
  
  // 分析营养成分
  analyzeNutrition(recipe: Recipe): Promise<NutritionAnalysisResult>
  
  // 验证食材
  validateIngredient(ingredient: string): Promise<IngredientValidationResult>
  
  // 获取个性化推荐
  getPersonalizedRecommendations(
    userHistory: UserHistoryItem[],
    preferences: UserPreferences,
    limit: number
  ): Promise<PersonalizedRecommendation[]>
  
  // 获取烹饪指导
  getCookingGuidance(
    recipe: Recipe,
    currentStep: number
  ): Promise<{
    guidance: string
    tips: string[]
    nextStep?: string
    estimatedTime: number
  }>
}
```

### 菜谱服务 (`recipeService.ts`)

#### 主要功能
- 菜谱 CRUD 操作
- 菜谱搜索和过滤
- 菜谱分类管理

#### 主要方法

```typescript
// 创建菜谱
createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recipe>

// 获取菜谱
getRecipe(id: string): Promise<Recipe | null>

// 更新菜谱
updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe>

// 删除菜谱
deleteRecipe(id: string): Promise<boolean>

// 搜索菜谱
searchRecipes(query: string, filters?: RecipeFilters): Promise<RecipeSearchResult>

// 获取菜谱分类
getRecipeCategories(): Promise<RecipeCategory[]>

// 获取推荐菜谱
getRecommendedRecipes(userId: string, limit?: number): Promise<Recipe[]>
```

#### 过滤器结构
```typescript
interface RecipeFilters {
  category?: string;
  cookingTime?: { min: number; max: number };
  difficulty?: 'easy' | 'medium' | 'hard';
  servings?: number;
  dietaryRestrictions?: string[];
  cuisine?: string;
  rating?: { min: number; max: number };
}
```

### 评分服务 (`ratingService.ts`)

#### 主要功能
- 菜谱评分管理
- 用户评论管理
- 评分统计

#### 主要方法

```typescript
// 添加评分
addRating(recipeId: string, userId: string, rating: number, comment?: string): Promise<Rating>

// 获取菜谱评分
getRecipeRatings(recipeId: string): Promise<Rating[]>

// 获取平均评分
getAverageRating(recipeId: string): Promise<number>

// 获取用户评分
getUserRating(recipeId: string, userId: string): Promise<Rating | null>
```

---

## 👤 用户服务 API

### 用户服务 (`userService.ts`)

#### 主要功能
- 用户管理
- 用户偏好设置
- 用户画像

#### 主要方法

```typescript
// 创建用户
createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User>

// 获取用户
getUser(id: string): Promise<User | null>

// 更新用户信息
updateUser(id: string, updates: Partial<User>): Promise<User>

// 获取用户偏好
getUserPreferences(userId: string): Promise<UserPreferences>

// 更新用户偏好
updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences>

// 获取用户画像
getUserProfile(userId: string): Promise<UserProfile>
```

### 个性化服务 (`personalizationService.ts`)

#### 主要功能
- 个性化推荐
- 用户行为分析
- 偏好学习

#### 主要方法

```typescript
// 获取个性化推荐
getPersonalizedRecommendations(userId: string): Promise<Recipe[]>

// 记录用户行为
recordUserBehavior(userId: string, action: UserAction): Promise<void>

// 学习用户偏好
learnUserPreferences(userId: string): Promise<UserPreferences>

// 获取相似用户
getSimilarUsers(userId: string): Promise<User[]>
```

---

## ❤️ 收藏服务 API

### 收藏服务 (`favoritesService.ts`)

#### 主要功能
- 收藏管理
- 收藏分类
- 收藏同步

#### 主要方法

```typescript
// 添加收藏
addFavorite(userId: string, recipe: Recipe): Promise<boolean>

// 移除收藏
removeFavorite(userId: string, recipeId: string): Promise<boolean>

// 获取用户收藏
getUserFavorites(userId: string): Promise<Recipe[]>

// 检查是否已收藏
isFavorited(userId: string, recipeId: string): Promise<boolean>

// 获取收藏数量
getFavoriteCount(userId: string): Promise<number>

// 清空用户收藏
clearUserFavorites(userId: string): Promise<boolean>
```

---

## 🔍 搜索服务 API

### 搜索历史服务 (`searchHistoryService.ts`)

#### 主要功能
- 搜索历史管理
- 热门搜索
- 搜索建议

#### 主要方法

```typescript
// 记录搜索历史
recordSearch(userId: string, query: string, results: Recipe[]): Promise<void>

// 获取搜索历史
getSearchHistory(userId: string, limit?: number): Promise<SearchHistoryItem[]>

// 清空搜索历史
clearSearchHistory(userId: string): Promise<void>

// 获取热门搜索
getPopularSearches(limit?: number): Promise<string[]>

// 获取搜索建议
getSearchSuggestions(query: string): Promise<string[]>
```

---

## 📊 分析服务 API

### 分析服务 (`analyticsService.ts`)

#### 主要功能
- 用户行为分析
- 菜谱性能分析
- 数据统计

#### 主要方法

```typescript
// 记录分析事件
trackEvent(event: AnalyticsEvent): Promise<void>

// 获取用户统计数据
getUserStats(userId: string): Promise<UserStats>

// 获取菜谱统计数据
getRecipeStats(recipeId: string): Promise<RecipeStats>

// 获取平台统计数据
getPlatformStats(): Promise<PlatformStats>

// 生成分析报告
generateReport(type: ReportType, filters?: ReportFilters): Promise<AnalyticsReport>
```

### 监控服务 (`monitoringService.ts`)

#### 主要功能
- 性能监控
- 错误追踪
- 系统健康检查

#### 主要方法

```typescript
// 记录性能指标
recordMetric(metric: PerformanceMetric): Promise<void>

// 记录错误
recordError(error: ErrorInfo): Promise<void>

// 获取系统健康状态
getSystemHealth(): Promise<SystemHealth>

// 获取性能报告
getPerformanceReport(timeRange: TimeRange): Promise<PerformanceReport>
```

---

## 🗄️ 数据库服务 API

### 数据库服务 (`database/index.ts`)

#### 主要功能
- 数据库连接管理
- 数据迁移
- 事务处理

#### 主要方法

```typescript
// 初始化数据库
initializeDatabase(): Promise<void>

// 执行查询
executeQuery(query: string, params?: any[]): Promise<any[]>

// 执行事务
executeTransaction(operations: DatabaseOperation[]): Promise<void>

// 数据库备份
backupDatabase(backupPath: string): Promise<void>

// 数据库恢复
restoreDatabase(backupPath: string): Promise<void>
```

### 数据访问服务 (`database/dataAccess.ts`)

#### 主要功能
- 通用数据访问层
- ORM 功能
- 数据验证

#### 主要方法

```typescript
// 通用查找
find<T>(table: string, conditions: any): Promise<T[]>

// 通用查找单个
findOne<T>(table: string, conditions: any): Promise<T | null>

// 通用插入
insert(table: string, data: any): Promise<string>

// 通用更新
update(table: string, id: string, data: any): Promise<boolean>

// 通用删除
delete(table: string, id: string): Promise<boolean>
```

---

## 🚀 缓存服务 API

### 高级缓存服务 (`cache/advancedCacheService.ts`)

#### 主要功能
- 多层缓存策略
- 缓存过期管理
- 缓存统计

#### 主要方法

```typescript
// 获取缓存值
get<T>(key: string): Promise<T | null>

// 设置缓存值
set<T>(key: string, value: T, ttl?: number): Promise<void>

// 删除缓存值
delete(key: string): Promise<boolean>

// 清空缓存
clear(): Promise<void>

// 获取缓存统计
getStats(): CacheStats

// 缓存预热
warmup(data: { key: string; value: any }[]): Promise<void>
```

### 缓存工具 (`cache/cacheDecorators.ts`)

#### 主要功能
- 缓存装饰器
- 自动缓存管理
- 缓存策略配置

#### 装饰器使用

```typescript
// 方法缓存
@Cacheable({ key: 'user:{0}', ttl: 3600 })
async getUser(id: string): Promise<User> {}

// 缓存失效
@CacheEvict({ key: 'user:{0}' })
async updateUser(id: string, data: Partial<User>): Promise<User> {}

// 缓存更新
@CachePut({ key: 'user:{0}' })
async refreshUser(id: string): Promise<User> {}
```

---

## 🔧 工具服务 API

### 购物清单服务 (`shoppingListService.ts`)

#### 主要功能
- 购物清单生成
- 清单管理
- 智能分类

#### 主要方法

```typescript
// 生成购物清单
generateShoppingList(recipeIds: string[]): Promise<ShoppingList>

// 保存购物清单
saveShoppingList(userId: string, list: ShoppingList): Promise<string>

// 获取购物清单
getShoppingList(id: string): Promise<ShoppingList>

// 更新购物清单
updateShoppingList(id: string, updates: Partial<ShoppingList>): Promise<ShoppingList>
```

### 营养分析服务 (`nutritionAnalysisService.ts`)

#### 主要功能
- 营养成分分析
- 膳食评估
- 营养建议

#### 主要方法

```typescript
// 分析食材营养
analyzeIngredients(ingredients: string[]): Promise<NutritionInfo>

// 评估膳食平衡
assessDietBalance(nutrition: NutritionInfo): Promise<DietAssessment>

// 生成营养报告
generateNutritionReport(userId: string, period: TimePeriod): Promise<NutritionReport>
```

---

## 📝 使用示例

### 基本菜谱生成

```typescript
import { aiRecipeService } from '@/services/aiRecipeService';

// 生成菜谱
const recipe = await aiRecipeService.generateRecipe({
  ingredients: ['鸡肉', '土豆', '胡萝卜'],
  dietaryRestrictions: ['无麸质'],
  cookingTime: 30,
  difficulty: 'medium',
  servings: 4
});

console.log('生成的菜谱:', recipe);
```

### 个性化推荐

```typescript
import { personalizationService } from '@/services/personalizationService';

// 获取个性化推荐
const recommendations = await personalizationService.getPersonalizedRecommendations('user123');

console.log('推荐菜谱:', recommendations);
```

### 搜索和过滤

```typescript
import { recipeService } from '@/services/recipeService';

// 搜索菜谱
const results = await recipeService.searchRecipes('鸡肉', {
  cookingTime: { min: 15, max: 45 },
  difficulty: 'easy',
  dietaryRestrictions: ['低脂']
});

console.log('搜索结果:', results);
```

---

## 🔄 错误处理

所有 API 方法都实现了完整的错误处理机制：

```typescript
try {
  const recipe = await recipeService.getRecipe('recipe123');
  // 处理成功结果
} catch (error) {
  if (error instanceof NotFoundError) {
    // 处理未找到错误
  } else if (error instanceof ValidationError) {
    // 处理验证错误
  } else {
    // 处理其他错误
  }
}
```

---

## 📈 性能优化

### 缓存策略
- 内存缓存：用于频繁访问的数据
- 持久化缓存：用于长期存储的数据
- 自动过期：基于 TTL 的缓存过期

### 批量操作
- 支持批量数据获取
- 批量写入优化
- 事务处理

### 懒加载
- 组件懒加载
- 数据懒加载
- 图片懒加载

---

## 🔒 安全考虑

### 数据验证
- 输入验证
- 类型检查
- SQL 注入防护

### 权限控制
- 用户身份验证
- 操作权限检查
- 数据访问控制

### 敏感信息保护
- API 密钥加密
- 用户数据加密
- 安全传输

---

## 📚 相关文档

- [项目结构说明](./PROJECT_STRUCTURE.md)
- [数据库架构](./DATABASE_SCHEMA.md)
- [AI 服务架构](./AI_SERVICE_ARCHITECTURE.md)
- [部署指南](./DEPLOYMENT.md)