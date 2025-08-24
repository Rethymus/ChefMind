<template>
  <div class="community-view">
    <div class="community-container">
      <div class="community-header">
        <h1 class="community-title">{{ t('community.title') }}</h1>
        <p class="community-subtitle">{{ t('community.subtitle') }}</p>
        
        <div class="community-actions">
          <button class="create-post-button" @click="showCreatePostModal = true">
            <span class="button-icon">✏️</span>
            <span class="button-text">{{ t('community.create_post') }}</span>
          </button>
        </div>
      </div>
      
      <div class="community-content">
        <div class="community-sidebar">
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              :placeholder="t('community.search_placeholder')"
              @input="handleSearch"
            />
            <span class="search-icon">🔍</span>
          </div>
          
          <div class="filter-section">
            <h3 class="filter-title">{{ t('community.sort_by') }}</h3>
            <div class="filter-options">
              <button 
                :class="['filter-option', { active: sortBy === 'latest' }]"
                @click="sortBy = 'latest'"
              >
                {{ t('community.latest') }}
              </button>
              <button 
                :class="['filter-option', { active: sortBy === 'popular' }]"
                @click="sortBy = 'popular'"
              >
                {{ t('community.popular') }}
              </button>
            </div>
          </div>
          
          <div class="filter-section">
            <h3 class="filter-title">{{ t('community.popular_tags') }}</h3>
            <div class="tags-cloud">
              <button 
                v-for="tag in tags" 
                :key="tag"
                :class="['tag', { active: selectedTag === tag }]"
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="community-main">
          <div v-if="isLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>{{ t('app.loading') }}</p>
          </div>
          
          <div v-else-if="posts.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>{{ t('community.no_posts') }}</h3>
            <p>{{ t('community.no_posts_desc') }}</p>
            <button class="create-post-button" @click="showCreatePostModal = true">
              {{ t('community.create_first_post') }}
            </button>
          </div>
          
          <div v-else class="posts-list">
            <div 
              v-for="post in posts" 
              :key="post.id"
              class="post-card"
              @click="viewPostDetail(post.id)"
            >
              <div class="post-header">
                <div class="post-user">
                  <div class="user-avatar">
                    <img v-if="post.userAvatar" :src="post.userAvatar" :alt="post.username" />
                    <div v-else class="avatar-placeholder">{{ getUserInitials(post.username) }}</div>
                  </div>
                  <div class="user-info">
                    <div class="username">{{ post.username }}</div>
                    <div class="post-time">{{ formatDate(post.createdAt) }}</div>
                  </div>
                </div>
              </div>
              
              <div class="post-content">
                <h3 class="post-title">{{ post.title }}</h3>
                <p class="post-text">{{ truncateText(post.content, 150) }}</p>
                
                <div v-if="post.images && post.images.length > 0" class="post-images">
                  <img 
                    v-for="(image, index) in post.images.slice(0, 3)" 
                    :key="index"
                    :src="image" 
                    :alt="`${post.title} - 图片 ${index + 1}`"
                  />
                  <div v-if="post.images.length > 3" class="more-images">
                    +{{ post.images.length - 3 }}
                  </div>
                </div>
                
                <div v-if="post.recipeId" class="post-recipe">
                  <div class="recipe-badge">{{ t('community.recipe') }}</div>
                  <div class="recipe-name">{{ post.recipeName }}</div>
                </div>
                
                <div class="post-tags">
                  <span 
                    v-for="tag in post.tags.slice(0, 3)" 
                    :key="tag"
                    class="post-tag"
                  >
                    #{{ tag }}
                  </span>
                  <span v-if="post.tags.length > 3" class="more-tags">
                    +{{ post.tags.length - 3 }}
                  </span>
                </div>
              </div>
              
              <div class="post-footer">
                <div class="post-stats">
                  <div class="stat-item">
                    <span class="stat-icon">❤️</span>
                    <span class="stat-value">{{ post.likes }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-icon">💬</span>
                    <span class="stat-value">{{ post.comments }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="pagination.totalPages > 1" class="pagination">
            <button 
              class="pagination-button prev" 
              :disabled="pagination.page === 1"
              @click="changePage(pagination.page - 1)"
            >
              &lt; {{ t('app.previous') }}
            </button>
            
            <div class="pagination-info">
              {{ t('app.page') }} {{ pagination.page }} / {{ pagination.totalPages }}
            </div>
            
            <button 
              class="pagination-button next" 
              :disabled="pagination.page === pagination.totalPages"
              @click="changePage(pagination.page + 1)"
            >
              {{ t('app.next') }} &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 创建帖子模态框 -->
    <div v-if="showCreatePostModal" class="modal-overlay" @click="showCreatePostModal = false">
      <div class="modal-content create-post-modal" @click.stop>
        <h2 class="modal-title">{{ t('community.create_post') }}</h2>
        
        <div class="form-group">
          <label for="post-title">{{ t('community.post_title') }}</label>
          <input 
            id="post-title"
            type="text" 
            v-model="newPost.title" 
            :placeholder="t('community.post_title_placeholder')"
          />
        </div>
        
        <div class="form-group">
          <label for="post-content">{{ t('community.post_content') }}</label>
          <textarea 
            id="post-content"
            v-model="newPost.content" 
            :placeholder="t('community.post_content_placeholder')"
            rows="5"
          ></textarea>
        </div>
        
        <div class="modal-actions">
          <button 
            class="submit-button" 
            @click="submitPost"
            :disabled="isSubmitting || !canSubmitPost"
          >
            <span v-if="isSubmitting" class="button-spinner"></span>
            {{ isSubmitting ? t('app.submitting') : t('app.submit') }}
          </button>
          <button class="cancel-button" @click="showCreatePostModal = false">
            {{ t('app.cancel') }}
          </button>
        </div>
        
        <button class="modal-close" @click="showCreatePostModal = false">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { communityService } from '@/services/communityService'
import { useI18n } from '@/composables/useI18n'
import { useUserService } from '@/services/userService'

// 国际化
const { t } = useI18n()

// 路由
const router = useRouter()

// 服务
const userService = useUserService()

// 状态
const isLoading = ref(false)
const posts = ref<any[]>([])
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
})
const tags = ref<string[]>([])
const searchQuery = ref('')
const sortBy = ref('latest')
const selectedTag = ref('')
const showCreatePostModal = ref(false)
const isSubmitting = ref(false)

// 新帖子表单
const newPost = ref({
  title: '',
  content: '',
  images: [] as string[],
  recipeId: '',
  recipeName: '',
  tags: [] as string[]
})

// 计算属性
const canSubmitPost = computed(() => {
  return newPost.value.title.trim() !== '' && newPost.value.content.trim() !== '';
})

// 监听筛选条件变化
watch([searchQuery, sortBy, selectedTag], () => {
  loadPosts();
})

// 生命周期钩子
onMounted(async () => {
  await Promise.all([
    loadPosts(),
    loadTags()
  ]);
})

// 方法
const loadPosts = async () => {
  isLoading.value = true;
  
  try {
    const filter = {
      search: searchQuery.value,
      sort: sortBy.value,
      tag: selectedTag.value || undefined
    };
    
    const result = await communityService.getPosts(pagination.value.page, pagination.value.pageSize, filter);
    posts.value = result.posts;
    pagination.value = result.pagination;
  } catch (error) {
    console.error('加载帖子失败:', error);
    showNotification({
      type: 'error',
      title: t('notification.error'),
      message: t('community.load_error')
    });
  } finally {
    isLoading.value = false;
  }
}

const loadTags = async () => {
  try {
    tags.value = await communityService.getTags();
  } catch (error) {
    console.error('加载标签失败:', error);
  }
}

const handleSearch = () => {
  pagination.value.page = 1;
}

const toggleTag = (tag: string) => {
  if (selectedTag.value === tag) {
    selectedTag.value = '';
  } else {
    selectedTag.value = tag;
  }
  
  pagination.value.page = 1;
}

const changePage = (page: number) => {
  pagination.value.page = page;
  loadPosts();
  
  // 滚动到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

const viewPostDetail = (postId: string) => {
  router.push({
    path: '/community/post',
    query: { id: postId }
  });
}

const submitPost = async () => {
  if (isSubmitting.value || !canSubmitPost.value) return;
  
  isSubmitting.value = true;
  
  try {
    const currentUser = userService.getCurrentUser();
    
    const postData = {
      userId: currentUser?.id || '1',
      username: currentUser?.username || '美食爱好者',
      userAvatar: currentUser?.avatar || null,
      title: newPost.value.title,
      content: newPost.value.content,
      images: newPost.value.images,
      recipeId: newPost.value.recipeId || null,
      recipeName: newPost.value.recipeName || null,
      tags: newPost.value.tags
    };
    
    await communityService.createPost(postData);
    
    // 重置表单
    newPost.value = {
      title: '',
      content: '',
      images: [],
      recipeId: '',
      recipeName: '',
      tags: []
    };
    
    // 关闭模态框
    showCreatePostModal.value = false;
    
    // 重新加载帖子
    await loadPosts();
    
    // 显示成功通知
    showNotification({
      type: 'success',
      title: t('notification.success'),
      message: t('community.post_success')
    });
  } catch (error) {
    console.error('发布帖子失败:', error);
    
    // 显示错误通知
    showNotification({
      type: 'error',
      title: t('notification.error'),
      message: t('community.post_error')
    });
  } finally {
    isSubmitting.value = false;
  }
}

// 辅助方法
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 30) {
    return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  } else if (diffDays > 0) {
    return `${diffDays}天前`;
  } else if (diffHours > 0) {
    return `${diffHours}小时前`;
  } else if (diffMins > 0) {
    return `${diffMins}分钟前`;
  } else {
    return '刚刚';
  }
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

const getUserInitials = (username: string) => {
  if (!username) return '?';
  return username.substring(0, 2).toUpperCase();
}

// 显示通知
const showNotification = (notification: { type: string, title: string, message?: string }) => {
  // 创建自定义事件
  const event = new CustomEvent('notification', {
    detail: notification
  });
  
  // 触发事件
  window.dispatchEvent(event);
}
</script>

<style lang="scss" scoped>
.community-view {
  padding: 2rem 1rem;
  background-color: var(--bg-color);
  min-height: 100vh;
}

.community-container {
  max-width: 1200px;
  margin: 0 auto;
}

.community-header {
  text-align: center;
  margin-bottom: 2rem;
}

.community-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--heading-color);
  margin: 0 0 0.5rem 0;
}

.community-subtitle {
  font-size: 1.1rem;
  color: var(--text-color-secondary);
  margin: 0 0 1.5rem 0;
}

.community-actions {
  display: flex;
  justify-content: center;
}

.create-post-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--primary-color-dark);
    transform: translateY(-2px);
  }
}

.community-content {
  display: flex;
  gap: 2rem;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
}

.community-sidebar {
  width: 300px;
  flex-shrink: 0;
  
  @media (max-width: 992px) {
    width: 100%;
  }
}

.search-box {
  position: relative;
  margin-bottom: 1.5rem;
  
  input {
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.5rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-color);
    font-size: 1rem;
    color: var(--text-color);
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
    }
    
    &::placeholder {
      color: var(--text-color-lighter);
    }
  }
  
  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1rem;
    color: var(--text-color-secondary);
  }
}

.filter-section {
  background-color: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.filter-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0 0 1rem 0;
}

.filter-options {
  display: flex;
  gap: 0.5rem;
  
  .filter-option {
    flex: 1;
    padding: 0.8rem;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 0.9rem;
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--hover-color);
    }
    
    &.active {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
  }
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  
  .tag {
    padding: 0.5rem 0.8rem;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    font-size: 0.8rem;
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--hover-color);
    }
    
    &.active {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
  }
}

.community-main {
  flex: 1;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(var(--primary-color-rgb), 0.3);
    border-top: 3px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1rem;
    color: var(--text-color-secondary);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 0.5rem 0;
  }
  
  p {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
    margin: 0 0 1.5rem 0;
  }
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.post-card {
  background-color: var(--bg-color-secondary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
}

.post-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.post-user {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    background-color: var(--bg-color);
    display: flex;
    justify-content: center;
    align-items: center;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .avatar-placeholder {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color-secondary);
  }
  
  .user-info {
    .username {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--heading-color);
    }
    
    .post-time {
      font-size: 0.8rem;
      color: var(--text-color-secondary);
    }
  }
}

.post-content {
  padding: 1rem;
  
  .post-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 0.8rem 0;
  }
  
  .post-text {
    font-size: 0.9rem;
    color: var(--text-color);
    margin: 0 0 1rem 0;
    line-height: 1.5;
  }
}

.post-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
  }
  
  .more-images {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 120px;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 1.2rem;
    font-weight: 600;
    border-radius: 8px;
  }
}

.post-recipe {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0.8rem;
  background-color: var(--bg-color);
  border-radius: 8px;
  width: fit-content;
  
  .recipe-badge {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--primary-color);
  }
  
  .recipe-name {
    font-size: 0.8rem;
    color: var(--text-color);
  }
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  
  .post-tag {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
  }
  
  .more-tags {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
  }
}

.post-footer {
  padding: 0.8rem 1rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-color);
}

.post-stats {
  display: flex;
  gap: 1.5rem;
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    
    .stat-icon {
      font-size: 0.9rem;
    }
    
    .stat-value {
      font-size: 0.9rem;
      color: var(--text-color-secondary);
    }
  }
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  
  .pagination-button {
    padding: 0.5rem 1rem;
    background-color: var(--bg-color-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 0.9rem;
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover:not(:disabled) {
      background-color: var(--hover-color);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  .pagination-info {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background-color: var(--bg-color);
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--heading-color);
  margin: 0 0 1.5rem 0;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-color-secondary);
  
  &:hover {
    color: var(--text-color);
  }
}

.form-group {
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-color);
    margin-bottom: 0.5rem;
  }
  
  input[type="text"],
  textarea {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-color-secondary);
    font-size: 1rem;
    color: var(--text-color);
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
    }
    
    &::placeholder {
      color: var(--text-color-lighter);
    }
  }
  
  textarea {
    resize: vertical;
    min-height: 100px;
  }
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  .submit-button,
  .cancel-button {
    flex: 1;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .submit-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      background-color: var(--primary-color-dark);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  
  .cancel-button {
    background-color: var(--bg-color-secondary);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    
    &:hover {
      background-color: var(--hover-color);
    }
  }
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .community-view {
    padding: 1rem 0.5rem;
  }
  
  .community-title {
    font-size: 1.5rem;
  }
  
  .community-subtitle {
    font-size: 1rem;
  }
  
  .create-post-button {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
  
  .community-content {
    gap: 1rem;
  }
  
  .community-sidebar {
    order: 2;
  }
  
  .community-main {
    order: 1;
  }
  
  .filter-section {
    padding: 1rem;
  }
  
  .post-card {
    margin: 0 -0.5rem;
    border-radius: 0;
  }
  
  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
