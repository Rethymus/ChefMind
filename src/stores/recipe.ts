import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Recipe, Ingredient, CookingMethod, Constraints } from '@/types/recipe'
import { recipeService } from '@/services/recipeService'

export const useRecipeStore = defineStore('recipe', () => {
  // 状态
  const selectedIngredients = ref<Ingredient[]>([])
  const selectedMethods = ref<CookingMethod[]>([])
  const constraints = ref<Constraints>({
    time: null,
    people: null,
    difficulty: null,
    taste: null
  })
  const currentStep = ref(1)
  const generatedRecipes = ref<Recipe[]>([])
  const isGenerating = ref(false)
  const savedRecipes = ref<Recipe[]>([])

  // 计算属性
  const canProceedToStep2 = computed(() => selectedIngredients.value.length > 0)
  const canProceedToStep3 = computed(() => selectedMethods.value.length > 0)
  const canGenerateRecipes = computed(() => {
    return selectedIngredients.value.length > 0 && 
           selectedMethods.value.length > 0 &&
           Object.values(constraints.value).some(v => v !== null)
  })

  // 动作
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
      selectedMethods.value.push({ ...method, selected: true })
    }
  }

  const updateConstraints = (key: keyof Constraints, value: string) => {
    constraints.value[key] = value
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

  const resetToStep1 = () => {
    currentStep.value = 1
  }

  const generateRecipes = async () => {
    isGenerating.value = true
    try {
      const request = {
        ingredients: selectedIngredients.value.map(item => item.name),
        methods: selectedMethods.value.map(item => item.name),
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

  const saveRecipe = (recipe: Recipe) => {
    const existingIndex = savedRecipes.value.findIndex(item => item.id === recipe.id)
    if (existingIndex === -1) {
      savedRecipes.value.push(recipe)
      // 保存到本地存储
      localStorage.setItem('chefmind-saved-recipes', JSON.stringify(savedRecipes.value))
    }
  }

  const removeRecipe = (recipeId: string) => {
    const index = savedRecipes.value.findIndex(item => item.id === recipeId)
    if (index > -1) {
      savedRecipes.value.splice(index, 1)
      localStorage.setItem('chefmind-saved-recipes', JSON.stringify(savedRecipes.value))
    }
  }

  const loadSavedRecipes = () => {
    const saved = localStorage.getItem('chefmind-saved-recipes')
    if (saved) {
      savedRecipes.value = JSON.parse(saved)
    }
  }

  const resetSelection = () => {
    selectedIngredients.value = []
    selectedMethods.value = []
    constraints.value = {
      time: null,
      people: null,
      difficulty: null,
      taste: null
    }
    generatedRecipes.value = []
    currentStep.value = 1
  }

  return {
    // 状态
    selectedIngredients,
    selectedMethods,
    constraints,
    currentStep,
    generatedRecipes,
    isGenerating,
    savedRecipes,
    
    // 计算属性
    canProceedToStep2,
    canProceedToStep3,
    canGenerateRecipes,
    
    // 动作
    toggleIngredient,
    toggleMethod,
    updateConstraints,
    nextStep,
    prevStep,
    resetToStep1,
    generateRecipes,
    saveRecipe,
    removeRecipe,
    loadSavedRecipes,
    resetSelection
  }
})