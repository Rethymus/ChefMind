/**
 * 社区服务 - 提供社区相关功能
 */

// 社区数据存储 - 移除mock数据，使用本地存储
const POSTS_STORAGE_KEY = 'chefmind_community_posts';
const COMMENTS_STORAGE_KEY = 'chefmind_community_comments';
const TAGS_STORAGE_KEY = 'chefmind_community_tags';

// 默认标签列表
const defaultTags = [
  '中餐', '西餐', '日料', '韩餐', '甜点', '烘焙', '健康', '低脂', '高蛋白',
  '素食', '肉食', '海鲜', '早餐', '午餐', '晚餐', '小吃', '汤品', '沙拉',
  '面食', '米饭', '快手菜', '下酒菜', '宴客菜', '节日', '家常菜'
];

// 从本地存储获取数据的辅助函数
const getStoredData = (key: string, defaultValue: any[] = []) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`获取存储数据失败 (${key}):`, error);
    return defaultValue;
  }
};

// 保存数据到本地存储的辅助函数
const saveStoredData = (key: string, data: any[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`保存存储数据失败 (${key}):`, error);
  }
};

/**
 * 社区服务类
 */
class CommunityService {
  /**
   * 获取社区帖子列表
   * @param page 页码
   * @param pageSize 每页数量
   * @param filter 过滤条件
   * @returns 帖子列表和分页信息
   */
  async getPosts(page = 1, pageSize = 10, filter?: any) {
    try {
      let allPosts = getStoredData(POSTS_STORAGE_KEY, []);
      
      // 如果没有帖子且需要生成示例内容，使用AI生成
      if (allPosts.length === 0 && (!filter || !filter.search)) {
        try {
          const aiService = await import('./aiService');
          const prompt = `生成5个美食社区帖子的示例数据，包含不同类型的菜谱分享。请返回JSON格式的帖子数组，每个帖子包含id、userId、username、title、content、tags、likes、comments、createdAt等字段。内容要丰富有趣，符合中文美食社区的特点。`;
          
          const response = await aiService.generateRecipe(prompt);
          const generatedPosts = JSON.parse(response);
          
          if (Array.isArray(generatedPosts)) {
            allPosts = generatedPosts.map((post, index) => ({
              ...post,
              id: `ai_${Date.now()}_${index}`,
              createdAt: new Date(Date.now() - index * 86400000).toISOString() // 每个帖子间隔一天
            }));
            saveStoredData(POSTS_STORAGE_KEY, allPosts);
          }
        } catch (aiError) {
          console.warn('AI生成帖子失败:', aiError);
        }
      }
      
      let filteredPosts = [...allPosts];
      
      // 应用过滤条件
      if (filter) {
        if (filter.tag) {
          filteredPosts = filteredPosts.filter(post => post.tags?.includes(filter.tag));
        }
        
        if (filter.userId) {
          filteredPosts = filteredPosts.filter(post => post.userId === filter.userId);
        }
        
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filteredPosts = filteredPosts.filter(post => 
            post.title?.toLowerCase().includes(searchLower) || 
            post.content?.toLowerCase().includes(searchLower) ||
            post.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
          );
        }
        
        if (filter.sort === 'latest') {
          filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (filter.sort === 'popular') {
          filteredPosts.sort((a, b) => ((b.likes || 0) + (b.comments || 0)) - ((a.likes || 0) + (a.comments || 0)));
        }
      }
      
      // 计算分页
      const total = filteredPosts.length;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const posts = filteredPosts.slice(start, end);
      
      return {
        posts,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      };
    } catch (error) {
      console.error('获取帖子列表失败:', error);
      return {
        posts: [],
        pagination: { page, pageSize, total: 0, totalPages: 0 }
      };
    }
  }
  
  /**
   * 获取帖子详情
   * @param postId 帖子ID
   * @returns 帖子详情
   */
  async getPostDetail(postId: string) {
    try {
      const allPosts = getStoredData(POSTS_STORAGE_KEY, []);
      const post = allPosts.find((p: any) => p.id === postId);
      
      if (!post) {
        throw new Error('帖子不存在');
      }
      
      return post;
    } catch (error) {
      console.error('获取帖子详情失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取帖子评论
   * @param postId 帖子ID
   * @returns 评论列表
   */
  async getComments(postId: string) {
    try {
      const allComments = getStoredData(COMMENTS_STORAGE_KEY, []);
      return allComments.filter((comment: any) => comment.postId === postId);
    } catch (error) {
      console.error('获取评论失败:', error);
      return [];
    }
  }
  
  /**
   * 创建帖子
   * @param postData 帖子数据
   * @returns 创建的帖子
   */
  async createPost(postData: any) {
    try {
      const allPosts = getStoredData(POSTS_STORAGE_KEY, []);
      
      const newPost = {
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: postData.userId || 'user_1',
        username: postData.username || '美食爱好者',
        userAvatar: postData.userAvatar || null,
        title: postData.title,
        content: postData.content,
        images: postData.images || [],
        recipeId: postData.recipeId || null,
        recipeName: postData.recipeName || null,
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
        tags: postData.tags || []
      };
      
      allPosts.unshift(newPost);
      saveStoredData(POSTS_STORAGE_KEY, allPosts);
      
      return newPost;
    } catch (error) {
      console.error('创建帖子失败:', error);
      throw error;
    }
  }
  
  /**
   * 添加评论
   * @param commentData 评论数据
   * @returns 创建的评论
   */
  async addComment(commentData: any) {
    try {
      const allComments = getStoredData(COMMENTS_STORAGE_KEY, []);
      const allPosts = getStoredData(POSTS_STORAGE_KEY, []);
      
      const newComment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        postId: commentData.postId,
        userId: commentData.userId || 'user_1',
        username: commentData.username || '美食爱好者',
        userAvatar: commentData.userAvatar || null,
        content: commentData.content,
        likes: 0,
        createdAt: new Date().toISOString()
      };
      
      allComments.push(newComment);
      saveStoredData(COMMENTS_STORAGE_KEY, allComments);
      
      // 更新帖子的评论数
      const post = allPosts.find((p: any) => p.id === commentData.postId);
      if (post) {
        post.comments = (post.comments || 0) + 1;
        saveStoredData(POSTS_STORAGE_KEY, allPosts);
      }
      
      return newComment;
    } catch (error) {
      console.error('添加评论失败:', error);
      throw error;
    }
  }
  
  /**
   * 点赞帖子
   * @param postId 帖子ID
   * @returns 更新后的点赞数
   */
  async likePost(postId: string) {
    try {
      const allPosts = getStoredData(POSTS_STORAGE_KEY, []);
      const post = allPosts.find((p: any) => p.id === postId);
      
      if (!post) {
        throw new Error('帖子不存在');
      }
      
      post.likes = (post.likes || 0) + 1;
      saveStoredData(POSTS_STORAGE_KEY, allPosts);
      
      return post.likes;
    } catch (error) {
      console.error('点赞帖子失败:', error);
      throw error;
    }
  }
  
  /**
   * 点赞评论
   * @param commentId 评论ID
   * @returns 更新后的点赞数
   */
  async likeComment(commentId: string) {
    try {
      const allComments = getStoredData(COMMENTS_STORAGE_KEY, []);
      const comment = allComments.find((c: any) => c.id === commentId);
      
      if (!comment) {
        throw new Error('评论不存在');
      }
      
      comment.likes = (comment.likes || 0) + 1;
      saveStoredData(COMMENTS_STORAGE_KEY, allComments);
      
      return comment.likes;
    } catch (error) {
      console.error('点赞评论失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取热门标签
   * @returns 标签列表
   */
  async getTags() {
    try {
      let tags = getStoredData(TAGS_STORAGE_KEY, []);
      
      // 如果没有存储的标签，使用默认标签
      if (tags.length === 0) {
        tags = [...defaultTags];
        saveStoredData(TAGS_STORAGE_KEY, tags);
      }
      
      return tags;
    } catch (error) {
      console.error('获取标签失败:', error);
      return defaultTags;
    }
  }
  
  /**
   * 获取用户的帖子
   * @param userId 用户ID
   * @returns 帖子列表
   */
  async getUserPosts(userId: string) {
    try {
      const allPosts = getStoredData(POSTS_STORAGE_KEY, []);
      return allPosts.filter((post: any) => post.userId === userId);
    } catch (error) {
      console.error('获取用户帖子失败:', error);
      return [];
    }
  }
  
  /**
   * 删除帖子
   * @param postId 帖子ID
   * @returns 是否成功
   */
  async deletePost(postId: string) {
    try {
      const allPosts = getStoredData(POSTS_STORAGE_KEY, []);
      const allComments = getStoredData(COMMENTS_STORAGE_KEY, []);
      
      const index = allPosts.findIndex((p: any) => p.id === postId);
      
      if (index === -1) {
        throw new Error('帖子不存在');
      }
      
      allPosts.splice(index, 1);
      saveStoredData(POSTS_STORAGE_KEY, allPosts);
      
      // 删除相关评论
      const filteredComments = allComments.filter((comment: any) => comment.postId !== postId);
      saveStoredData(COMMENTS_STORAGE_KEY, filteredComments);
      
      return true;
    } catch (error) {
      console.error('删除帖子失败:', error);
      throw error;
    }
  }
  
  /**
   * 删除评论
   * @param commentId 评论ID
   * @returns 是否成功
   */
  async deleteComment(commentId: string) {
    try {
      const allComments = getStoredData(COMMENTS_STORAGE_KEY, []);
      const allPosts = getStoredData(POSTS_STORAGE_KEY, []);
      
      const index = allComments.findIndex((c: any) => c.id === commentId);
      
      if (index === -1) {
        throw new Error('评论不存在');
      }
      
      const comment = allComments[index];
      allComments.splice(index, 1);
      saveStoredData(COMMENTS_STORAGE_KEY, allComments);
      
      // 更新帖子的评论数
      const post = allPosts.find((p: any) => p.id === comment.postId);
      if (post) {
        post.comments = Math.max(0, (post.comments || 0) - 1);
        saveStoredData(POSTS_STORAGE_KEY, allPosts);
      }
      
      return true;
    } catch (error) {
      console.error('删除评论失败:', error);
      throw error;
    }
  }
}

export const communityService = new CommunityService();