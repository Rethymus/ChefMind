import { describe, expect, it } from 'vitest'
import { PromptBuilder } from '@/services/aiProviders/promptBuilder'

describe('PromptBuilder', () => {
  it('includes strict allergy and dietary constraints for ingredient recipes', () => {
    const prompt = PromptBuilder.buildRecipePrompt({
      ingredients: ['鸡胸肉', '西兰花'],
      dietaryRestrictions: ['低糖饮食'],
      allergies: ['花生'],
      spiceLevel: 'none',
      sweetnessLevel: 'low',
      flavorPreferences: ['清淡'],
      servings: 2,
      autoCompleteIngredients: true,
    })

    expect(prompt).toContain('低糖饮食')
    expect(prompt).toContain('花生')
    expect(prompt).toContain('绝对不能使用')
    expect(prompt).toContain('完全不吃辣')
    expect(prompt).toContain('清淡口味')
    expect(prompt).toContain('JSON格式返回食谱')
  })

  it('uses dish recreation instructions when a dish name is provided', () => {
    const prompt = PromptBuilder.buildRecipePrompt({
      ingredients: [],
      requestType: 'dish_recreation',
      dishName: '麻婆豆腐',
      servings: 3,
      autoCompleteIngredients: false,
    })

    expect(prompt).toContain('请为"麻婆豆腐"这道菜生成')
    expect(prompt).toContain('具体的菜品')
    expect(prompt).toContain('份量: 3人份')
  })

  it('keeps search-only prompts free from user preference constraints', () => {
    const prompt = PromptBuilder.buildRecipePrompt({
      ingredients: ['番茄'],
      requestType: 'search_only',
      allergies: ['花生'],
      spiceLevel: 'hot',
      autoCompleteIngredients: true,
    })

    expect(prompt).toContain('食材: 番茄')
    expect(prompt).not.toContain('花生')
    expect(prompt).not.toContain('重辣')
  })
})
