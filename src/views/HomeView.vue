<template>
  <div class="home-view">
    <!-- 头部导航 -->
    <AppHeader />
    
    <!-- 主要内容 -->
    <main class="main-content">
      <div class="container">
        <!-- 功能选项卡 -->
        <div class="feature-tabs">
          <button 
            class="tab-btn"
            :class="{ active: activeTab === 'recipe' }"
            @click="activeTab = 'recipe'"
          >
            <el-icon><Dish /></el-icon>
            智能菜谱
          </button>
          <button 
            class="tab-btn"
            :class="{ active: activeTab === 'timer' }"
            @click="activeTab = 'timer'"
          >
            <el-icon><Timer /></el-icon>
            烹饪计时器
          </button>
          <button 
            class="tab-btn"
            :class="{ active: activeTab === 'shopping' }"
            @click="activeTab = 'shopping'"
          >
            <el-icon><ShoppingCart /></el-icon>
            购物清单
          </button>
          <button 
            class="tab-btn"
            :class="{ active: activeTab === 'nutrition' }"
            @click="activeTab = 'nutrition'"
          >
            <el-icon><DataAnalysis /></el-icon>
            营养分析
          </button>
        </div>

        <!-- 菜谱生成功能 -->
        <div v-show="activeTab === 'recipe'" class="tab-content">
          <ErrorBoundary 
            error-title="菜谱功能错误"
            error-message="菜谱生成功能遇到问题，请重试或刷新页面。"
            :show-error-details="true"
          >
            <!-- 步骤指示器 -->
            <StepIndicator 
              :current-step="recipeStore.currentStep" 
              @step-click="handleStepClick"
          />
          
          <!-- 步骤内容 -->
          <div class="step-content-wrapper">
            <!-- 第一步：食材选择 -->
            <IngredientSelection 
              v-show="recipeStore.currentStep === 1"
              :selected-ingredients="recipeStore.selectedIngredients"
              @ingredient-toggle="recipeStore.toggleIngredient"
            />
            
            <!-- 第二步：烹饪方式选择 -->
            <CookingMethodSelection
              v-show="recipeStore.currentStep === 2"
              :selected-methods="recipeStore.selectedMethods"
              @method-toggle="recipeStore.toggleMethod"
            />
            
            <!-- 第三步：约束条件设定 -->
            <ConstraintSelection
              v-show="recipeStore.currentStep === 3"
              :constraints="recipeStore.constraints"
              @constraint-update="recipeStore.updateConstraints"
            />
            
            <!-- 第四步：菜谱生成结果 -->
            <div v-show="recipeStore.currentStep === 4" class="results-container">
              <div class="results-main">
                <RecipeResults
                  :recipes="recipeStore.generatedRecipes"
                  :is-generating="recipeStore.isGenerating"
                  @save-recipe="recipeStore.saveRecipe"
                  @select-recipe="handleSelectRecipe"
                />
              </div>
              
              <!-- AI增强功能侧边栏 -->
              <div class="ai-sidebar">
                <AIEnhancedFeatures
                  :current-recipe="selectedRecipe"
                  :selected-ingredients="recipeStore.selectedIngredients"
                  @select-recipe="handleSelectRecipe"
                />
              </div>
            </div>
          </div>
          
          <!-- 步骤导航按钮 -->
          <StepNavigation
            :current-step="recipeStore.currentStep"
            :can-proceed-step2="recipeStore.canProceedToStep2"
            :can-proceed-step3="recipeStore.canProceedToStep3"
            :can-generate="recipeStore.canGenerateRecipes"
            @prev-step="recipeStore.prevStep"
            @next-step="recipeStore.nextStep"
            @generate-recipes="handleGenerateRecipes"
            @reset="recipeStore.resetSelection"
          />
          </ErrorBoundary>
        </div>

        <!-- 烹饪计时器功能 -->
        <div v-show="activeTab === 'timer'" class="tab-content">
          <ErrorBoundary 
            error-title="计时器功能错误"
            error-message="烹饪计时器功能遇到问题，请重试。"
          >
            <CookingTimer />
          </ErrorBoundary>
        </div>

        <!-- 购物清单功能 -->
        <div v-show="activeTab === 'shopping'" class="tab-content">
          <ErrorBoundary 
            error-title="购物清单功能错误"
            error-message="购物清单功能遇到问题，请重试。"
          >
            <ShoppingList />
          </ErrorBoundary>
        </div>

        <!-- 营养分析功能 -->
        <div v-show="activeTab === 'nutrition'" class="tab-content">
          <ErrorBoundary 
            error-title="营养分析功能错误"
            error-message="营养分析功能遇到问题，请重试。"
          >
            <NutritionAnalysis />
          </ErrorBoundary>
        </div>
      </div>
    </main>
    
    <!-- 页脚 -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRecipeStore } from '@/stores/recipe'

// 组件导入
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import StepIndicator from '@/components/recipe/StepIndicator.vue'
import IngredientSelection from '@/components/recipe/IngredientSelection.vue'
import CookingMethodSelection from '@/components/recipe/CookingMethodSelection.vue'
import ConstraintSelection from '@/components/recipe/ConstraintSelection.vue'
import RecipeResults from '@/components/recipe/RecipeResults.vue'
import StepNavigation from '@/components/recipe/StepNavigation.vue'
import CookingTimer from '@/components/recipe/CookingTimer.vue'
import ShoppingList from '@/components/recipe/ShoppingList.vue'
import NutritionAnalysis from '@/components/recipe/NutritionAnalysis.vue'
import AIEnhancedFeatures from '@/components/recipe/AIEnhancedFeatures.vue'
import type { Recipe } from '@/types/recipe'
import { globalNotification } from '@/composables/useNotification'
import { Dish, Timer, ShoppingCart, DataAnalysis } from '@element-plus/icons-vue'

const recipeStore = useRecipeStore()
const activeTab = ref('recipe')
const selectedRecipe = ref<Recipe | null>(null)

onMounted(() => {
  // 加载保存的菜谱
  recipeStore.loadSavedRecipes()
})

const handleStepClick = (step: number) => {
  // 只允许向前跳转到已完成的步骤
  if (step <= recipeStore.currentStep) {
    recipeStore.currentStep = step
  }
}

const handleGenerateRecipes = async () => {
  const { withLoadingAndErrorHandling } = globalNotification
  
  const result = await withLoadingAndErrorHandling(
    recipeStore.generateRecipes(),
    {
      loadingMessage: '正在生成个性化菜谱...',
      fullScreen: false,
      errorTitle: '菜谱生成失败',
      successMessage: undefined // 成功消息由服务层处理
    }
  )
  
  if (result) {
    // 自动选择第一个生成的菜谱
    if (recipeStore.generatedRecipes.length > 0) {
      selectedRecipe.value = recipeStore.generatedRecipes[0]
    }
  }
}

const handleSelectRecipe = (recipe: Recipe) => {
  selectedRecipe.value = recipe
}
</script>

<style lang="scss" scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.feature-tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  
  .tab-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    background: #f8f9fa;
    border: 2px solid #e9ecef;
    border-radius: 25px;
    color: #6c757d;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: #e9ecef;
      transform: translateY(-2px);
    }
    
    &.active {
      background: linear-gradient(135deg, #4ecdc4, #44a08d);
      border-color: #4ecdc4;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
    }
    
    i {
      font-size: 1.2rem;
    }
  }
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

.step-content-wrapper {
  margin: 2rem 0;
  min-height: 500px;
}

.results-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
  
  .results-main {
    min-height: 500px;
  }
  
  .ai-sidebar {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    height: fit-content;
    position: sticky;
    top: 2rem;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .main-content {
    padding: 1rem 0;
  }
  
  .feature-tabs {
    flex-direction: column;
    gap: 0.5rem;
    
    .tab-btn {
      padding: 0.75rem 1rem;
      justify-content: center;
    }
  }
  
  .results-container {
    grid-template-columns: 1fr;
    gap: 1rem;
    
    .ai-sidebar {
      position: static;
      order: -1; // 在移动端将AI功能放在顶部
    }
  }
}
</style>