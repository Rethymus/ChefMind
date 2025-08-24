import { ref } from 'vue'

// 视频教程类型定义
export interface VideoTutorial {
  id: string;
  recipeId: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  chef: string;
  views: number;
  likes: number;
  publishDate: string;
  tags: string[];
  chapters?: VideoChapter[];
}

// 视频章节类型定义
export interface VideoChapter {
  title: string;
  startTime: number; // 秒
  description?: string;
}

// 视频教程数据存储 - 移除mock数据，使用空数组作为初始状态
const videoTutorials: VideoTutorial[] = [];

// 创建视频教程服务
export const useVideoTutorialService = () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // 获取所有视频教程
  const getAllVideoTutorials = async (): Promise<VideoTutorial[]> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // TODO: 集成真实的视频教程API
      // 暂时返回空数组，等待后端API集成
      return videoTutorials;
    } catch (err) {
      error.value = '获取视频教程列表失败';
      console.error(err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  // 获取单个视频教程
  const getVideoTutorialById = async (id: string): Promise<VideoTutorial | null> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // TODO: 集成真实的视频教程API
      const tutorial = videoTutorials.find(t => t.id === id);
      return tutorial || null;
    } catch (err) {
      error.value = '获取视频教程详情失败';
      console.error(err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  // 根据食谱ID获取视频教程
  const getVideoTutorialsByRecipeId = async (recipeId: number): Promise<VideoTutorial[]> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // TODO: 集成真实的视频教程API
      const tutorials = videoTutorials.filter(t => t.recipeId === recipeId);
      return tutorials;
    } catch (err) {
      error.value = '获取食谱相关视频教程失败';
      console.error(err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  // 搜索视频教程
  const searchVideoTutorials = async (query: string): Promise<VideoTutorial[]> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // TODO: 集成真实的搜索API
      if (!query.trim()) {
        return videoTutorials;
      }
      
      const lowerQuery = query.toLowerCase();
      return videoTutorials.filter(tutorial => 
        tutorial.title.toLowerCase().includes(lowerQuery) || 
        tutorial.description.toLowerCase().includes(lowerQuery) ||
        tutorial.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        tutorial.chef.toLowerCase().includes(lowerQuery)
      );
    } catch (err) {
      error.value = '搜索视频教程失败';
      console.error(err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  // 增加视频观看次数
  const incrementViews = async (id: string): Promise<number> => {
    try {
      // 使用本地存储来跟踪观看次数
      const viewsKey = `video_views_${id}`;
      const currentViews = parseInt(localStorage.getItem(viewsKey) || '0');
      const newViews = currentViews + 1;
      localStorage.setItem(viewsKey, newViews.toString());
      return newViews;
    } catch (err) {
      console.error('增加观看次数失败:', err);
      return 0;
    }
  };
  
  // 点赞视频
  const likeVideo = async (id: string): Promise<number> => {
    try {
      // 使用本地存储来跟踪点赞数
      const likesKey = `video_likes_${id}`;
      const currentLikes = parseInt(localStorage.getItem(likesKey) || '0');
      const newLikes = currentLikes + 1;
      localStorage.setItem(likesKey, newLikes.toString());
      return newLikes;
    } catch (err) {
      console.error('点赞视频失败:', err);
      return 0;
    }
  };
  
  // 获取推荐视频
  const getRecommendedVideos = async (currentVideoId: string): Promise<VideoTutorial[]> => {
    try {
      // 使用AI生成推荐视频
      const aiService = await import('./aiService');
      const prompt = `为视频ID ${currentVideoId} 推荐3个相关的烹饪教学视频。请返回JSON格式的视频列表，包含id、title、description、duration、chef、thumbnailUrl、videoUrl、views、likes、tags等字段。`;
      
      const response = await aiService.generateRecipe(prompt);
      
      try {
        const recommendedVideos = JSON.parse(response);
        return Array.isArray(recommendedVideos) ? recommendedVideos.slice(0, 3) : [];
      } catch (parseError) {
        console.warn('AI推荐视频解析失败，返回空列表');
        return [];
      }
    } catch (err) {
      console.error('获取推荐视频失败:', err);
      return [];
    }
  };
  
  return {
    isLoading,
    error,
    getAllVideoTutorials,
    getVideoTutorialById,
    getVideoTutorialsByRecipeId,
    searchVideoTutorials,
    incrementViews,
    likeVideo,
    getRecommendedVideos
  };
};