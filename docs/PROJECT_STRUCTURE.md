# 📁 ChefMind 项目结构说明

## 📂 根目录结构

```
ChefMind/
├── public/                 # 静态资源文件
├── src/                    # Vue.js 源代码目录
├── src-tauri/              # Tauri 桌面应用
├── data/                   # SQLite数据库文件
├── dist/                   # 构建输出目录
├── docs/                   # 项目文档
├── .env.example           # 环境变量示例文件
├── package.json           # 项目依赖和脚本配置
├── vite.config.ts         # Vite 构建配置
├── tsconfig.json          # TypeScript 配置
└── README.md              # 项目说明文档
```

## 📂 src 目录结构

```
src/
├── components/            # 可复用组件
│   ├── ai/                # AI相关组件
│   │   ├── CookingAssistant.vue           # AI烹饪助手
│   │   ├── IntelligentChatAssistant.vue   # 智能聊天助手
│   │   ├── SmartIngredientAnalyzer.vue    # 智能食材分析器
│   │   ├── AIHub.vue                      # AI中心
│   │   ├── AIProviderSettings.vue         # AI提供商设置
│   │   ├── NutritionAnalyzer.vue          # 营养分析器
│   │   ├── AdvancedNutritionAnalyzer.vue  # 高级营养分析器
│   │   └── EnhancedPersonalizedRecommendations.vue # 增强个性化推荐
│   │   └── components/                   # AI子组件
│   │       ├── NutritionReport.vue       # 营养报告
│   │       ├── NutritionComparison.vue   # 营养对比
│   │       ├── MealPlanAnalysis.vue      # 膳食计划分析
│   │       ├── RecipeNutritionAnalysis.vue # 菜谱营养分析
│   │       └── IngredientNutritionAnalysis.vue # 食材营养分析
│   ├── analytics/         # 数据分析组件
│   │   ├── UserDashboard.vue             # 用户仪表板
│   │   ├── AnalyticsUserProfileForm.vue  # 分析用户资料表单
│   │   └── EnhancedUserBehaviorAnalytics.vue # 增强用户行为分析
│   ├── common/            # 通用UI组件
│   │   ├── DesktopNavBar.vue             # 桌面导航栏
│   │   ├── MobileNavBar.vue              # 移动端导航栏
│   │   ├── ErrorBoundary.vue             # 错误边界
│   │   ├── ErrorAlert.vue                # 错误提示
│   │   ├── EnhancedThemeToggle.vue       # 增强主题切换
│   │   ├── ThemeToggle.vue               # 主题切换
│   │   ├── NotificationContainer.vue     # 通知容器
│   │   ├── LoadingSpinner.vue            # 加载动画
│   │   ├── UserProfileForm.vue           # 用户资料表单
│   │   ├── OptimizedInput.vue            # 优化输入框
│   │   ├── InputMethodMonitor.vue        # 输入法监控
│   │   ├── APIKeyReminder.vue            # API密钥提醒
│   │   ├── APIConfigModal.vue            # API配置模态框
│   │   └── APIConfigButton.vue           # API配置按钮
│   ├── layout/            # 布局组件
│   │   ├── AppHeader.vue                 # 应用头部
│   │   └── GlassFooter.vue               # 玻璃效果底部
│   ├── monitoring/        # 监控组件
│   │   └── MonitoringDashboard.vue      # 监控仪表板
│   └── recipe/            # 菜谱相关组件
│       ├── RecipeGenerator.vue           # 菜谱生成器
│       ├── RecipeResults.vue             # 菜谱结果
│       ├── RecipeDetailView.vue          # 菜谱详情视图
│       ├── RecipeDetail.vue              # 菜谱详情
│       ├── RecipeNutrition.vue           # 菜谱营养信息
│       ├── RecipeComments.vue            # 菜谱评论
│       ├── RecipeShare.vue               # 菜谱分享
│       ├── RecipeSearchHistory.vue       # 菜谱搜索历史
│       ├── RecipeRelated.vue             # 相关菜谱
│       ├── RecipeBatchExport.vue         # 批量导出
│       ├── RecipeExport.vue              # 菜谱导出
│       ├── RecipePrintPreview.vue        # 打印预览
│       ├── CookingTimer.vue              # 烹饪计时器
│       ├── IngredientSelection.vue       # 食材选择
│       ├── IngredientRecognition.vue     # 食材识别
│       ├── DietaryRestrictionSelection.vue # 饮食限制选择
│       ├── ConstraintSelection.vue       # 约束条件选择
│       ├── CookingMethodSelection.vue    # 烹饪方式选择
│       ├── StepNavigation.vue           # 步骤导航
│       ├── StepIndicator.vue            # 步骤指示器
│       ├── SmartRecommendation.vue      # 智能推荐
│       ├── ShoppingList.vue              # 购物清单
│       ├── AIEnhancedFeatures.vue        # AI增强功能
│       ├── NutritionAnalysis.vue        # 营养分析
│       ├── FavoritesRecipeCard.vue       # 收藏菜谱卡片
│       ├── RecipeSearch.vue               # 菜谱搜索
│       ├── EnhancedSearchInterface.vue  # 增强搜索界面
│       ├── AutoRecipeCard.vue            # 自动菜谱卡片
│       └── PersonalizedRecommendations.vue # 个性化推荐
├── models/                # 数据模型定义
│   ├── Recipe.ts                       # 菜谱模型
│   └── Favorite.ts                     # 收藏模型
├── router/                # 路由配置
│   └── index.ts                        # 路由定义
├── services/              # 业务逻辑层
│   ├── aiConfig.ts                     # AI配置服务
│   ├── aiApiKeyService.ts              # AI API密钥服务
│   ├── aiService.ts                    # AI服务
│   ├── aiRecipeService.ts              # AI菜谱服务
│   ├── recipeService.ts                # 菜谱服务
│   ├── userService.ts                  # 用户服务
│   ├── favoritesService.ts             # 收藏服务
│   ├── ratingService.ts                # 评分服务
│   ├── personalizationService.ts       # 个性化服务
│   ├── analyticsService.ts             # 分析服务
│   ├── searchHistoryService.ts         # 搜索历史服务
│   ├── aiPersonalizedNutritionService.ts # AI个性化营养服务
│   ├── shoppingListService.ts          # 购物清单服务
│   ├── nutritionAnalysisService.ts      # 营养分析服务
│   ├── communityService.ts             # 社区服务
│   ├── videoTutorialService.ts         # 视频教程服务
│   ├── tcmConstitutionService.ts       # 中医体质服务
│   ├── videoService.ts                 # 视频服务
│   └── tauriVideoService.ts            # Tauri视频服务
│   ├── aiProviders/                    # AI提供商实现
│   │   ├── index.ts                   # AI提供商工厂和入口
│   │   ├── baseProvider.ts            # AI提供商基础接口
│   │   ├── mockProvider.ts            # 模拟AI提供商
│   │   ├── glmProvider.ts             # 智谱AI提供商
│   │   ├── anthropicProvider.ts       # Anthropic提供商
│   │   ├── geminiProvider.ts          # Google Gemini提供商
│   │   ├── deepseekProvider.ts        # DeepSeek提供商
│   │   ├── moonshotProvider.ts        # Moonshot提供商
│   │   ├── qwenProvider.ts            # 通义千问提供商
│   │   ├── hunyuanProvider.ts         # 腾讯混元提供商
│   │   ├── openaiProvider.ts          # OpenAI兼容提供商
│   │   ├── paramAdapter.ts            # 参数适配器
│   │   └── promptBuilder.ts           # Prompt构建器
│   └── database/                      # 数据库访问层
│       ├── aiConfigService.ts         # AI配置数据库服务
│       ├── dataAccess.ts              # 通用数据访问层
│       ├── indexedDBStorage.ts        # IndexedDB存储实现
│       └── sqliteStorage.ts           # SQLite存储实现
├── stores/                # Pinia状态管理
│   ├── recipe.ts                        # 菜谱状态
│   └── theme.ts                         # 主题状态
├── styles/                # 全局样式文件
│   ├── analytics.scss                  # 分析页面样式
│   ├── ai-recipe.scss                  # AI菜谱样式
│   └── icon-fixes.scss                 # 图标修复样式
├── types/                 # TypeScript类型定义
│   ├── env.d.ts                         # 环境类型定义
│   └── recipe.ts                       # 菜谱类型定义
├── utils/                 # 工具函数
│   ├── pwa.ts                           # PWA工具
│   ├── sqliteInitializer.ts            # SQLite初始化器
│   ├── performance.ts                   # 性能工具
│   ├── errorHandler.ts                  # 错误处理
│   ├── cacheUtils.ts                    # 缓存工具
│   ├── apiCache.ts                     # API缓存
│   ├── aiUtils.ts                      # AI工具
│   ├── multimediaUtils.ts              # 多媒体工具
│   ├── ingredientImages.ts             # 食材图片
│   ├── ingredientIconMapper.ts         # 食材图标映射
│   ├── idGenerator.ts                  # ID生成器
│   └── formatUtils.ts                  # 格式化工具
├── views/                 # 页面视图组件
│   ├── HomeView.vue                    # 首页
│   ├── RecipeDetailView.vue            # 菜谱详情页
│   ├── FavoritesView.vue               # 收藏页
│   ├── CommunityView.vue               # 社区页
│   ├── SearchView.vue                  # 搜索页
│   ├── ShoppingListView.vue            # 购物清单页
├── App.vue               # 根组件
└── main.ts               # 应用入口文件
```

## 📂 主要模块说明

### 🧩 components (组件)

- `ai/` - AI相关功能组件，如API配置、模型选择等
- `analytics/` - 数据分析可视化组件
- `common/` - 通用UI组件，如按钮、模态框等
- `layout/` - 页面布局组件，如导航栏、侧边栏等
- `monitoring/` - 系统监控相关组件
- `recipe/` - 菜谱相关的业务组件

### 🔄 composables (组合式函数)

Vue 3的组合式函数，封装可复用的逻辑，如：
- 状态管理逻辑
- API调用封装
- 数据处理逻辑

### ⚙️ config (配置)

全局配置文件，包括：
- AI服务配置
- 应用基础配置
- 路由配置

### 📊 data (静态数据)

应用所需的静态数据文件，如：
- 食材分类数据
- 烹饪方式数据
- 营养成分数据

### 🗃️ models (数据模型)

TypeScript数据模型定义，包括：
- 用户模型
- 菜谱模型
- 收藏模型
- 搜索历史模型

### 🚦 router (路由)

Vue Router配置，定义应用的路由规则。

### 🛠️ services (服务层)

业务逻辑的核心实现：
- `aiProviders/` - 各种AI提供商的API实现
- `cache/` - 缓存服务，支持多种淘汰策略
- `database/` - 数据库访问层，统一SQLite和IndexedDB接口
- `monitoring/` - 性能监控服务

### 📦 stores (状态管理)

使用Pinia进行状态管理，包括：
- 菜谱状态
- 用户偏好设置
- UI状态管理

### 🎨 styles (样式)

全局样式文件：
- CSS变量定义
- 通用样式类
- 主题样式

### 📐 types (类型定义)

TypeScript类型定义文件：
- 接口定义
- 枚举类型
- 工具类型

### 🔧 utils (工具函数)

通用工具函数：
- 数据处理工具
- 格式化工具
- 工具类函数

### 🖼️ views (页面视图)

应用的页面组件：
- 首页
- 菜谱详情页
- 收藏页
- 个人中心页
- AI测试页

## 📁 其他重要目录

### 📂 src-tauri

Tauri 桌面应用配置：
```
src-tauri/
├── src/                  # Rust 源代码
│   ├── main.rs          # 主入口文件
│   └── lib.rs           # 库文件
├── tauri.conf.json      # Tauri 配置文件
├── Cargo.toml           # Rust 项目配置
├── Cargo.lock           # 依赖锁定文件
├── gen/                 # 生成的构建文件
└── target/              # Rust 编译输出
```

### 📂 public

存放不需要编译处理的静态资源：
- `images/` - 图片资源，包括菜谱图片和图标
- `videos/` - 视频文件和教程
- `favicon.ico` - 网站图标
- `manifest.json` - PWA配置文件
- `vite.svg` - Vite SVG图标

### 📂 scripts

开发和管理脚本：
- `setup-chinese-input.sh` - 中文输入法设置脚本
- 数据库初始化和维护脚本

### 📂 data

SQLite数据库文件存储位置：
- `chefmind.db` - 主数据库文件（通过 `npm run db:init` 创建）
- 数据库仅在初始化后存在，支持完整的菜谱、用户、收藏等数据存储

### 📂 dist

构建输出目录：
- Web应用构建文件
- 静态资源
- 服务工作者文件

## 🚀 技术栈和架构

### 前端技术栈
- **Vue 3** - 使用 Composition API 和 TypeScript
- **Vite** - 现代化构建工具
- **Element Plus** - UI 组件库
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **SCSS** - 样式预处理器
- **Tailwind CSS** - 原子化 CSS 框架

### 桌面应用技术栈
- **Tauri v2** - 跨平台桌面应用框架
- **Rust** - 系统级编程语言
- **SQLite** - 轻量级数据库

### AI 服务集成
- **多AI提供商支持** - OpenAI、GLM、Anthropic、Gemini、DeepSeek、Moonshot、Qwen、Hunyuan
- **智能缓存系统** - 多层缓存策略
- **个性化推荐** - AI驱动的菜谱推荐
- **营养分析** - 智能营养成分分析

### 数据架构
- **SQLite** - 主数据库
- **IndexedDB** - 浏览器端存储
- **多层缓存** - 内存缓存 + 持久化缓存
- **数据同步** - 跨平台数据同步