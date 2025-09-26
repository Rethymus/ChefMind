/**
 * 社区服务 - 提供社区相关功能
 */

// 社区数据存储 - 移除mock数据，使用本地存储
const POSTS_STORAGE_KEY = 'chefmind_community_posts'
const COMMENTS_STORAGE_KEY = 'chefmind_community_comments'
const TAGS_STORAGE_KEY = 'chefmind_community_tags'

// 默认标签列表
const defaultTags = [
  '中餐',
  '西餐',
  '日料',
  '韩餐',
  '甜点',
  '烘焙',
  '健康',
  '低脂',
  '高蛋白',
  '素食',
  '肉食',
  '海鲜',
  '早餐',
  '午餐',
  '晚餐',
  '小吃',
  '汤品',
  '沙拉',
  '面食',
  '米饭',
  '快手菜',
  '下酒菜',
  '宴客菜',
  '节日',
  '家常菜',
]

// 社区帖子类型定义
interface CommunityPost {
  id: string
  userId: string
  username: string
  title: string
  content: string
  tags: string[]
  likes: number
  comments: number
  createdAt: string
  imageUrl?: string
}

// 评论类型定义
interface Comment {
  id: string
  postId: string
  userId: string
  username: string
  content: string
  createdAt: string
  likes: number
}

// 过滤器类型定义
interface PostFilter {
  tag?: string
  userId?: string
  search?: string
  sort?: 'latest' | 'popular'
}

// 分页结果类型定义
interface PaginationResult {
  posts: CommunityPost[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// 创建帖子数据类型
interface CreatePostData {
  userId?: string
  username?: string
  userAvatar?: string
  title: string
  content: string
  images?: string[]
  recipeId?: string
  recipeName?: string
  tags?: string[]
}

// 创建评论数据类型
interface CreateCommentData {
  postId: string
  userId?: string
  username?: string
  userAvatar?: string
  content: string
}

// 从本地存储获取数据的辅助函数
const getStoredData = <T>(key: string, defaultValue: T[] = []): T[] => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch (error) {
    console.error(`获取存储数据失败 (${key}):`, error)
    return defaultValue
  }
}

// 保存数据到本地存储的辅助函数
const saveStoredData = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`保存存储数据失败 (${key}):`, error)
  }
}

/**
 * 社区服务类
 */
class CommunityService {
  /**
   * 获取帖子列表，支持分页和过滤
   * @param page 页码
   * @param pageSize 每页数量
   * @param filter 过滤条件
   * @returns 帖子列表和分页信息
   */
  async getPosts(page = 1, pageSize = 10, filter?: PostFilter): Promise<PaginationResult> {
    try {
      let allPosts: CommunityPost[] = getStoredData<CommunityPost>(POSTS_STORAGE_KEY, [])

      // 如果没有帖子且需要生成示例内容，使用模拟数据
      if (allPosts.length === 0 && !filter?.search) {
        try {
          // 使用模拟数据而不是AI服务
          const simulatedPosts = [
            {
              id: `community_${Date.now()}`,
              userId: 'user1',
              username: '美食达人',
              title: '家常红烧肉做法分享',
              content: '今天分享一个我家传的红烧肉做法，色泽红亮，肥而不腻...',
              tags: ['红烧肉', '家常菜', '经典菜谱'],
              likes: 125,
              comments: 23,
              createdAt: new Date().toISOString(),
            },
            {
              id: `community_${Date.now() + 1}`,
              userId: 'user2',
              username: '烘焙小能手',
              title: '免烤箱芝士蛋糕制作心得',
              content: '不用烤箱也能做出美味芝士蛋糕，关键在于选材和手法...',
              tags: ['免烤', '芝士蛋糕', '甜品'],
              likes: 98,
              comments: 15,
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ]

          allPosts = simulatedPosts
          saveStoredData<CommunityPost>(POSTS_STORAGE_KEY, allPosts)
        } catch (error) {
          console.warn('生成示例帖子失败:', error)
        }
      }

      let filteredPosts = [...allPosts]

      // 应用过滤条件
      if (filter) {
        if (filter.tag) {
          filteredPosts = filteredPosts.filter(post => post.tags?.includes(filter.tag))
        }

        if (filter.userId) {
          filteredPosts = filteredPosts.filter(post => post.userId === filter.userId)
        }

        if (filter.search) {
          const searchLower = filter.search.toLowerCase()
          filteredPosts = filteredPosts.filter(
            post =>
              post.title?.toLowerCase().includes(searchLower) ||
              post.content?.toLowerCase().includes(searchLower) ||
              post.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
          )
        }

        if (filter.sort === 'latest') {
          filteredPosts.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        } else if (filter.sort === 'popular') {
          filteredPosts.sort(
            (a, b) => (b.likes || 0) + (b.comments || 0) - ((a.likes || 0) + (a.comments || 0))
          )
        }
      }

      // 计算分页
      const total = filteredPosts.length
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const posts = filteredPosts.slice(start, end)

      return {
        posts,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      }
    } catch (error) {
      console.error('获取帖子列表失败:', error)
      return {
        posts: [],
        pagination: { page, pageSize, total: 0, totalPages: 0 },
      }
    }
  }

  /**
   * 获取帖子详情
   * @param postId 帖子ID
   * @returns 帖子详情
   */
  async getPostDetail(postId: string): Promise<CommunityPost> {
    try {
      const allPosts: CommunityPost[] = getStoredData<CommunityPost>(POSTS_STORAGE_KEY, [])
      const post = allPosts.find((p: CommunityPost) => p.id === postId)

      if (!post) {
        throw new Error('帖子不存在')
      }

      return post
    } catch (error) {
      console.error('获取帖子详情失败:', error)
      throw error
    }
  }

  /**
   * 获取帖子评论
   * @param postId 帖子ID
   * @returns 评论列表
   */
  async getComments(postId: string): Promise<Comment[]> {
    try {
      const allComments: Comment[] = getStoredData<Comment>(COMMENTS_STORAGE_KEY, [])
      return allComments.filter((comment: Comment) => comment.postId === postId)
    } catch (error) {
      console.error('获取评论失败:', error)
      return []
    }
  }

  /**
   * 创建帖子
   * @param postData 帖子数据
   * @returns 创建的帖子
   */
  async createPost(postData: CreatePostData): Promise<CommunityPost> {
    try {
      const allPosts: CommunityPost[] = getStoredData<CommunityPost>(POSTS_STORAGE_KEY, [])

      const newPost: CommunityPost = {
        id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId: postData.userId || 'user_1',
        username: postData.username || '美食爱好者',
        title: postData.title,
        content: postData.content,
        tags: postData.tags || [],
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
      }

      allPosts.unshift(newPost)
      saveStoredData<CommunityPost>(POSTS_STORAGE_KEY, allPosts)

      return newPost
    } catch (error) {
      console.error('创建帖子失败:', error)
      throw error
    }
  }

  /**
   * 添加评论
   * @param commentData 评论数据
   * @returns 创建的评论
   */
  async addComment(commentData: CreateCommentData): Promise<Comment> {
    try {
      const allComments: Comment[] = getStoredData<Comment>(COMMENTS_STORAGE_KEY, [])
      const allPosts: CommunityPost[] = getStoredData<CommunityPost>(POSTS_STORAGE_KEY, [])

      const newComment: Comment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        postId: commentData.postId,
        userId: commentData.userId || 'user_1',
        username: commentData.username || '美食爱好者',
        content: commentData.content,
        likes: 0,
        createdAt: new Date().toISOString(),
      }

      allComments.push(newComment)
      saveStoredData<Comment>(COMMENTS_STORAGE_KEY, allComments)

      // 更新帖子的评论数
      const post = allPosts.find((p: CommunityPost) => p.id === commentData.postId)
      if (post) {
        post.comments = (post.comments || 0) + 1
        saveStoredData<CommunityPost>(POSTS_STORAGE_KEY, allPosts)
      }

      return newComment
    } catch (error) {
      console.error('添加评论失败:', error)
      throw error
    }
  }

  /**
   * 点赞帖子
   * @param postId 帖子ID
   * @returns 更新后的点赞数
   */
  async likePost(postId: string): Promise<number> {
    try {
      const allPosts: CommunityPost[] = getStoredData<CommunityPost>(POSTS_STORAGE_KEY, [])
      const post = allPosts.find((p: CommunityPost) => p.id === postId)

      if (!post) {
        throw new Error('帖子不存在')
      }

      post.likes = (post.likes || 0) + 1
      saveStoredData<CommunityPost>(POSTS_STORAGE_KEY, allPosts)

      return post.likes
    } catch (error) {
      console.error('点赞帖子失败:', error)
      throw error
    }
  }

  /**
   * 点赞评论
   * @param commentId 评论ID
   * @returns 更新后的点赞数
   */
  async likeComment(commentId: string): Promise<number> {
    try {
      const allComments: Comment[] = getStoredData<Comment>(COMMENTS_STORAGE_KEY, [])
      const comment = allComments.find((c: Comment) => c.id === commentId)

      if (!comment) {
        throw new Error('评论不存在')
      }

      comment.likes = (comment.likes || 0) + 1
      saveStoredData<Comment>(COMMENTS_STORAGE_KEY, allComments)

      return comment.likes
    } catch (error) {
      console.error('点赞评论失败:', error)
      throw error
    }
  }

  /**
   * 获取标签列表
   * @returns 标签列表
   */
  async getTags(): Promise<string[]> {
    try {
      const storedTags = getStoredData<string>(TAGS_STORAGE_KEY, [])

      if (storedTags.length === 0) {
        saveStoredData<string>(TAGS_STORAGE_KEY, defaultTags)
        return defaultTags
      }

      return storedTags
    } catch (error) {
      console.error('获取标签失败:', error)
      return defaultTags
    }
  }

  /**
   * 获取用户的帖子
   * @param userId 用户ID
   * @returns 帖子列表
   */
  async getUserPosts(userId: string): Promise<CommunityPost[]> {
    try {
      const allPosts: CommunityPost[] = getStoredData<CommunityPost>(POSTS_STORAGE_KEY, [])
      return allPosts.filter((post: CommunityPost) => post.userId === userId)
    } catch (error) {
      console.error('获取用户帖子失败:', error)
      return []
    }
  }

  /**
   * 删除帖子
   * @param postId 帖子ID
   * @returns 是否成功
   */
  async deletePost(postId: string): Promise<boolean> {
    try {
      const allPosts: CommunityPost[] = getStoredData<CommunityPost>(POSTS_STORAGE_KEY, [])
      const allComments: Comment[] = getStoredData<Comment>(COMMENTS_STORAGE_KEY, [])

      const index = allPosts.findIndex((p: CommunityPost) => p.id === postId)

      if (index === -1) {
        throw new Error('帖子不存在')
      }

      allPosts.splice(index, 1)
      saveStoredData<CommunityPost>(POSTS_STORAGE_KEY, allPosts)

      // 删除相关评论
      const filteredComments = allComments.filter((comment: Comment) => comment.postId !== postId)
      saveStoredData<Comment>(COMMENTS_STORAGE_KEY, filteredComments)

      return true
    } catch (error) {
      console.error('删除帖子失败:', error)
      return false
    }
  }

  /**
   * 删除评论
   * @param commentId 评论ID
   * @returns 是否成功
   */
  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const allComments: Comment[] = getStoredData<Comment>(COMMENTS_STORAGE_KEY, [])
      const allPosts: CommunityPost[] = getStoredData<CommunityPost>(POSTS_STORAGE_KEY, [])

      const index = allComments.findIndex((c: Comment) => c.id === commentId)

      if (index === -1) {
        throw new Error('评论不存在')
      }

      const comment = allComments[index]
      allComments.splice(index, 1)
      saveStoredData<Comment>(COMMENTS_STORAGE_KEY, allComments)

      // 更新帖子的评论数
      const post = allPosts.find((p: CommunityPost) => p.id === comment.postId)
      if (post) {
        post.comments = Math.max(0, (post.comments || 0) - 1)
        saveStoredData<CommunityPost>(POSTS_STORAGE_KEY, allPosts)
      }

      return true
    } catch (error) {
      console.error('删除评论失败:', error)
      return false
    }
  }
}

export default new CommunityService()
