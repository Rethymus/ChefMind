# ChefMind 开发指南

这是一份详细的开发指南，帮助开发者了解项目架构、开发流程和最佳实践。

## 📁 项目架构

### 核心目录结构

```
src/
├── components/          # 组件库
│   ├── ai/             # AI 相关组件
│   ├── analytics/      # 数据分析组件
│   ├── common/         # 通用组件
│   ├── layout/         # 布局组件
│   └── recipe/         # 菜谱组件
├── composables/        # 组合式函数
├── services/           # 服务层
├── stores/             # 状态管理
├── types/              # 类型定义
├── utils/              # 工具函数
└── views/              # 页面组件
```

### 架构模式

项目采用以下架构模式：

1. **组件化架构**: 基于 Vue 3 Composition API
2. **服务层模式**: 业务逻辑与组件分离
3. **状态管理**: Pinia 集中式状态管理
4. **类型安全**: TypeScript 严格模式

## 🔧 开发工具链

### 必需工具

- **Node.js** 18+
- **npm** 或 **yarn**
- **Git**
- **VS Code**（推荐）

### VS Code 扩展推荐

```json
{
  "recommendations": [
    "Vue.volar",
    "Vue.vscode-typescript-vue-plugin",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss"
  ]
}
```

## 🎯 开发规范

### 代码风格

#### Vue 组件

```vue
<template>
  <div class="recipe-card">
    <h3 class="recipe-card__title">{{ recipe.name }}</h3>
    <p class="recipe-card__description">{{ recipe.description }}</p>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { Recipe } from '@/types/recipe'

  interface Props {
    recipe: Recipe
    showDetails?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    showDetails: false,
  })

  const emit = defineEmits<{
    click: [recipe: Recipe]
    favorite: [recipeId: string]
  }>()

  const displayName = computed(() => {
    return props.recipe.name.slice(0, 20)
  })
</script>

<style lang="scss" scoped>
  .recipe-card {
    &__title {
      font-size: 1.2rem;
      font-weight: bold;
    }

    &__description {
      color: var(--text-color-secondary);
    }
  }
</style>
```

#### TypeScript 接口

```typescript
// types/recipe.ts
export interface Recipe {
  id: string
  name: string
  description: string
  ingredients: Ingredient[]
  steps: CookingStep[]
  nutrition: NutritionInfo
  metadata: RecipeMetadata
}

export interface Ingredient {
  id: string
  name: string
  amount: number
  unit: string
  category: IngredientCategory
}
```

#### 服务层

```typescript
// services/recipeService.ts
import type { Recipe, RecipeGenerationRequest } from '@/types/recipe'
import { apiClient } from '@/utils/apiClient'

export class RecipeService {
  async generateRecipe(request: RecipeGenerationRequest): Promise<Recipe> {
    try {
      const response = await apiClient.post('/recipes/generate', request)
      return response.data
    } catch (error) {
      throw new Error(`Failed to generate recipe: ${error.message}`)
    }
  }

  async getRecipeById(id: string): Promise<Recipe> {
    const response = await apiClient.get(`/recipes/${id}`)
    return response.data
  }
}

export const recipeService = new RecipeService()
```

#### Pinia Store

```typescript
// stores/recipe.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Recipe } from '@/types/recipe'
import { recipeService } from '@/services/recipeService'

export const useRecipeStore = defineStore('recipe', () => {
  const recipes = ref<Recipe[]>([])
  const loading = ref(false)

  const favoriteRecipes = computed(() => recipes.value.filter(recipe => recipe.metadata.isFavorite))

  async function generateRecipe(request: RecipeGenerationRequest) {
    loading.value = true
    try {
      const recipe = await recipeService.generateRecipe(request)
      recipes.value.push(recipe)
      return recipe
    } finally {
      loading.value = false
    }
  }

  return {
    recipes,
    loading,
    favoriteRecipes,
    generateRecipe,
  }
})
```

### 命名约定

#### 文件命名

- **组件**: PascalCase (e.g., `RecipeCard.vue`)
- **页面**: PascalCase + "View" 后缀 (e.g., `HomeView.vue`)
- **工具函数**: camelCase (e.g., `formatDate.ts`)
- **服务**: camelCase + "Service" 后缀 (e.g., `aiService.ts`)

#### 变量命名

```typescript
// ✅ 好的命名
const userPreferences = ref<UserPreferences>()
const isLoading = ref(false)
const generateRecipe = async () => {}

// ❌ 避免的命名
const data = ref()
const flag = ref(false)
const fn = async () => {}
```

### Git 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 新功能
git commit -m "feat(recipe): add AI recipe generation"

# 修复 bug
git commit -m "fix(ui): fix mobile navigation layout"

# 文档更新
git commit -m "docs: update development guide"

# 代码重构
git commit -m "refactor(services): extract common API logic"
```

## 🧪 测试策略

### 单元测试

```typescript
// tests/components/RecipeCard.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import RecipeCard from '@/components/recipe/RecipeCard.vue'
import type { Recipe } from '@/types/recipe'

const mockRecipe: Recipe = {
  id: '1',
  name: '宫保鸡丁',
  description: '经典川菜',
  // ... 其他属性
}

describe('RecipeCard', () => {
  it('renders recipe name correctly', () => {
    const wrapper = mount(RecipeCard, {
      props: { recipe: mockRecipe },
    })

    expect(wrapper.find('.recipe-card__title').text()).toBe('宫保鸡丁')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(RecipeCard, {
      props: { recipe: mockRecipe },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')[0]).toEqual([mockRecipe])
  })
})
```

### E2E 测试

```typescript
// tests/e2e/recipe-generation.spec.ts
import { test, expect } from '@playwright/test'

test('recipe generation flow', async ({ page }) => {
  await page.goto('/')

  // 选择食材
  await page.click('[data-testid="ingredient-tomato"]')
  await page.click('[data-testid="ingredient-egg"]')

  // 选择烹饪方式
  await page.click('[data-testid="cooking-method-stir-fry"]')

  // 设置约束条件
  await page.selectOption('[data-testid="time-constraint"]', '30')

  // 生成菜谱
  await page.click('[data-testid="generate-recipe"]')

  // 验证结果
  await expect(page.locator('[data-testid="recipe-result"]')).toBeVisible()
  await expect(page.locator('.recipe-name')).toContainText('西红柿炒蛋')
})
```

## 🔄 开发工作流

### 功能开发流程

1. **创建功能分支**

   ```bash
   git checkout -b feature/recipe-rating-system
   ```

2. **开发阶段**
   - 编写代码
   - 运行本地测试
   - 代码自查

3. **提交代码**

   ```bash
   git add .
   git commit -m "feat(recipe): add rating system"
   git push origin feature/recipe-rating-system
   ```

4. **创建 Pull Request**
   - 详细描述变更内容
   - 添加相关截图
   - 请求代码审查

5. **代码审查**
   - 响应审查意见
   - 修复问题
   - 更新代码

6. **合并代码**
   - 审查通过后合并到主分支
   - 删除功能分支

### 发布流程

1. **版本规划**
   - 确定版本号
   - 更新 CHANGELOG.md
   - 创建发布分支

2. **测试验证**
   - 运行完整测试套件
   - 手动测试核心功能
   - 性能测试

3. **发布部署**
   - 构建生产版本
   - 部署到预发布环境
   - 验证部署结果

4. **正式发布**
   - 合并到 main 分支
   - 创建 Git tag
   - 部署到生产环境

## 🐛 调试技巧

### Vue DevTools

安装 Vue DevTools 浏览器扩展，用于调试：

- 组件状态
- Pinia store
- 事件追踪
- 性能分析

### 日志调试

```typescript
// utils/logger.ts
const isDev = import.meta.env.DEV

export const logger = {
  debug: (message: string, data?: any) => {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, data)
    }
  },

  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error)
    // 生产环境可以发送到错误监控服务
  },
}
```

### 性能调试

```typescript
// utils/performance.ts
export function measurePerformance<T>(fn: () => T, label: string): T {
  const start = performance.now()
  const result = fn()
  const end = performance.now()

  logger.debug(`${label} took ${end - start} milliseconds`)
  return result
}
```

## 📚 学习资源

### 官方文档

- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Element Plus 官方文档](https://element-plus.org/)
- [Pinia 官方文档](https://pinia.vuejs.org/)

### 推荐阅读

- [Vue 3 深入指南](https://vue3js.cn/docs/zh/)
- [TypeScript 入门教程](https://ts.xcatliu.com/)
- [前端架构设计](https://github.com/fouber/blog)

### 社区资源

- [Vue.js 中文社区](https://www.vue-js.com/)
- [掘金前端](https://juejin.cn/frontend)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/vue.js)

## 🤝 贡献指南

### 报告问题

提交 Issue 时请包含：

- 问题描述
- 复现步骤
- 期望行为
- 实际行为
- 环境信息

### 提交功能请求

提交 Feature Request 时请包含：

- 功能描述
- 使用场景
- 期望的 API 设计
- 相关截图或原型

### 代码贡献

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request
5. 响应审查意见

感谢你对 ChefMind 项目的贡献！🎉
