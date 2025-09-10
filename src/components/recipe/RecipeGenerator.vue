<template>
  <div class="recipe-generator">
    <div class="generator-steps">
      <!-- 步骤指示器 -->
      <div class="step-indicators">
        <div
          v-for="(step, index) in steps"
          :key="index"
          :class="[
            'step-indicator',
            { active: currentStep === index, completed: currentStep > index },
          ]"
          @click="goToStep(index)"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-name">{{ step.name }}</div>
        </div>
      </div>

      <!-- 步骤内容 -->
      <div class="step-content">
        <!-- 步骤1: 食材选择 -->
        <div v-if="currentStep === 0" class="step-panel">
          <h3 class="step-title">选择您的食材</h3>
          <p class="step-description">请选择您想要使用的主要食材，至少选择1种</p>

          <div class="ingredient-categories">
            <div class="category-tabs">
              <button
                v-for="(category, index) in ingredientCategories"
                :key="index"
                :class="['category-tab', { active: activeCategory === index }]"
                @click="activeCategory = index"
              >
                {{ category.name }}
              </button>
            </div>

            <div class="ingredients-grid">
              <button
                v-for="ingredient in ingredientCategories[activeCategory].items"
                :key="ingredient"
                :class="['ingredient-item', { selected: selectedIngredients.includes(ingredient) }]"
                @click="toggleIngredient(ingredient)"
              >
                {{ ingredient }}
              </button>
            </div>
          </div>

          <div class="ingredient-recognition-section">
            <IngredientRecognition
              @add-ingredient="addRecognizedIngredient"
              @add-ingredients="addRecognizedIngredients"
              @notification="showNotification"
            />
          </div>

          <div class="custom-ingredient">
            <input
              v-model="customIngredient"
              type="text"
              placeholder="添加其他食材..."
              @keyup.enter="addCustomIngredient"
            />
            <button @click="addCustomIngredient" class="btn-add">添加</button>
          </div>

          <div class="selected-ingredients">
            <h4>已选食材:</h4>
            <div class="selected-tags">
              <div
                v-for="(ingredient, index) in selectedIngredients"
                :key="index"
                class="selected-tag"
              >
                {{ ingredient }}
                <button @click="removeIngredient(ingredient)" class="btn-remove">×</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤2: 烹饪方式 -->
        <div v-if="currentStep === 1" class="step-panel">
          <!-- EnhancedCookingMethodSelection component removed -->
        </div>

        <!-- 步骤3: 饮食限制与偏好 -->
        <div v-if="currentStep === 2" class="step-panel">
          <!-- EnhancedDietaryRestrictionSelection component removed -->
        </div>
            :initialSpiceLevel="spiceLevel"
            :initialSweetnessLevel="sweetnessLevel"
            @update:dietaryRestrictions="selectedDietaryRestrictions = $event"
            @update:healthGoals="selectedHealthGoals = $event"
            @update:allergies="selectedAllergies = $event"
            @update:flavors="selectedFlavors = $event"
            @update:regionalFlavors="selectedRegionalFlavors = $event"
            @update:specialNeeds="selectedSpecialNeeds = $event"
            @update:spiceLevel="spiceLevel = $event"
            @update:sweetnessLevel="sweetnessLevel = $event"
          />

          <div class="additional-notes">
            <h4>附加说明</h4>
            <el-input
              v-model="additionalNotes"
              type="textarea"
              :rows="4"
              placeholder="请输入任何其他饮食偏好、健康需求或特殊要求..."
            />
          </div>
        </div>

        <!-- 结果页面 -->
        <div v-if="currentStep === 3" class="step-panel results-panel">
          <div v-if="isGenerating" class="generating">
            <div class="loading-spinner"></div>
            <h3>AI正在为您生成美味食谱...</h3>
            <p>这可能需要几秒钟时间</p>
          </div>

          <div v-else-if="generatedRecipes.length > 0" class="recipe-results">
            <h3 class="results-title">为您推荐的食谱</h3>

            <div class="recipe-cards">
              <div
                v-for="recipe in generatedRecipes"
                :key="recipe.id"
                class="recipe-card"
                @click="selectRecipe(recipe)"
              >
                <div class="recipe-header">
                  <h4>{{ recipe.name }}</h4>
                  <div class="recipe-rating">
                    <span v-for="i in 5" :key="i" :class="['star', { filled: i <= recipe.rating }]"
                      >★</span
                    >
                  </div>
                </div>
                <p class="recipe-description">{{ recipe.description }}</p>
                <div class="recipe-meta">
                  <span class="cooking-time">{{ formatCookingTime(recipe.cookingTime) }}</span>
                  <span class="difficulty">{{ formatDifficulty(recipe.difficulty) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="no-results">
            <h3>没有找到匹配的食谱</h3>
            <p>请尝试调整您的选择条件</p>
          </div>
        </div>
      </div>

      <!-- 导航按钮 -->
      <div class="step-navigation">
        <button v-if="currentStep > 0" @click="prevStep" class="btn-nav btn-prev">上一步</button>

        <button
          v-if="currentStep < steps.length - 1"
          @click="nextStep"
          :disabled="!canProceed"
          class="btn-nav btn-next"
        >
          下一步
        </button>

        <button
          v-if="currentStep === steps.length - 1"
          @click="generateRecipes"
          :disabled="isGenerating"
          class="btn-nav btn-generate"
        >
          生成食谱
        </button>

        <button
          v-if="currentStep === steps.length && generatedRecipes.length > 0"
          @click="resetGenerator"
          class="btn-nav btn-reset"
        >
          重新开始
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import IngredientRecognition from './IngredientRecognition.vue'
  import { formatDifficulty, formatCookingTime } from '@/utils/formatUtils'
  import {
    useRecipeService,
    type Recipe,
    type RecipeGenerateParams,
  } from '@/services/recipeService'

  const emit = defineEmits(['recipe-selected'])

  // 服务
  const recipeService = useRecipeService()

  // 步骤管理
  const steps = [
    { name: '食材选择', required: true },
    { name: '烹饪方式', required: false },
    { name: '饮食限制', required: false },
  ]
  const currentStep = ref(0)

  // 食材相关
  const ingredientCategories = ref([
    {
      name: '蔬菜类',
      items: [
        '白菜',
        '萝卜',
        '胡萝卜',
        '土豆',
        '番茄',
        '黄瓜',
        '茄子',
        '豆角',
        '韭菜',
        '菠菜',
        '生菜',
        '芹菜',
        '洋葱',
        '青椒',
        '冬瓜',
        '南瓜',
        '丝瓜',
        '苦瓜',
        '西葫芦',
        '莲藕',
        '山药',
        '豆芽',
      ],
    },
    {
      name: '肉类',
      items: [
        '猪肉',
        '牛肉',
        '羊肉',
        '鸡肉',
        '鸭肉',
        '鹅肉',
        '火鸡',
        '兔肉',
        '猪排骨',
        '牛排',
        '鸡翅',
        '鸡腿',
        '鸡胸肉',
        '猪肚',
        '牛肚',
        '猪肝',
        '牛肝',
        '羊肝',
      ],
    },
    {
      name: '海鲜类',
      items: [
        '鱼',
        '虾',
        '蟹',
        '贝类',
        '鱿鱼',
        '章鱼',
        '海参',
        '龙虾',
        '三文鱼',
        '金枪鱼',
        '带鱼',
        '鲈鱼',
        '黄鱼',
        '鲤鱼',
        '草鱼',
        '鲫鱼',
      ],
    },
    {
      name: '豆制品',
      items: [
        '豆腐',
        '豆干',
        '豆皮',
        '腐竹',
        '豆腐脑',
        '豆腐丝',
        '豆腐泡',
        '豆腐乳',
        '豆浆',
        '豆芽',
      ],
    },
    {
      name: '主食类',
      items: [
        '米饭',
        '面条',
        '馒头',
        '包子',
        '饺子',
        '面包',
        '粥',
        '意大利面',
        '通心粉',
        '河粉',
        '米粉',
        '方便面',
        '挂面',
        '拉面',
        '刀削面',
        '炒饭',
        '炒面',
      ],
    },
  ])
  const activeCategory = ref(0)
  const selectedIngredients = ref<string[]>([])
  const customIngredient = ref('')

  import type { CookingMethod } from '@/types/recipe'
  import { cookingMethods as allCookingMethods } from '@/data/cookingMethods'

  // 烹饪方式
  const selectedMethodObjects = ref<CookingMethod[]>([])
  const selectedMethodIds = ref<string[]>([])
  const noMethodRestriction = ref(false)

  // 饮食限制与偏好
  const selectedDietaryRestrictions = ref<string[]>([])
  const selectedHealthGoals = ref<string[]>([])
  const selectedAllergies = ref<string[]>([])
  const selectedFlavors = ref<string[]>([])
  const selectedRegionalFlavors = ref<string[]>([])
  const selectedSpecialNeeds = ref<string[]>([])
  const spiceLevel = ref('medium')
  const sweetnessLevel = ref('medium')
  const additionalNotes = ref('')

  // 生成结果
  const isGenerating = ref(false)
  const generatedRecipes = ref<Recipe[]>([])

  // 计算属性
  const canProceed = computed(() => {
    if (currentStep.value === 0) {
      return selectedIngredients.value.length > 0
    }
    return true
  })

  // 步骤导航
  const nextStep = () => {
    if (currentStep.value < steps.length - 1) {
      currentStep.value++
    }
  }

  const prevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  const goToStep = (step: number) => {
    // 只允许跳转到已完成的步骤或下一个步骤
    if (step <= currentStep.value + 1 && step >= 0) {
      currentStep.value = step
    }
  }

  // 食材相关
  const toggleIngredient = (ingredient: string) => {
    const index = selectedIngredients.value.indexOf(ingredient)
    if (index > -1) {
      selectedIngredients.value.splice(index, 1)
    } else {
      selectedIngredients.value.push(ingredient)
    }
  }

  const addCustomIngredient = () => {
    if (customIngredient.value.trim()) {
      selectedIngredients.value.push(customIngredient.value.trim())
      customIngredient.value = ''
    }
  }

  const removeIngredient = (ingredient: string) => {
    const index = selectedIngredients.value.indexOf(ingredient)
    if (index > -1) {
      selectedIngredients.value.splice(index, 1)
    }
  }

  // 食材识别相关
  const addRecognizedIngredient = (ingredient: string) => {
    if (!selectedIngredients.value.includes(ingredient)) {
      selectedIngredients.value.push(ingredient)
    }
  }

  const addRecognizedIngredients = (ingredients: string[]) => {
    ingredients.forEach(ingredient => {
      if (!selectedIngredients.value.includes(ingredient)) {
        selectedIngredients.value.push(ingredient)
      }
    })
  }

  const showNotification = (notification: { type: string; title: string; message?: string }) => {
    // 触发全局通知事件
    const event = new CustomEvent('notification', {
      detail: notification,
    })
    window.dispatchEvent(event)
  }

  // 更新烹饪方式选择
  const updateSelectedMethods = (methodIds: string[]) => {
    selectedMethodIds.value = methodIds
    selectedMethodObjects.value = allCookingMethods.filter(method => methodIds.includes(method.id))
  }

  // 生成食谱
  const generateRecipes = async () => {
    if (selectedIngredients.value.length === 0) {
      return
    }

    isGenerating.value = true
    currentStep.value = 3

    try {
      // 准备生成参数
      const params: RecipeGenerateParams = {
        ingredients: selectedIngredients.value,
        cookingMethods: noMethodRestriction.value
          ? []
          : selectedMethodObjects.value.map(m => m.name),
        noMethodRestriction: noMethodRestriction.value,
        dietaryRestrictions: selectedDietaryRestrictions.value,
        healthGoals: selectedHealthGoals.value,
        flavorPreferences: selectedFlavors.value,
        additionalNotes: additionalNotes.value,
        allergies: selectedAllergies.value,
        regionalFlavors: selectedRegionalFlavors.value,
        specialNeeds: selectedSpecialNeeds.value,
      }

      // 调用AI生成食谱
      const recipes = await recipeService.generateRecipes(params)
      generatedRecipes.value = recipes
    } catch (error) {
      console.error('生成食谱失败:', error)
      showNotification({
        type: 'error',
        title: '生成失败',
        message: '无法生成食谱，请稍后再试',
      })
      generatedRecipes.value = []
    } finally {
      isGenerating.value = false
    }
  }

  // 选择食谱
  const selectRecipe = (recipe: Recipe) => {
    emit('recipe-selected', recipe)
  }

  // 重置生成器
  const resetGenerator = () => {
    currentStep.value = 0
    selectedIngredients.value = []
    selectedMethodIds.value = []
    selectedMethodObjects.value = []
    noMethodRestriction.value = false
    selectedDietaryRestrictions.value = []
    selectedHealthGoals.value = []
    selectedAllergies.value = []
    selectedFlavors.value = []
    selectedRegionalFlavors.value = []
    selectedSpecialNeeds.value = []
    spiceLevel.value = 'medium'
    sweetnessLevel.value = 'medium'
    additionalNotes.value = ''
    generatedRecipes.value = []
  }
</script>

<style scoped>
  .recipe-generator {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    background-color: var(--bg-color);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .generator-steps {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  /* 步骤指示器 */
  .step-indicators {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    position: relative;
  }

  .step-indicators::before {
    content: '';
    position: absolute;
    top: 25px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--border-color);
    z-index: 1;
  }

  .step-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .step-number {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: var(--bg-color);
    border: 2px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 10px;
    transition: all 0.3s ease;
  }

  .step-indicator.active .step-number {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  .step-indicator.completed .step-number {
    background-color: var(--success-color);
    color: white;
    border-color: var(--success-color);
  }

  .step-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-color);
  }

  /* 步骤内容 */
  .step-content {
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    padding: 30px;
    min-height: 400px;
  }

  .step-panel {
    animation: fadeIn 0.5s ease;
  }

  .step-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 10px;
    color: var(--heading-color);
  }

  .step-description {
    font-size: 16px;
    color: var(--text-color-secondary);
    margin-bottom: 30px;
  }

  /* 食材选择 */
  .ingredient-categories {
    margin-bottom: 30px;
  }

  .category-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .category-tab {
    padding: 10px 20px;
    border-radius: 30px;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    font-weight: 500;
  }

  .category-tab.active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  .ingredients-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
  }

  .ingredient-item {
    padding: 10px;
    border-radius: 8px;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    font-size: 14px;
  }

  .ingredient-item:hover {
    background-color: var(--hover-color);
  }

  .ingredient-item.selected {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  .ingredient-recognition-section {
    margin-bottom: 20px;
    border-radius: 8px;
    overflow: hidden;
  }

  .custom-ingredient {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .custom-ingredient input {
    flex: 1;
    padding: 10px 15px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-color);
    font-size: 14px;
  }

  .btn-add {
    padding: 10px 20px;
    border-radius: 8px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
  }

  .btn-add:hover {
    background-color: var(--primary-color-dark);
  }

  .selected-ingredients h4 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 10px;
    color: var(--heading-color);
  }

  .selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .selected-tag {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 12px;
    border-radius: 20px;
    background-color: var(--primary-color);
    color: white;
    font-size: 14px;
  }

  .btn-remove {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin-left: 5px;
  }

  /* 烹饪方式 */
  .cooking-methods {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 15px;
  }

  .method-item {
    padding: 15px 10px;
    border-radius: 8px;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    font-size: 16px;
  }

  .method-item:hover {
    background-color: var(--hover-color);
  }

  .method-item.selected {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  /* 不限制烹饪方式选项 */
  .no-restriction-option {
    margin-top: 20px;
    padding: 15px;
    background-color: var(--bg-color);
    border-radius: 8px;
    border: 1px dashed var(--border-color);
  }

  /* 约束条件 */
  .constraints {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
    margin-bottom: 30px;
  }

  .constraint-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    border-radius: 8px;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .constraint-item:hover {
    background-color: var(--hover-color);
  }

  .constraint-item.selected {
    background-color: var(--primary-color-light);
    border-color: var(--primary-color);
  }

  .constraint-icon {
    font-size: 24px;
  }

  .constraint-info h4 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 5px 0;
    color: var(--heading-color);
  }

  .constraint-info p {
    font-size: 14px;
    color: var(--text-color-secondary);
    margin: 0;
  }

  .additional-notes h4 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 10px;
    color: var(--heading-color);
  }

  .additional-notes textarea {
    width: 100%;
    height: 100px;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-color);
    font-size: 14px;
    resize: vertical;
  }

  /* 结果页面 */
  .results-panel {
    min-height: 500px;
  }

  .generating {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid var(--border-color);
    border-top: 5px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .generating h3 {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 10px 0;
    color: var(--heading-color);
  }

  .generating p {
    font-size: 16px;
    color: var(--text-color-secondary);
    margin: 0;
  }

  .recipe-results {
    animation: fadeIn 0.5s ease;
  }

  .results-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
    color: var(--heading-color);
  }

  .recipe-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .recipe-card {
    background-color: var(--bg-color);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .recipe-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border-color: var(--primary-color);
  }

  .recipe-image {
    height: 180px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .recipe-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px 0;
  }

  .recipe-header h4 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: var(--heading-color);
  }

  .recipe-rating {
    display: flex;
    gap: 2px;
  }

  .star {
    color: var(--border-color);
    transition: color 0.3s ease;
  }

  .star.filled {
    color: var(--warning-color);
  }

  .recipe-description {
    font-size: 14px;
    color: var(--text-color-secondary);
    margin: 10px 0;
    line-height: 1.5;
    padding: 0 20px;
  }

  .recipe-meta {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: var(--text-color-secondary);
    padding: 0 20px 15px;
  }

  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
  }

  .no-results h3 {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 10px 0;
    color: var(--heading-color);
  }

  .no-results p {
    font-size: 16px;
    color: var(--text-color-secondary);
    margin: 0;
  }

  /* 导航按钮 */
  .step-navigation {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
  }

  .btn-nav {
    padding: 12px 25px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 16px;
  }

  .btn-prev {
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    color: var(--text-color);
  }

  .btn-prev:hover {
    background-color: var(--hover-color);
  }

  .btn-next,
  .btn-generate {
    background-color: var(--primary-color);
    border: none;
    color: white;
  }

  .btn-next:hover,
  .btn-generate:hover {
    background-color: var(--primary-color-dark);
  }

  .btn-next:disabled,
  .btn-generate:disabled {
    background-color: var(--disabled-color);
    cursor: not-allowed;
  }

  .btn-reset {
    background-color: var(--warning-color);
    border: none;
    color: white;
  }

  .btn-reset:hover {
    background-color: var(--warning-color-dark);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .recipe-generator {
      padding: 15px;
    }

    .step-content {
      padding: 20px;
    }

    .step-name {
      display: none;
    }

    .ingredients-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }

    .recipe-cards {
      grid-template-columns: 1fr;
    }

    .constraints {
      grid-template-columns: 1fr;
    }

    .btn-nav {
      padding: 10px 20px;
      font-size: 14px;
    }
  }
</style>
