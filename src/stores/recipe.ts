// ChefMind 智食谱 - 菜谱状态管理

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Ingredient, CookingMethod, Recipe, RecipeGenerationRequest } from '@/types/recipe'
import aiRecipeService from '@/services/aiRecipeService'
import { Recipe as RecipeModel } from '@/models/Recipe'

export const useRecipeStore = defineStore('recipe', () => {
  // 状态
  const selectedIngredients = ref<Ingredient[]>([])
  const selectedMethods = ref<CookingMethod[]>([])
  const constraints = ref({
    cookingTime: null as number | null,
    difficulty: null as number | null,
    servings: null as number | null,
    dietaryRestrictions: [] as string[],
    excludeIngredients: [] as string[],
    // 兼容字段
    time: null as number | null,
    people: null as number | null,
    taste: null as string | null,
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
      selectedIngredients.value.push({ ...ingredient })
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

  const updateConstraints = (newConstraints: typeof constraints.value) => {
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

      // 构建AI菜谱生成请求
      const requests: RecipeGenerationRequest[] = []

      // 为每种选择的烹饪方式生成一个菜谱
      for (const method of selectedMethods.value) {
        const request: RecipeGenerationRequest = {
          ingredients: selectedIngredients.value.map(ing => ing.name),
          cookingMethods: [method.name],
          difficulty: constraints.value.difficulty
            ? String(constraints.value.difficulty)
            : undefined,
          cookingTime: constraints.value.cookingTime
            ? String(constraints.value.cookingTime)
            : undefined,
          servings: constraints.value.servings || undefined,
          dietaryRestrictions: constraints.value.dietaryRestrictions,
        }
        requests.push(request)
      }

      // 如果没有选择烹饪方式，生成一个通用菜谱
      if (requests.length === 0) {
        const request: RecipeGenerationRequest = {
          ingredients: selectedIngredients.value.map(ing => ing.name),
          difficulty: constraints.value.difficulty
            ? String(constraints.value.difficulty)
            : undefined,
          cookingTime: constraints.value.cookingTime
            ? String(constraints.value.cookingTime)
            : undefined,
          servings: constraints.value.servings || undefined,
          dietaryRestrictions: constraints.value.dietaryRestrictions,
        }
        requests.push(request)
      }

      // 批量生成菜谱
      const recipes = await aiRecipeService.batchGenerateRecipes(requests)
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
      // 将菜谱保存到SQLite数据库
      const recipeData = {
        title: recipe.title || recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients.map(ing => typeof ing === 'string' ? ing : ing.name),
        instructions: Array.isArray(recipe.steps) ? recipe.steps.map(step => typeof step === 'string' ? step : step.description || '') : recipe.instructions || [],
        cookingTime: typeof recipe.time === 'number' ? recipe.time : parseInt(recipe.cookingTime) || 30,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        category: recipe.tags?.[0] || 'AI生成',
        tags: recipe.tags || ['AI生成'],
        nutritionInfo: recipe.nutritionInfo || recipe.nutrition || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        },
        imageUrl: recipe.image || '',
        cookingMethods: recipe.cookingMethods || ['炒'],
        viewCount: 0,
        favoriteCount: 0,
        ratingCount: 0,
        averageRating: recipe.rating || 0
      }
      
      const savedRecipe = await RecipeModel.create(recipeData)
      
      // 更新本地状态
      const existingIndex = savedRecipes.value.findIndex(r => r.id === recipe.id)
      if (existingIndex === -1) {
        savedRecipes.value.push({
          ...recipe,
          id: savedRecipe.id.toString()
        })
      }

      return true
    } catch (error) {
      console.error('保存菜谱失败:', error)
      return false
    }
  }

  const removeRecipe = async (recipeId: string) => {
    try {
      // 从SQLite数据库中删除菜谱
      const numericId = parseInt(recipeId)
      if (!isNaN(numericId)) {
        await RecipeModel.delete(numericId)
      }
      
      // 从收藏列表中移除菜谱
      const index = savedRecipes.value.findIndex(r => r.id === recipeId)
      if (index > -1) {
        savedRecipes.value.splice(index, 1)
        return true
      }
      return false
    } catch (error) {
      console.error('移除菜谱失败:', error)
      return false
    }
  }

  const isRecipeSaved = (recipeId: string) => {
    return savedRecipes.value.some(r => r.id === recipeId)
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
      taste: null,
    }
    generatedRecipes.value = []
    currentStep.value = 1
    isGenerating.value = false
  }

  const loadSavedRecipes = async () => {
    try {
      // 从SQLite数据库加载收藏的菜谱
      const recipes = await RecipeModel.findAll(100, 0)
      savedRecipes.value = recipes.map(recipe => ({
        id: recipe.id.toString(),
        title: recipe.title,
        name: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        steps: recipe.instructions,
        cookingTime: `${recipe.cookingTime}分钟`,
        time: recipe.cookingTime,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        cookingMethods: [recipe.category],
        nutritionInfo: recipe.nutritionInfo,
        nutrition: recipe.nutritionInfo,
        tags: recipe.tags,
        rating: recipe.averageRating,
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt
      }))
    } catch (error) {
      console.error('加载收藏菜谱失败:', error)
      savedRecipes.value = []
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
    removeRecipe,
    isRecipeSaved,
    resetSelection,
    loadSavedRecipes,
  }
})
