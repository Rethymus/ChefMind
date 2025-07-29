<template>
  <div class="home-view">
    <!-- 头部导航 -->
    <AppHeader />
    
    <!-- 主要内容 -->
    <main class="main-content">
      <div class="container">
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
          <RecipeResults
            v-show="recipeStore.currentStep === 4"
            :recipes="recipeStore.generatedRecipes"
            :is-generating="recipeStore.isGenerating"
            @save-recipe="recipeStore.saveRecipe"
          />
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
      </div>
    </main>
    
    <!-- 页脚 -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import { ElMessage } from 'element-plus'

// 组件导入
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import StepIndicator from '@/components/recipe/StepIndicator.vue'
import IngredientSelection from '@/components/recipe/IngredientSelection.vue'
import CookingMethodSelection from '@/components/recipe/CookingMethodSelection.vue'
import ConstraintSelection from '@/components/recipe/ConstraintSelection.vue'
import RecipeResults from '@/components/recipe/RecipeResults.vue'
import StepNavigation from '@/components/recipe/StepNavigation.vue'

const recipeStore = useRecipeStore()

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
  try {
    await recipeStore.generateRecipes()
    ElMessage.success('菜谱生成成功！')
  } catch (error) {
    ElMessage.error('生成菜谱失败，请重试')
    console.error('生成菜谱错误:', error)
  }
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

.step-content-wrapper {
  margin: 2rem 0;
  min-height: 500px;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .main-content {
    padding: 1rem 0;
  }
}
</style>