// ChefMind 智食谱 - GLM API服务

/**
 * 调用GLM API
 * @param prompt 提示词
 * @param options 可选配置参数
 * @returns API响应文本
 */
export async function callGLM(prompt: string, options?: {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}): Promise<string> {
  try {
    // 使用Vite环境变量
    const apiKey = import.meta.env.VITE_GLM_API_KEY;
    const apiBaseUrl = import.meta.env.VITE_GLM_API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
    const model = import.meta.env.VITE_GLM_MODEL || 'glm-4';
    
    if (!apiKey) {
      console.error('未找到GLM API密钥');
      throw new Error('未配置GLM API密钥');
    }
    
    // GLM API端点
    const apiUrl = `${apiBaseUrl}/chat/completions`;
    
    // 构建消息数组
    const messages = [];
    
    // 如果提供了系统提示词，添加到消息数组
    if (options?.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt
      });
    }
    
    // 添加用户消息
    messages.push({
      role: 'user',
      content: prompt
    });
    
    // 构建请求体
    const requestBody = {
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      top_p: 0.8,
      max_tokens: options?.maxTokens ?? 4096,
      stream: false
    };
    
    // 发送请求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      // 添加超时处理
      signal: AbortSignal.timeout(30000) // 30秒超时
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GLM API请求失败:', errorText);
      throw new Error(`GLM API请求失败: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 提取响应文本
    const responseText = data.choices[0].message.content;
    
    return responseText;
  } catch (error) {
    console.error('调用GLM API失败:', error);
    
    // 区分不同类型的错误
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('AI服务请求超时，请稍后再试');
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('网络连接错误，请检查您的网络连接');
    } else {
      throw new Error('AI服务暂时不可用，请稍后再试');
    }
  }
}

/**
 * 批量调用GLM API（用于处理多个请求）
 * @param prompts 提示词数组
 * @param options 可选配置参数
 * @returns API响应文本数组
 */
export async function batchCallGLM(prompts: string[], options?: {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  concurrency?: number;
}): Promise<string[]> {
  // 默认并发数为2，避免过多请求导致API限流
  const concurrency = options?.concurrency || 2;
  const results: string[] = [];
  
  // 分批处理请求
  for (let i = 0; i < prompts.length; i += concurrency) {
    const batch = prompts.slice(i, i + concurrency);
    const promises = batch.map(prompt => callGLM(prompt, options));
    
    try {
      // 等待当前批次的所有请求完成
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    } catch (error) {
      console.error('批量调用GLM API失败:', error);
      // 对于失败的请求，添加空结果
      batch.forEach(() => results.push(''));
    }
    
    // 如果还有更多批次，添加延迟以避免API限流
    if (i + concurrency < prompts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * 解析JSON响应
 * @param response GLM API响应文本
 * @returns 解析后的JSON对象
 */
export function parseJsonResponse<T>(response: string): T {
  try {
    // 尝试直接解析
    try {
      return JSON.parse(response) as T;
    } catch (e) {
      // 如果直接解析失败，尝试提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('无法从AI响应中提取JSON数据');
      }
      
      return JSON.parse(jsonMatch[0]) as T;
    }
  } catch (error) {
    console.error('解析AI响应JSON失败:', error);
    throw new Error('解析AI生成的数据失败，请重试');
  }
}

export default {
  callGLM,
  batchCallGLM,
  parseJsonResponse
}
