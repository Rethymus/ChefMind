/**
 * Provider-neutral JSON extraction for model responses. Providers are prompted
 * to return JSON, but some wrap it in Markdown code fences or surrounding text.
 */
export function parseAIJsonResponse<T>(response: string): T {
  const cleaned = response.replace(/```(?:json)?\s*|\s*```/gi, '').trim()

  try {
    return JSON.parse(cleaned) as T
  } catch {
    const objectStart = cleaned.indexOf('{')
    const arrayStart = cleaned.indexOf('[')
    const start = [objectStart, arrayStart].filter(index => index >= 0).sort((a, b) => a - b)[0]

    if (start === undefined) {
      throw new Error('AI 响应中未找到 JSON 内容')
    }

    const opening = cleaned[start]
    const closing = opening === '{' ? '}' : ']'
    const end = cleaned.lastIndexOf(closing)

    if (end <= start) {
      throw new Error('AI 响应中的 JSON 不完整')
    }

    try {
      return JSON.parse(cleaned.slice(start, end + 1)) as T
    } catch {
      throw new Error('AI 响应不是有效 JSON')
    }
  }
}
