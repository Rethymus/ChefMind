import { describe, expect, it } from 'vitest'
import { ParamAdapter } from '@/services/aiProviders/paramAdapter'

describe('ParamAdapter', () => {
  it('keeps search mode neutral and ignores flavor defaults', () => {
    const params = ParamAdapter.toRecipeGenerationParams(
      ['番茄', '鸡蛋'],
      {
        spiceLevel: 'hot',
        sweetnessLevel: 'high',
        servings: 3,
      },
      true
    )

    expect(params.ingredients).toEqual(['番茄', '鸡蛋'])
    expect(params.spiceLevel).toBe('none')
    expect(params.sweetnessLevel).toBe('none')
    expect(params.servings).toBe(3)
  })

  it('preserves explicit recipe params over user preferences', () => {
    const params = ParamAdapter.toRecipeGenerationParams(
      {
        ingredients: ['牛肉'],
        cookingMethod: '炖',
        allergies: ['花生'],
        spiceLevel: 'mild',
        autoCompleteIngredients: false,
      },
      {
        allergies: ['虾'],
        spiceLevel: 'hot',
        servings: 4,
      }
    )

    expect(params.cookingMethods).toEqual(['炖'])
    expect(params.allergies).toEqual(['花生'])
    expect(params.spiceLevel).toBe('mild')
    expect(params.servings).toBe(4)
    expect(params.autoCompleteIngredients).toBe(false)
  })
})
