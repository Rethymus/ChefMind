// ChefMind 智食谱 - 数据分析服务

/**
 * 数据分析服务
 * 提供用户行为分析、食谱统计和个性化推荐功能
 */

// 用户行为类型
export enum UserActionType {
  VIEW_RECIPE = 'view_recipe',
  SAVE_RECIPE = 'save_recipe',
  GENERATE_RECIPE = 'generate_recipe',
  SEARCH_RECIPE = 'search_recipe',
  PRINT_RECIPE = 'print_recipe',
  SHARE_RECIPE = 'share_recipe',
  ADD_TO_SHOPPING_LIST = 'add_to_shopping_list',
  RATE_RECIPE = 'rate_recipe',
  COMMENT_RECIPE = 'comment_recipe'
}

// 用户行为接口
export interface UserAction {
  type: UserActionType;
  timestamp: number;
  recipeId?: string;
  recipeTitle?: string;
  value?: any;
}

// 用户统计数据接口
export interface UserStats {
  viewedRecipes: number;
  savedRecipes: number;
  generatedRecipes: number;
  searchCount: number;
  printCount: number;
  shareCount: number;
  shoppingListAdds: number;
  ratingCount: number;
  commentCount: number;
  favoriteCategories: Array<{category: string, count: number}>;
  favoriteIngredients: Array<{ingredient: string, count: number}>;
  cookingTime: {
    total: number;
    average: number;
  };
  activityByDay: Record<string, number>;
  activityByHour: Record<string, number>;
}

// 食谱统计数据接口
export interface RecipeStats {
  mostViewed: Array<{id: string, title: string, count: number}>;
  mostSaved: Array<{id: string, title: string, count: number}>;
  mostRated: Array<{id: string, title: string, rating: number}>;
  mostShared: Array<{id: string, title: string, count: number}>;
  categoryDistribution: Array<{category: string, count: number}>;
  ingredientPopularity: Array<{ingredient: string, count: number}>;
  cookingTimeDistribution: Array<{range: string, count: number}>;
  difficultyDistribution: Array<{level: string, count: number}>;
}

// 趋势数据接口
export interface TrendData {
  trendingRecipes: Array<{id: string, title: string, trend: number}>;
  trendingCategories: Array<{category: string, trend: number}>;
  trendingIngredients: Array<{ingredient: string, trend: number}>;
  seasonalRecipes: Array<{id: string, title: string, season: string}>;
}

/**
 * 数据分析服务类
 */
class AnalyticsService {
  private userActions: UserAction[] = [];
  private localStorageKey = 'chefmind_user_actions';

  constructor() {
    this.loadUserActions();
  }

  /**
   * 从本地存储加载用户行为数据
   */
  private loadUserActions(): void {
    try {
      const storedActions = localStorage.getItem(this.localStorageKey);
      if (storedActions) {
        this.userActions = JSON.parse(storedActions);
      }
    } catch (error) {
      console.error('加载用户行为数据失败:', error);
    }
  }

  /**
   * 保存用户行为数据到本地存储
   */
  private saveUserActions(): void {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.userActions));
    } catch (error) {
      console.error('保存用户行为数据失败:', error);
    }
  }

  /**
   * 记录用户行为
   * @param type 行为类型
   * @param recipeId 食谱ID（可选）
   * @param recipeTitle 食谱标题（可选）
   * @param value 相关值（可选）
   */
  public trackUserAction(
    type: UserActionType,
    recipeId?: string,
    recipeTitle?: string,
    value?: any
  ): void {
    const action: UserAction = {
      type,
      timestamp: Date.now(),
      recipeId,
      recipeTitle,
      value
    };

    this.userActions.push(action);
    this.saveUserActions();

    // 如果在生产环境，可以考虑将数据发送到后端服务器
    if (process.env.NODE_ENV === 'production') {
      this.sendToServer(action);
    }
  }

  /**
   * 将用户行为数据发送到服务器（模拟）
   * @param action 用户行为数据
   */
  private sendToServer(action: UserAction): void {
    // 模拟发送数据到服务器
    console.log('发送数据到服务器:', action);
    // 实际项目中，这里应该是一个API调用
  }

  /**
   * 获取用户统计数据
   * @param days 天数，默认为30天
   * @returns 用户统计数据
   */
  public getUserStats(days: number = 30): UserStats {
    const now = Date.now();
    const startTime = now - days * 24 * 60 * 60 * 1000;
    const filteredActions = this.userActions.filter(action => action.timestamp >= startTime);

    // 初始化统计数据
    const stats: UserStats = {
      viewedRecipes: 0,
      savedRecipes: 0,
      generatedRecipes: 0,
      searchCount: 0,
      printCount: 0,
      shareCount: 0,
      shoppingListAdds: 0,
      ratingCount: 0,
      commentCount: 0,
      favoriteCategories: [],
      favoriteIngredients: [],
      cookingTime: {
        total: 0,
        average: 0
      },
      activityByDay: {},
      activityByHour: {}
    };

    // 统计不同类型的行为次数
    filteredActions.forEach(action => {
      switch (action.type) {
        case UserActionType.VIEW_RECIPE:
          stats.viewedRecipes++;
          break;
        case UserActionType.SAVE_RECIPE:
          stats.savedRecipes++;
          break;
        case UserActionType.GENERATE_RECIPE:
          stats.generatedRecipes++;
          break;
        case UserActionType.SEARCH_RECIPE:
          stats.searchCount++;
          break;
        case UserActionType.PRINT_RECIPE:
          stats.printCount++;
          break;
        case UserActionType.SHARE_RECIPE:
          stats.shareCount++;
          break;
        case UserActionType.ADD_TO_SHOPPING_LIST:
          stats.shoppingListAdds++;
          break;
        case UserActionType.RATE_RECIPE:
          stats.ratingCount++;
          break;
        case UserActionType.COMMENT_RECIPE:
          stats.commentCount++;
          break;
      }

      // 统计每天的活动量
      const date = new Date(action.timestamp);
      const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      stats.activityByDay[dayKey] = (stats.activityByDay[dayKey] || 0) + 1;

      // 统计每小时的活动量
      const hourKey = date.getHours().toString();
      stats.activityByHour[hourKey] = (stats.activityByHour[hourKey] || 0) + 1;
    });

    // 模拟一些其他统计数据
    stats.favoriteCategories = [
      { category: '中餐', count: 15 },
      { category: '西餐', count: 8 },
      { category: '甜点', count: 6 },
      { category: '素食', count: 4 },
      { category: '海鲜', count: 3 }
    ];

    stats.favoriteIngredients = [
      { ingredient: '鸡肉', count: 12 },
      { ingredient: '西红柿', count: 10 },
      { ingredient: '洋葱', count: 9 },
      { ingredient: '大蒜', count: 8 },
      { ingredient: '橄榄油', count: 7 }
    ];

    stats.cookingTime = {
      total: 1260, // 总烹饪时间（分钟）
      average: 42 // 平均烹饪时间（分钟）
    };

    return stats;
  }

  /**
   * 获取食谱统计数据
   * @returns 食谱统计数据
   */
  public getRecipeStats(): RecipeStats {
    // 模拟食谱统计数据
    return {
      mostViewed: [
        { id: '1', title: '香煎三文鱼配柠檬黄油酱', count: 156 },
        { id: '2', title: '意大利番茄罗勒意面', count: 142 },
        { id: '3', title: '泰式青咖喱鸡', count: 128 },
        { id: '4', title: '自制披萨', count: 115 },
        { id: '5', title: '日式拉面', count: 98 }
      ],
      mostSaved: [
        { id: '1', title: '香煎三文鱼配柠檬黄油酱', count: 87 },
        { id: '3', title: '泰式青咖喱鸡', count: 76 },
        { id: '2', title: '意大利番茄罗勒意面', count: 65 },
        { id: '6', title: '墨西哥玉米卷', count: 54 },
        { id: '4', title: '自制披萨', count: 48 }
      ],
      mostRated: [
        { id: '1', title: '香煎三文鱼配柠檬黄油酱', rating: 4.8 },
        { id: '3', title: '泰式青咖喱鸡', rating: 4.7 },
        { id: '4', title: '自制披萨', rating: 4.6 },
        { id: '2', title: '意大利番茄罗勒意面', rating: 4.5 },
        { id: '7', title: '越南河粉', rating: 4.4 }
      ],
      mostShared: [
        { id: '4', title: '自制披萨', count: 42 },
        { id: '1', title: '香煎三文鱼配柠檬黄油酱', count: 38 },
        { id: '6', title: '墨西哥玉米卷', count: 35 },
        { id: '3', title: '泰式青咖喱鸡', count: 29 },
        { id: '2', title: '意大利番茄罗勒意面', count: 26 }
      ],
      categoryDistribution: [
        { category: '中餐', count: 156 },
        { category: '西餐', count: 142 },
        { category: '甜点', count: 98 },
        { category: '素食', count: 76 },
        { category: '海鲜', count: 65 },
        { category: '烧烤', count: 54 },
        { category: '早餐', count: 48 }
      ],
      ingredientPopularity: [
        { ingredient: '鸡肉', count: 187 },
        { ingredient: '西红柿', count: 165 },
        { ingredient: '洋葱', count: 154 },
        { ingredient: '大蒜', count: 143 },
        { ingredient: '橄榄油', count: 132 },
        { ingredient: '牛肉', count: 121 },
        { ingredient: '胡萝卜', count: 110 }
      ],
      cookingTimeDistribution: [
        { range: '0-15分钟', count: 87 },
        { range: '15-30分钟', count: 156 },
        { range: '30-60分钟', count: 132 },
        { range: '60-120分钟', count: 76 },
        { range: '120+分钟', count: 32 }
      ],
      difficultyDistribution: [
        { level: '简单', count: 187 },
        { level: '中等', count: 143 },
        { level: '困难', count: 65 }
      ]
    };
  }

  /**
   * 获取趋势数据
   * @returns 趋势数据
   */
  public getTrendData(): TrendData {
    // 模拟趋势数据
    return {
      trendingRecipes: [
        { id: '8', title: '韩式炸鸡', trend: 156 },
        { id: '9', title: '牛油果吐司', trend: 142 },
        { id: '10', title: '椰子奶冻', trend: 128 },
        { id: '11', title: '烤茄子', trend: 115 },
        { id: '12', title: '南瓜汤', trend: 98 }
      ],
      trendingCategories: [
        { category: '韩餐', trend: 87 },
        { category: '低碳水', trend: 76 },
        { category: '空气炸锅', trend: 65 },
        { category: '一锅料理', trend: 54 },
        { category: '无麸质', trend: 48 }
      ],
      trendingIngredients: [
        { ingredient: '牛油果', trend: 87 },
        { ingredient: '藜麦', trend: 76 },
        { ingredient: '椰子油', trend: 65 },
        { ingredient: '奇亚籽', trend: 54 },
        { ingredient: '姜黄', trend: 48 }
      ],
      seasonalRecipes: [
        { id: '13', title: '南瓜派', season: '秋季' },
        { id: '14', title: '草莓冰沙', season: '夏季' },
        { id: '15', title: '热巧克力', season: '冬季' },
        { id: '16', title: '春笋炒肉', season: '春季' },
        { id: '17', title: '栗子烧鸡', season: '秋季' }
      ]
    };
  }

  /**
   * 获取个性化推荐
   * @param userId 用户ID
   * @param limit 推荐数量
   * @returns 推荐的食谱列表
   */
  public getPersonalizedRecommendations(userId: string, limit: number = 5): Array<{id: string, title: string, image: string, reason: string}> {
    // 模拟个性化推荐
    return [
      {
        id: '18',
        title: '蒜蓉粉丝蒸扇贝',
        image: 'https://images.unsplash.com/photo-1635146037526-a75e6905ad78?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2NhbGxvcHN8ZW58MHx8MHx8fDA%3D',
        reason: '基于您对海鲜类食谱的兴趣'
      },
      {
        id: '19',
        title: '香辣干锅鸡',
        image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNwaWN5JTIwY2hpY2tlbnxlbnwwfHwwfHx8MA%3D%3D',
        reason: '您经常浏览鸡肉类食谱'
      },
      {
        id: '20',
        title: '松露蘑菇意面',
        image: 'https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaHJvb20lMjBwYXN0YXxlbnwwfHwwfHx8MA%3D%3D',
        reason: '与您最近查看的意面食谱相似'
      },
      {
        id: '21',
        title: '柠檬草烤鱼',
        image: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Z3JpbGxlZCUyMGZpc2h8ZW58MHx8MHx8fDA%3D',
        reason: '基于您收藏的三文鱼食谱'
      },
      {
        id: '22',
        title: '芒果椰汁西米露',
        image: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFuZ28lMjBkZXNzZXJ0fGVufDB8fDB8fHww',
        reason: '您可能会喜欢的甜点'
      }
    ];
  }

  /**
   * 清除用户行为数据
   */
  public clearUserActions(): void {
    this.userActions = [];
    this.saveUserActions();
  }
}

// 导出单例实例
export const analyticsService = new AnalyticsService();