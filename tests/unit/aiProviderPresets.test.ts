import { describe, expect, it } from 'vitest'
import { aiProviderPresets, getPresetById } from '@/data/aiProviderPresets'

describe('aiProviderPresets', () => {
  it('keeps provider presets usable for OpenAI-compatible settings', () => {
    const presetIds = aiProviderPresets.map(preset => preset.id)

    expect(presetIds).toEqual([
      'openai',
      'deepseek',
      'qwen',
      'moonshot',
      'zhipu',
      'siliconflow',
      'custom',
    ])

    for (const preset of aiProviderPresets.filter(preset => preset.id !== 'custom')) {
      expect(preset.provider).toBe('openai')
      expect(preset.baseUrl).toMatch(/^https:\/\//)
      expect(preset.model.length).toBeGreaterThan(0)
      expect(preset.apiKeyUrl).toMatch(/^https:\/\//)
    }
  })

  it('falls back to OpenAI when an unknown preset id is requested', () => {
    expect(getPresetById('missing-provider')).toEqual(getPresetById('openai'))
  })
})
