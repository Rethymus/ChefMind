# 🎨 ChefMind 组件使用指南

## 📋 概述

ChefMind 采用模块化的组件设计，提供了丰富的可复用组件。本指南详细介绍各个组件的使用方法、属性配置和最佳实践。

## 📋 目录

- [AI 组件](#ai-组件)
- [菜谱组件](#菜谱组件)
- [通用组件](#通用组件)
- [布局组件](#布局组件)
- [分析组件](#分析组件)
- [监控组件](#监控组件)

---

## 🤖 AI 组件

### CookingAssistant.vue

智能烹饪助手组件，提供 AI 烹饪建议和指导。

#### 基础用法

```vue
<template>
  <CookingAssistant
    :recipe="currentRecipe"
    :user-preferences="userPreferences"
    @suggestion-received="handleSuggestion"
    @cooking-tip="handleCookingTip"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CookingAssistant from '@/components/ai/CookingAssistant.vue';

const currentRecipe = ref(recipeData);
const userPreferences = ref(preferencesData);

const handleSuggestion = (suggestion) => {
  console.log('AI 建议:', suggestion);
};

const handleCookingTip = (tip) => {
  console.log('烹饪技巧:', tip);
};
</script>
```

#### Props

| 属性 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| recipe | Recipe | 是 | - | 当前菜谱对象 |
| userPreferences | UserPreferences | 否 | null | 用户偏好设置 |
| enabled | boolean | 否 | true | 是否启用 AI 助手 |
| autoMode | boolean | 否 | false | 自动模式 |

#### 事件

| 事件名 | 参数 | 描述 |
|--------|------|------|
| suggestion-received | suggestion | 收到 AI 建议时触发 |
| cooking-tip | tip | 收到烹饪技巧时触发 |
| error | error | 发生错误时触发 |

### IntelligentChatAssistant.vue

智能聊天助手组件，支持自然语言交互。

#### 基础用法

```vue
<template>
  <IntelligentChatAssistant
    :context="chatContext"
    :history="chatHistory"
    @message-sent="handleMessageSent"
    @response-received="handleResponse"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import IntelligentChatAssistant from '@/components/ai/IntelligentChatAssistant.vue';

const chatContext = ref({
  currentRecipe: recipeData,
  userPreferences: preferencesData
});

const chatHistory = ref([]);

const handleMessageSent = (message) => {
  console.log('发送消息:', message);
};

const handleResponse = (response) => {
  console.log('收到回复:', response);
};
</script>
```

### SmartIngredientAnalyzer.vue

智能食材分析器，支持图片识别和营养分析。

#### 基础用法

```vue
<template>
  <SmartIngredientAnalyzer
    :analysis-mode="analysisMode"
    :enable-camera="enableCamera"
    @ingredients-analyzed="handleAnalyzed"
    @nutrition-data="handleNutrition"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SmartIngredientAnalyzer from '@/components/ai/SmartIngredientAnalyzer.vue';

const analysisMode = ref('image'); // 'image' | 'text' | 'hybrid'
const enableCamera = ref(true);

const handleAnalyzed = (ingredients) => {
  console.log('识别的食材:', ingredients);
};

const handleNutrition = (nutritionData) => {
  console.log('营养数据:', nutritionData);
};
</script>
```

---

## 🍳 菜谱组件

### RecipeGenerator.vue

菜谱生成器组件，支持多种生成方式。

#### 基础用法

```vue
<template>
  <RecipeGenerator
    :initial-ingredients="initialIngredients"
    :available-filters="filters"
    @recipe-generated="handleRecipeGenerated"
    @generation-error="handleError"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import RecipeGenerator from '@/components/recipe/RecipeGenerator.vue';

const initialIngredients = ref(['鸡肉', '土豆']);
const filters = ref([
  { key: 'cookingTime', label: '烹饪时间', type: 'range' },
  { key: 'difficulty', label: '难度', type: 'select' }
]);

const handleRecipeGenerated = (recipes) => {
  console.log('生成的菜谱:', recipes);
};

const handleError = (error) => {
  console.error('生成失败:', error);
};
</script>
```

#### Props

| 属性 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| initialIngredients | string[] | 否 | [] | 初始食材列表 |
| availableFilters | Filter[] | 否 | [] | 可用过滤器 |
| generationMode | 'single' \| 'batch' | 否 | 'single' | 生成模式 |
| showAdvanced | boolean | 否 | false | 是否显示高级选项 |

### RecipeDetailView.vue

菜谱详情视图组件，展示完整的菜谱信息。

#### 基础用法

```vue
<template>
  <RecipeDetailView
    :recipe="recipe"
    :is-favorited="isFavorited"
    :user-rating="userRating"
    @favorite-toggled="handleFavoriteToggle"
    @rating-submitted="handleRating"
    @share-recipe="handleShare"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import RecipeDetailView from '@/components/recipe/RecipeDetailView.vue';

const recipe = ref(recipeData);
const isFavorited = ref(false);
const userRating = ref(0);

const handleFavoriteToggle = (favorited) => {
  isFavorited.value = favorited;
};

const handleRating = (rating) => {
  userRating.value = rating;
};

const handleShare = (platform) => {
  console.log('分享到:', platform);
};
</script>
```

### IngredientSelection.vue

食材选择组件，支持智能推荐和分类浏览。

#### 基础用法

```vue
<template>
  <IngredientSelection
    :selected-ingredients="selectedIngredients"
    :categories="ingredientCategories"
    :enable-recommendations="true"
    @selection-changed="handleSelectionChange"
    @recommendation-selected="handleRecommendation"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import IngredientSelection from '@/components/recipe/IngredientSelection.vue';

const selectedIngredients = ref([]);
const ingredientCategories = ref([
  { id: 'vegetables', name: '蔬菜', items: [...] },
  { id: 'meat', name: '肉类', items: [...] },
  { id: 'spices', name: '调料', items: [...] }
]);

const handleSelectionChange = (ingredients) => {
  selectedIngredients.value = ingredients;
};

const handleRecommendation = (ingredient) => {
  console.log('推荐食材:', ingredient);
};
</script>
```

### CookingTimer.vue

烹饪计时器组件，支持多计时器管理。

#### 基础用法

```vue
<template>
  <CookingTimer
    :steps="cookingSteps"
    :auto-start="false"
    @timer-completed="handleTimerCompleted"
    @step-changed="handleStepChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CookingTimer from '@/components/recipe/CookingTimer.vue';

const cookingSteps = ref([
  { name: '准备食材', duration: 300, description: '清洗和切配食材' },
  { name: '炒制', duration: 600, description: '中火炒制' },
  { name: '焖煮', duration: 900, description: '小火焖煮' }
]);

const handleTimerCompleted = (stepIndex) => {
  console.log('步骤完成:', stepIndex);
};

const handleStepChange = (currentStep) => {
  console.log('当前步骤:', currentStep);
};
</script>
```

---

## 🔧 通用组件

### ErrorBoundary.vue

错误边界组件，优雅处理组件错误。

#### 基础用法

```vue
<template>
  <ErrorBoundary
    :fallback="ErrorFallback"
    :max-retries="3"
    @error-captured="handleError"
  >
    <YourComponent />
  </ErrorBoundary>
</template>

<script setup lang="ts">
import ErrorBoundary from '@/components/common/ErrorBoundary.vue';

const ErrorFallback = ({ error, retry }) => (
  <div class="error-fallback">
    <h3>出现错误</h3>
    <p>{error.message}</p>
    <button onClick={retry}>重试</button>
  </div>
);

const handleError = (error) => {
  console.error('捕获错误:', error);
};
</script>
```

### EnhancedThemeToggle.vue

增强主题切换组件，支持多种主题模式。

#### 基础用法

```vue
<template>
  <EnhancedThemeToggle
    :available-themes="themes"
    :show-preview="true"
    @theme-changed="handleThemeChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EnhancedThemeToggle from '@/components/common/EnhancedThemeToggle.vue';

const themes = ref([
  { id: 'light', name: '浅色', icon: '☀️' },
  { id: 'dark', name: '深色', icon: '🌙' },
  { id: 'auto', name: '自动', icon: '🌗' }
]);

const handleThemeChange = (theme) => {
  console.log('主题切换:', theme);
};
</script>
```

### NotificationContainer.vue

通知容器组件，管理应用内通知。

#### 基础用法

```vue
<template>
  <NotificationContainer
    :position="'top-right'"
    :max-notifications="5"
    :duration="5000"
  />
</template>

<script setup lang="ts">
import { useNotification } from '@/composables/useNotification';
import NotificationContainer from '@/components/common/NotificationContainer.vue';

const { showNotification } = useNotification();

// 显示通知
showNotification({
  type: 'success',
  title: '操作成功',
  message: '菜谱已保存到收藏夹'
});
</script>
```

---

## 📐 布局组件

### AppHeader.vue

应用头部组件，包含导航和用户信息。

#### 基础用法

```vue
<template>
  <AppHeader
    :user="currentUser"
    :menu-items="menuItems"
    :show-search="true"
    @menu-click="handleMenuClick"
    @search="handleSearch"
    @user-action="handleUserAction"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppHeader from '@/components/layout/AppHeader.vue';

const currentUser = ref(userData);
const menuItems = ref([
  { id: 'home', label: '首页', icon: '🏠' },
  { id: 'recipes', label: '菜谱', icon: '🍳' },
  { id: 'favorites', label: '收藏', icon: '❤️' }
]);

const handleMenuClick = (item) => {
  console.log('菜单点击:', item);
};

const handleSearch = (query) => {
  console.log('搜索:', query);
};

const handleUserAction = (action) => {
  console.log('用户操作:', action);
};
</script>
```

### GlassFooter.vue

玻璃效果底部组件，具有现代感的设计。

#### 基础用法

```vue
<template>
  <GlassFooter
    :links="footerLinks"
    :show-social="true"
    :copyright="copyrightText"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GlassFooter from '@/components/layout/GlassFooter.vue';

const footerLinks = ref([
  { text: '关于我们', href: '/about' },
  { text: '使用条款', href: '/terms' },
  { text: '隐私政策', href: '/privacy' }
]);

const copyrightText = ref('© 2025 ChefMind. All rights reserved.');
</script>
```

---

## 📊 分析组件

### UserDashboard.vue

用户仪表板组件，展示用户数据和分析。

#### 基础用法

```vue
<template>
  <UserDashboard
    :user-id="currentUserId"
    :time-range="selectedTimeRange"
    :widgets="dashboardWidgets"
    @data-loaded="handleDataLoaded"
    @widget-click="handleWidgetClick"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UserDashboard from '@/components/analytics/UserDashboard.vue';

const currentUserId = ref('user123');
const selectedTimeRange = ref('30d');
const dashboardWidgets = ref([
  { id: 'stats', type: 'stats', title: '使用统计' },
  { id: 'favorites', type: 'chart', title: '收藏趋势' },
  { id: 'activity', type: 'timeline', title: '活动时间线' }
]);

const handleDataLoaded = (data) => {
  console.log('数据加载完成:', data);
};

const handleWidgetClick = (widget) => {
  console.log('组件点击:', widget);
};
</script>
```

---

## 📈 监控组件

### MonitoringDashboard.vue

监控仪表板组件，实时显示系统状态。

#### 基础用法

```vue
<template>
  <MonitoringDashboard
    :refresh-interval="5000"
    :show-alerts="true"
    :metrics="['cpu', 'memory', 'network']"
    @alert-triggered="handleAlert"
    @metrics-updated="handleMetricsUpdate"
  />
</template>

<script setup lang="ts">
import MonitoringDashboard from '@/components/monitoring/MonitoringDashboard.vue';

const handleAlert = (alert) => {
  console.warn('系统警报:', alert);
};

const handleMetricsUpdate = (metrics) => {
  console.log('指标更新:', metrics);
};
</script>
```

---

## 🎯 组件开发指南

### 创建新组件

1. **组件命名**
   - 使用 PascalCase 命名文件
   - 保持名称描述性和简洁

2. **组件结构**
```vue
<template>
  <!-- 组件模板 -->
</template>

<script setup lang="ts">
// 组件逻辑
import { ref, computed, onMounted } from 'vue';

// Props 定义
const props = defineProps<{
  propName: PropType;
}>();

// 事件定义
const emit = defineEmits<{
  'event-name': [payload: any];
}>();

// 响应式数据
const state = ref(initialValue);

// 计算属性
const computedValue = computed(() => {
  return props.propName * 2;
});

// 方法
const methodName = () => {
  emit('event-name', state.value);
};

// 生命周期
onMounted(() => {
  // 组件挂载后执行
});
</script>

<style scoped>
/* 组件样式 */
.component-name {
  /* 样式定义 */
}
</style>
```

### 组件最佳实践

1. **单一职责**
   - 每个组件只负责一个功能
   - 避免过度复杂的组件

2. **Props 设计**
   - 提供合理的默认值
   - 使用类型检查
   - 文档化所有属性

3. **事件处理**
   - 使用明确的事件名
   - 提供合适的载荷
   - 保持事件一致性

4. **样式管理**
   - 使用 scoped 样式
   - 遵循设计系统
   - 支持主题切换

### 组件测试

```typescript
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import MyComponent from '@/components/MyComponent.vue';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent, {
      props: {
        propName: 'test'
      }
    });

    expect(wrapper.text()).toContain('test');
  });

  it('emits events correctly', async () => {
    const wrapper = mount(MyComponent);

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('my-event')).toBeTruthy();
  });
});
```

---

## 🔗 相关资源

- [Vue 3 文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Vue Router 文档](https://router.vuejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/)