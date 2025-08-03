/**
 * AI工具类
 * 提供与AI模型交互的功能
 */

/**
 * 调用GLM模型API
 * @param prompt 提示词
 * @param temperature 温度参数，控制随机性，默认为0.7
 * @param maxTokens 最大生成token数，默认为2048
 * @returns 生成的文本
 */
export async function callGLM(
  prompt: string,
  temperature: number = 0.7,
  maxTokens: number = 2048
): Promise<string> {
  try {
    // 从环境变量获取API密钥
    const apiKey = import.meta.env.VITE_GLM_API_KEY;
    if (!apiKey) {
      throw new Error('GLM API密钥未设置，请在.env文件中设置VITE_GLM_API_KEY');
    }

    // 构建请求体
    const requestBody = {
      prompt,
      temperature,
      max_tokens: maxTokens,
    };

    // 发送请求到GLM API
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GLM API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // 解析响应
    const data = await response.json();
    
    // 返回生成的文本
    return data.choices[0].message.content;
  } catch (error) {
    console.error('调用GLM API时出错:', error);
    throw error;
  }
}

/**
 * 解析JSON字符串，处理可能的格式错误
 * @param jsonString JSON字符串
 * @returns 解析后的对象，如果解析失败则返回null
 */
export function safeParseJSON<T>(jsonString: string): T | null {
  try {
    // 尝试直接解析
    return JSON.parse(jsonString) as T;
  } catch (e) {
    try {
      // 尝试修复常见的JSON格式错误
      // 1. 修复单引号
      const fixedQuotes = jsonString.replace(/'/g, '"');
      
      // 2. 修复没有引号的键
      const fixedKeys = fixedQuotes.replace(/(\w+):/g, '"$1":');
      
      // 3. 修复尾部逗号
      const fixedCommas = fixedKeys.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
      
      return JSON.parse(fixedCommas) as T;
    } catch (e2) {
      console.error('JSON解析失败:', e2);
      return null;
    }
  }
}

/**
 * 从AI生成的文本中提取JSON对象
 * @param text AI生成的文本
 * @returns 提取的JSON对象，如果提取失败则返回null
 */
export function extractJSONFromText<T>(text: string): T | null {
  try {
    // 尝试查找JSON对象的开始和结束位置
    const jsonStartIndex = text.indexOf('{');
    const jsonEndIndex = text.lastIndexOf('}') + 1;
    
    if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
      const jsonString = text.substring(jsonStartIndex, jsonEndIndex);
      return safeParseJSON<T>(jsonString);
    }
    
    // 尝试查找JSON数组的开始和结束位置
    const arrayStartIndex = text.indexOf('[');
    const arrayEndIndex = text.lastIndexOf(']') + 1;
    
    if (arrayStartIndex >= 0 && arrayEndIndex > arrayStartIndex) {
      const jsonString = text.substring(arrayStartIndex, arrayEndIndex);
      return safeParseJSON<T>(jsonString);
    }
    
    return null;
  } catch (e) {
    console.error('从文本中提取JSON失败:', e);
    return null;
  }
}