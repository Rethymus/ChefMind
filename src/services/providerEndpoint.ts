const isLiteralIpAddress = (hostname: string) =>
  /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || hostname.includes(':')

/** Validates a public HTTPS OpenAI-compatible base URL. */
export function normalizeProviderBaseUrl(value: string): string {
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    throw new Error('Base URL 格式无效')
  }

  const hostname = url.hostname.toLowerCase()
  if (url.protocol !== 'https:') {
    throw new Error('Base URL 必须使用 HTTPS')
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('Base URL 不能包含账号、查询参数或片段')
  }
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || isLiteralIpAddress(hostname)) {
    throw new Error('不允许使用本地、回环或 IP 地址作为 AI Endpoint')
  }

  return url.toString().replace(/\/+$/, '')
}

export function getChatCompletionsUrl(baseUrl: string): string {
  const normalized = normalizeProviderBaseUrl(baseUrl)
  return normalized.endsWith('/chat/completions')
    ? normalized
    : `${normalized}/chat/completions`
}
