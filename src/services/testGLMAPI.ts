/**
 * 测试GLM API连接
 * 用于验证API密钥和配置是否正确
 */

import glmService from './glmService';

export async function testGLMAPI() {
  try {
    console.log('开始测试GLM API连接...');
    
    // 发送一个简单的测试请求
    const response = await glmService.callGLM('你好，这是一个测试消息，请回复"API连接成功"', {
      maxTokens: 20 // 限制响应长度，减少token消耗
    });
    
    console.log('GLM API测试成功:', response);
    return {
      success: true,
      message: '连接成功',
      data: response
    };
  } catch (error: any) {
    console.error('GLM API测试失败:', error);
    return {
      success: false,
      message: error.message || '未知错误',
      error
    };
  }
}

export default testGLMAPI;
