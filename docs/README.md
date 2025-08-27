# ChefMind 智食谱文档

欢迎来到 ChefMind 智食谱项目的文档中心。本文档提供了项目的详细信息、架构说明和开发指南。

## 目录

- [项目概述](#项目概述)
- [快速开始](#快速开始)
- [架构设计](#架构设计)
- [API文档](#api文档)
- [组件库](#组件库)
- [开发指南](#开发指南)
- [常见问题](#常见问题)

## 项目概述

ChefMind 智食谱是一个基于AI技术的智能菜谱生成平台，通过三步式交互帮助用户快速找到适合的菜谱。用户只需选择食材、烹饪方式和约束条件，AI就能生成个性化的菜谱推荐，并提供详细的制作指导。

### 核心特色

- AI智能生成 - 基于用户选择智能推荐菜谱
- 三步式交互 - 食材选择 → 烹饪方式 → 约束条件
- 响应式设计 - 完美适配移动端和桌面端
- 暗色主题 - 支持亮色/暗色主题切换
- 多媒体跳转 - 一键跳转B站、抖音、下厨房等平台
- 评分系统 - 难度星级、营养评分、时间估算
- 详细指导 - 完整制作步骤和营养信息

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

### 启动开发服务器

```bash
# 启动开发服务器
npm run dev

# 或
yarn dev
```

访问 [http://localhost:5173](http://localhost:5173) 查看应用。

## 架构设计

ChefMind 智食谱采用现代前端架构设计，基于 Vue 3 + TypeScript + Vite 构建。

### 技术栈

- **前端框架**: Vue 3 (Composition API)
- **类型系统**: TypeScript
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **样式处理**: Sass + CSS变量
- **HTTP客户端**: Axios
- **工具库**: lodash-es, @vueuse/core

### 目录结构

```
src/
├── components/         # 可复用组件
│   ├── common/         # 通用组件
│   ├── layout/         # 布局组件
│   └── recipe/         # 菜谱相关组件
├── views/              # 页面视图
├── stores/             # Pinia状态管理
├── services/           # API服务层
├── types/              # TypeScript类型定义
├── data/               # 模拟数据
├── styles/             # 全局样式
├── router/             # 路由配置
├── composables/        # 组合式API
├── utils/              # 工具函数
├── App.vue             # 根组件
└── main.ts             # 应用入口
```

## API文档

### 菜谱生成API

```typescript
// 生成菜谱
generateRecipe(params: RecipeParams): Promise<Recipe[]>

// 参数类型
interface RecipeParams {
  ingredients: string[];      // 选择的食材
  cookingMethods: string[];   // 烹饪方式
  constraints: {
    time?: string;            // 烹饪时间
    people?: string;          // 用餐人数
    difficulty?: string;      // 难度
    taste?: string;           // 口味
  };
}

// 返回类型
interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  steps: Step[];
  nutrition: Nutrition;
  rating: Rating;
  // ...其他字段
}
```

### 用户API

```typescript
// 用户登录
login(credentials: Credentials): Promise<User>

// 获取用户信息
getUserInfo(): Promise<User>

// 更新用户偏好
updatePreferences(preferences: UserPreferences): Promise<void>
```

## 组件库

ChefMind 智食谱包含丰富的自定义组件，可在不同场景中复用。

### 核心组件

- **RecipeGenerator**: 菜谱生成主组件
- **IngredientSelector**: 食材选择组件
- **CookingMethodSelector**: 烹饪方式选择组件
- **ConstraintSelector**: 约束条件选择组件
- **RecipeCard**: 菜谱卡片组件
- **RecipeDetail**: 菜谱详情组件
- **NutritionAnalysis**: 营养分析组件
- **CookingTimer**: 烹饪计时器组件
- **ShoppingList**: 购物清单组件

## 开发指南

### 添加新组件

1. 在适当的目录下创建组件文件
2. 使用 TypeScript 和 Composition API
3. 添加组件文档和类型定义
4. 编写单元测试

示例:

```vue
<template>
  <div class="my-component">
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
  // 使用 Composition API 和 TypeScript
  import { ref, computed } from 'vue'

  // 定义Props类型
  interface Props {
    title: string
    count?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    count: 0,
  })

  // 定义Emits类型
  interface Emits {
    (e: 'update', value: string): void
  }

  const emit = defineEmits<Emits>()
</script>

<style lang="scss" scoped>
  .my-component {
    // 组件样式
  }
</style>
```

### 状态管理

使用 Pinia 进行状态管理：

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRecipeStore = defineStore('recipe', () => {
  // 状态
  const recipes = ref<Recipe[]>([])
  const currentRecipe = ref<Recipe | null>(null)

  // 计算属性
  const favoriteRecipes = computed(() => recipes.value.filter(recipe => recipe.isFavorite))

  // 方法
  const addRecipe = (recipe: Recipe) => {
    recipes.value.push(recipe)
  }

  const setCurrentRecipe = (recipe: Recipe) => {
    currentRecipe.value = recipe
  }

  return {
    recipes,
    currentRecipe,
    favoriteRecipes,
    addRecipe,
    setCurrentRecipe,
  }
})
```

## 常见问题

### 如何添加新的食材分类？

在 `src/data/ingredients.ts` 文件中添加新的分类和食材：

```typescript
export const ingredientCategories = [
  {
    id: 'vegetables',
    name: '蔬菜',
    items: [
      { id: 'tomato', name: '番茄' },
      { id: 'potato', name: '土豆' },
      // 添加新的蔬菜
    ],
  },
  // 添加新的分类
]
```

### 如何自定义主题？

ChefMind 使用 CSS 变量进行主题定制，可以在 `src/styles/theme.scss` 中修改：

```scss
:root {
  --primary-color: #ff6b6b;
  --secondary-color: #4ecdc4;
  // 添加或修改颜色变量
}

.dark-theme {
  --primary-color: #ff8e8e;
  --secondary-color: #6edfd9;
  // 暗色主题颜色变量
}
```

### 如何添加新的语言支持？

1. 在 `src/i18n/locales/` 目录下添加新的语言文件
2. 在 `src/i18n/index.ts` 中注册新语言
3. 更新 `LanguageSwitcher` 组件以支持新语言

---

如需更多帮助，请查看 [贡献指南](../CONTRIBUTING.md) 或提交 [Issue](https://github.com/yourusername/chefmind/issues)。
