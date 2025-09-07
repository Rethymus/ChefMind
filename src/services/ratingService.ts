// ChefMind 智食谱 - 评分和评论服务

import type { RecipeRating, RecipeComment, RecipeRatingSummary } from '@/types/recipe'
import { callGLM } from './glmService'
import { getCachedData, setCachedData } from '@/utils/apiCache'

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * 获取菜谱评分
 * @param recipeId 菜谱ID
 * @returns 菜谱评分信息
 */
export async function getRecipeRating(recipeId: string): Promise<RecipeRatingSummary> {
  const cacheKey = `rating_${recipeId}`;
  
  // 检查缓存
  const cachedRating = getCachedData<RecipeRatingSummary>(cacheKey);
  if (cachedRating) {
    return cachedRating;
  }
  
  try {
    // 构建提示词
    const prompt = `请为一道菜谱生成合理的评分数据，包括总体评分、口味评分、外观评分、难度评分和评分人数。
评分范围为1-5分，评分人数应该是一个合理的数字。

请按照以下JSON格式返回评分数据，不要有任何其他内容:
{
  "overall": 总体评分(1-5),
  "taste": 口味评分(1-5),
  "appearance": 外观评分(1-5),
  "difficulty": 难度评分(1-5),
  "count": 评分人数
}`;

    // 调用GLM API
    const response = await callGLM(prompt);
    
    try {
      // 提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('无法从AI响应中提取JSON数据');
      }
      
      const jsonData = JSON.parse(jsonMatch[0]);
      
      // 构建评分对象
      const rating: RecipeRatingSummary = {
        recipeId,
        overall: jsonData.overall || 4.5,
        taste: jsonData.taste || 4.5,
        appearance: jsonData.appearance || 4.3,
        difficulty: jsonData.difficulty || 3.8,
        count: jsonData.count || 128,
        updatedAt: new Date()
      };
      
      // 缓存结果
      setCachedData(cacheKey, rating, 24 * 60 * 60 * 1000); // 缓存24小时
      
      return rating;
    } catch (error) {
      console.error('解析AI生成的评分数据失败:', error);
      // 返回默认评分
      return getDefaultRating(recipeId);
    }
  } catch (error) {
    console.error('获取菜谱评分失败:', error);
    // 返回默认评分
    return getDefaultRating(recipeId);
  }
}

/**
 * 获取默认评分
 * @param recipeId 菜谱ID
 * @returns 默认评分
 */
function getDefaultRating(recipeId: string): RecipeRatingSummary {
  return {
    recipeId,
    overall: 4.5,
    taste: 4.5,
    appearance: 4.3,
    difficulty: 3.8,
    count: 128,
    updatedAt: new Date()
  };
}

/**
 * 获取菜谱评论
 * @param recipeId 菜谱ID
 * @param limit 评论数量限制
 * @returns 菜谱评论列表
 */
export async function getRecipeComments(recipeId: string, limit: number = 5): Promise<RecipeComment[]> {
  const cacheKey = `comments_${recipeId}_${limit}`;
  
  // 检查缓存
  const cachedComments = getCachedData<RecipeComment[]>(cacheKey);
  if (cachedComments) {
    return cachedComments;
  }
  
  try {
    // 构建提示词
    const prompt = `请为一道菜谱生成${limit}条真实、多样的用户评论。
评论应该包括用户名、评分(1-5)、评论内容、评论时间和点赞数。
评论内容应该多样化，有正面评价，也有建设性意见，长短不一，风格各异，像是不同的真实用户所写。

请按照以下JSON格式返回评论数据，不要有任何其他内容:
[
  {
    "username": "用户名",
    "rating": 评分(1-5),
    "content": "评论内容",
    "createdAt": "2023-XX-XX",
    "likes": 点赞数
  }
]`;

    // 调用GLM API
    const response = await callGLM(prompt);
    
    try {
      // 提取JSON部分
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('无法从AI响应中提取JSON数据');
      }
      
      const jsonData = JSON.parse(jsonMatch[0]);
      
      // 构建评论对象数组
      const comments: RecipeComment[] = jsonData.map((item: any) => ({
        id: generateId(),
        recipeId,
        username: item.username,
        rating: item.rating,
        content: item.content,
        createdAt: new Date(item.createdAt || Date.now()),
        likes: item.likes || 0,
        aiGenerated: true
      }));
      
      // 缓存结果
      setCachedData(cacheKey, comments, 24 * 60 * 60 * 1000); // 缓存24小时
      
      return comments;
    } catch (error) {
      console.error('解析AI生成的评论数据失败:', error);
      // 返回默认评论
      return getDefaultComments(recipeId, limit);
    }
  } catch (error) {
    console.error('获取菜谱评论失败:', error);
    // 返回默认评论
    return getDefaultComments(recipeId, limit);
  }
}

/**
 * 获取默认评论
 * @param recipeId 菜谱ID
 * @param limit 评论数量限制
 * @returns 默认评论列表
 */
function getDefaultComments(recipeId: string, limit: number = 5): RecipeComment[] {
  const defaultComments: RecipeComment[] = [
    {
      id: generateId(),
      recipeId,
      userId: 'user_001',
      username: '美食爱好者',
      rating: 5,
      content: '这道菜非常美味，我全家都很喜欢！按照步骤做出来的效果很好，推荐大家尝试。',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
      likes: 24,
      aiGenerated: true
    },
    {
      id: generateId(),
      recipeId,
      userId: 'user_002',
      username: '厨房新手',
      rating: 4,
      content: '作为新手，我觉得这个菜谱很容易上手，步骤清晰。就是最后调味有点难把握，可能需要多练习几次。',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5天前
      likes: 15,
      aiGenerated: true
    },
    {
      id: generateId(),
      recipeId,
      userId: 'user_003',
      username: '资深吃货',
      rating: 5,
      content: '这道菜的味道很正宗，和我在餐厅吃到的很像！我稍微调整了一下调料的比例，更符合我的口味。',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
      likes: 32,
      aiGenerated: true
    }
  ];
  
  return defaultComments.slice(0, limit);
}

/**
 * 添加菜谱评论
 * @param recipeId 菜谱ID
 * @param username 用户名
 * @param rating 评分
 * @param content 评论内容
 * @returns 添加的评论
 */
export async function addRecipeComment(
  recipeId: string,
  username: string,
  rating: number,
  content: string
): Promise<RecipeComment> {
  // 创建新评论
  const newComment: RecipeComment = {
    id: generateId(),
    recipeId,
    userId: 'current_user',
    username,
    rating,
    content,
    createdAt: new Date(),
    likes: 0,
    aiGenerated: false
  };
  
  // 获取现有评论
  const cacheKey = `comments_${recipeId}_5`; // 使用默认limit
  const existingComments = getCachedData<RecipeComment[]>(cacheKey) || [];
  
  // 添加新评论到列表开头
  const updatedComments = [newComment, ...existingComments];
  
  // 更新缓存
  setCachedData(cacheKey, updatedComments, 24 * 60 * 60 * 1000); // 缓存24小时
  
  // 更新评分
  updateRecipeRating(recipeId, rating);
  
  return newComment;
}

/**
 * 更新菜谱评分
 * @param recipeId 菜谱ID
 * @param newRating 新评分
 */
async function updateRecipeRating(recipeId: string, newRating: number): Promise<void> {
  const cacheKey = `rating_${recipeId}`;
  const currentRating = getCachedData<RecipeRatingSummary>(cacheKey) || getDefaultRating(recipeId);
  
  // 计算新的平均评分
  const newCount = currentRating.count + 1;
  const newOverall = (currentRating.overall * currentRating.count + newRating) / newCount;
  
  // 更新评分对象
  const updatedRating: RecipeRatingSummary = {
    ...currentRating,
    overall: parseFloat(newOverall.toFixed(1)),
    count: newCount,
    updatedAt: new Date()
  };
  
  // 更新缓存
  setCachedData(cacheKey, updatedRating, 24 * 60 * 60 * 1000); // 缓存24小时
}

/**
 * 生成AI评论回复
 * @param comment 原始评论
 * @returns AI生成的回复
 */
export async function generateCommentReply(comment: RecipeComment): Promise<string> {
  try {
    // 构建提示词
    const prompt = `请针对以下用户对菜谱的评论，生成一个友好、专业的回复。回复应该感谢用户的反馈，并针对评论内容给出相关建议或解释。

用户评论:
用户名: ${comment.username}
评分: ${comment.rating}/5
评论内容: ${comment.content}

请直接返回回复内容，不要添加任何其他内容。回复应该简洁、有帮助，并保持专业厨师的语气。`;

    // 调用GLM API
    const response = await callGLM(prompt);
    
    return response;
  } catch (error) {
    console.error('生成评论回复失败:', error);
    // 如果AI生成失败，返回默认回复
    return `感谢您的评价和反馈！我们非常重视您的意见，这将帮助我们不断改进菜谱。希望您继续尝试我们的其他菜谱，祝您烹饪愉快！`;
  }
}