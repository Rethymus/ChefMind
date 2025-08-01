/**
 * GLM API 服务
 * 用于与智谱AI GLM模型进行交互
 * 集成缓存和请求去重功能
 */

import { apiCache, generateCacheKey, GLM_CACHE_CONFIG } from '@/utils/apiCache'

interface GLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GLMRequest {
  model: string;
  messages: GLMMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface GLMResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class GLMService {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor() {
    this.apiKey = import.meta.env.GLM_API_KEY || '';
    this.baseURL = import.meta.env.GLM_API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
    this.model = import.meta.env.GLM_MODEL || 'glm-4';

    if (!this.apiKey) {
      console.warn('GLM API Key 未配置，请检查环境变量 GLM_API_KEY');
    }
  }

  /**
   * 发送聊天请求到GLM API
   */
  async chat(messages: GLMMessage[], options?: {
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  }): Promise<GLMResponse> {
    if (!this.apiKey) {
      throw new Error('GLM API Key 未配置');
    }

    const requestBody: GLMRequest = {
      model: this.model,
      messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.max_tokens || 1000,
      stream: options?.stream || false
    };

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`GLM API 请求失败: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GLM API 调用错误:', error);
      throw error;
    }
  }

  /**
   * 生成菜谱建议（带缓存）
   */
  async generateRecipeSuggestion(ingredients: string[], constraints?: string[]): Promise<string> {
    const cacheKey = generateCacheKey.recipeGeneration(
      ingredients, 
      ['生成'], 
      { constraints }
    );

    return apiCache.cachedRequest(
      cacheKey,
      async () => {
        const systemMessage: GLMMessage = {
          role: 'system',
          content: '你是一个专业的厨师助手，擅长根据用户提供的食材和限制条件生成美味的菜谱建议。请提供详细的制作步骤和营养信息。'
        };

        const userMessage: GLMMessage = {
          role: 'user',
          content: `请根据以下食材生成一个菜谱：
食材：${ingredients.join('、')}
${constraints && constraints.length > 0 ? `限制条件：${constraints.join('、')}` : ''}

请提供：
1. 菜品名称
2. 详细制作步骤
3. 预计烹饪时间
4. 营养价值分析
5. 小贴士`
        };

        const response = await this.chat([systemMessage, userMessage]);
        return response.choices[0]?.message?.content || '抱歉，无法生成菜谱建议';
      },
      GLM_CACHE_CONFIG.RECIPE_GENERATION
    );
  }

  /**
   * 分析营养成分（带缓存）
   */
  async analyzeNutrition(recipe: string): Promise<string> {
    const cacheKey = `nutrition:analyze:${btoa(recipe).substring(0, 32)}`;

    return apiCache.cachedRequest(
      cacheKey,
      async () => {
        const systemMessage: GLMMessage = {
          role: 'system',
          content: '你是一个营养学专家，能够分析菜谱的营养成分和健康价值。'
        };

        const userMessage: GLMMessage = {
          role: 'user',
          content: `请分析以下菜谱的营养成分：
${recipe}

请提供：
1. 主要营养成分（蛋白质、碳水化合物、脂肪等）
2. 维生素和矿物质含量
3. 热量估算
4. 健康建议`
        };

        const response = await this.chat([systemMessage, userMessage]);
        return response.choices[0]?.message?.content || '抱歉，无法分析营养成分';
      },
      GLM_CACHE_CONFIG.NUTRITION_ANALYSIS
    );
  }

  /**
   * 智能推荐相似菜谱（带缓存）
   */
  async recommendSimilarRecipes(currentRecipe: string, preferences?: string[]): Promise<string> {
    const cacheKey = generateCacheKey.recommendation(
      currentRecipe, 
      preferences || []
    );

    return apiCache.cachedRequest(
      cacheKey,
      async () => {
        const systemMessage: GLMMessage = {
          role: 'system',
          content: '你是一个菜谱推荐专家，能够根据用户当前的菜谱和偏好推荐相似或互补的菜谱。'
        };

        const userMessage: GLMMessage = {
          role: 'user',
          content: `基于以下菜谱，请推荐3-5个相似或搭配的菜谱：
当前菜谱：${currentRecipe}
${preferences && preferences.length > 0 ? `用户偏好：${preferences.join('、')}` : ''}

请为每个推荐提供：
1. 菜品名称
2. 推荐理由
3. 简要制作说明`
        };

        const response = await this.chat([systemMessage, userMessage]);
        return response.choices[0]?.message?.content || '抱歉，无法推荐相似菜谱';
      },
      GLM_CACHE_CONFIG.RECOMMENDATION
    );
  }
}

// 导出单例实例
export const glmService = new GLMService();
export default glmService;