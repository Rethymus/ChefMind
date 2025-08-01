// ChefMind 智食谱 - 菜谱状态管理

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Ingredient, CookingMethod, Recipe, Constraints } from '@/types/recipe'
import { recipeService } from '@/services/recipeService'

export const useRecipeStore = defineStore('recipe', () => {
  // 状态
  const selectedIngredients = ref<Ingredient[]>([])
  const selectedMethods = ref<CookingMethod[]>([])
  const constraints = ref<Constraints>({
    cookingTime: null,
    difficulty: null,
    servings: null,
    dietaryRestrictions: [],
    excludeIngredients: [],
    // 兼容字段
    time: null,
    people: null,
    taste: null
  })
  const generatedRecipes = ref<Recipe[]>([])
  const currentStep = ref(1)
  const isGenerating = ref(false)
  const savedRecipes = ref<Recipe[]>([])

  // 计算属性
  const canProceedToStep2 = computed(() => {
    return selectedIngredients.value.length > 0
  })

  const canProceedToStep3 = computed(() => {
    return selectedMethods.value.length > 0
  })

  const canGenerateRecipes = computed(() => {
    return selectedIngredients.value.length > 0 && selectedMethods.value.length > 0
  })

  // 方法
  const toggleIngredient = (ingredient: Ingredient) => {
    const index = selectedIngredients.value.findIndex(item => item.id === ingredient.id)
    if (index > -1) {
      selectedIngredients.value.splice(index, 1)
    } else {
      selectedIngredients.value.push({ ...ingredient, selected: true })
    }
  }

  const toggleMethod = (method: CookingMethod) => {
    const index = selectedMethods.value.findIndex(item => item.id === method.id)
    if (index > -1) {
      selectedMethods.value.splice(index, 1)
    } else {
      selectedMethods.value.push({ ...method })
    }
  }

  const updateConstraints = (newConstraints: Constraints) => {
    constraints.value = { ...newConstraints }
  }

  const nextStep = () => {
    if (currentStep.value < 4) {
      currentStep.value++
    }
  }

  const prevStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  const setStep = (step: number) => {
    if (step >= 1 && step <= 4) {
      currentStep.value = step
    }
  }

  const generateRecipes = async () => {
    try {
      isGenerating.value = true
      
      const request = {
        ingredients: selectedIngredients.value.map(ing => ing.name),
        methods: selectedMethods.value.map(method => method.name),
        constraints: constraints.value
      }

      const recipes = await recipeService.generateRecipes(request)
      generatedRecipes.value = recipes
      currentStep.value = 4
    } catch (error) {
      console.error('生成菜谱失败:', error)
      throw error
    } finally {
      isGenerating.value = false
    }
  }

  const saveRecipe = async (recipe: Recipe) => {
    try {
      const success = await recipeService.saveRecipe(recipe)
      if (success) {
        savedRecipes.value.push(recipe)
        return true
      }
      return false
    } catch (error) {
      console.error('保存菜谱失败:', error)
      return false
    }
  }

  const resetSelection = () => {
    selectedIngredients.value = []
    selectedMethods.value = []
    constraints.value = {
      cookingTime: null,
      difficulty: null,
      servings: null,
      dietaryRestrictions: [],
      excludeIngredients: [],
      // 兼容字段
      time: null,
      people: null,
      taste: null
    }
    generatedRecipes.value = []
    currentStep.value = 1
    isGenerating.value = false
  }

  const loadSavedRecipes = async () => {
    try {
      const recipes = await recipeService.getFavoriteRecipes()
      savedRecipes.value = recipes
    } catch (error) {
      console.error('加载收藏菜谱失败:', error)
    }
  }

  return {
    // 状态
    selectedIngredients,
    selectedMethods,
    constraints,
    generatedRecipes,
    currentStep,
    isGenerating,
    savedRecipes,
    
    // 计算属性
    canProceedToStep2,
    canProceedToStep3,
    canGenerateRecipes,
    
    // 方法
    toggleIngredient,
    toggleMethod,
    updateConstraints,
    nextStep,
    prevStep,
    setStep,
    generateRecipes,
    saveRecipe,
    resetSelection,
    loadSavedRecipes
  }
})