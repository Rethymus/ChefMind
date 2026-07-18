import { describe, expect, it } from 'vitest'
import { parseAIJsonResponse } from '@/services/aiResponseParser'
import { aiConfigService } from '@/services/aiConfig'
import { getChatCompletionsUrl, normalizeProviderBaseUrl } from '@/services/providerEndpoint'

describe('BYOK endpoint policy', () => {
  it('normalizes a public HTTPS OpenAI-compatible endpoint', () => {
    expect(normalizeProviderBaseUrl('https://api.example.com/v1/')).toBe('https://api.example.com/v1')
    expect(getChatCompletionsUrl('https://api.example.com/v1')).toBe(
      'https://api.example.com/v1/chat/completions'
    )
  })

  it('rejects unsafe custom endpoints', () => {
    for (const endpoint of [
      'http://api.example.com/v1',
      'https://localhost:3000/v1',
      'https://127.0.0.1/v1',
      'https://user:pass@api.example.com/v1',
      'https://api.example.com/v1?token=secret',
    ]) {
      expect(() => normalizeProviderBaseUrl(endpoint)).toThrow()
    }
  })
})

describe('BYOK web credential lifecycle', () => {
  it('keeps the runtime key in session memory instead of a build variable', async () => {
    await aiConfigService.saveApiKey('openai', 'user-provided-key', {
      baseUrl: 'https://api.example.com/v1',
      model: 'example-model',
    })

    await expect(aiConfigService.getProviderConfig('openai')).resolves.toMatchObject({
      provider: 'openai',
      apiKey: 'user-provided-key',
      storage: 'memory',
      isConfigured: true,
    })

    await aiConfigService.clearAllConfigs()
    await expect(aiConfigService.getProviderConfig('openai')).resolves.toBeNull()
  })
})

describe('provider-neutral response parsing', () => {
  it('parses Markdown-wrapped object and array responses', () => {
    expect(parseAIJsonResponse<{ title: string }>('```json\n{"title":"番茄炒蛋"}\n```')).toEqual({
      title: '番茄炒蛋',
    })
    expect(parseAIJsonResponse<string[]>('结果如下：["a", "b"]')).toEqual(['a', 'b'])
  })
})
