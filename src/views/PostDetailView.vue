<template>
  <div class="post-detail-view">
    <div class="post-detail-container">
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <template v-else>
        <div class="post-navigation">
          <button class="back-button" @click="goBack">
            <span class="back-icon">←</span>
            <span class="back-text">返回</span>
          </button>
        </div>
        
        <div class="post-detail-card">
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
            
            <div class="post-actions">
              <button class="action-button share-button" @click="sharePost">
                <span class="action-icon">📤</span>
                <span class="action-text">分享</span>
              </button>
              
              <button v-if="isCurrentUserPost" class="action-button delete-button" @click="confirmDeletePost">
                <span class="action-icon">🗑️</span>
                <span class="action-text">删除</span>
              </button>
            </div>
          </div>
          
          <div class="post-content">
            <h1 class="post-title">{{ post.title }}</h1>
            
            <div class="post-tags">
              <span 
                v-for="tag in post.tags" 
                :key="tag"
                class="post-tag"
              >
                #{{ tag }}
              </span>
            </div>
            
            <p class="post-text">{{ post.content }}</p>
            
            <div v-if="post.images && post.images.length > 0" class="post-images">
              <img 
                v-for="(image, index) in post.images" 
                :key="index"
                :src="image" 
                :alt="`${post.title} - 图片 ${index + 1}`"
                @click="openImageViewer(index)"
                v-lazy
              />
            </div>
            
            <div v-if="post.recipeId" class="post-recipe">
              <div class="recipe-badge">菜谱</div>
              <div class="recipe-name">{{ post.recipeName }}</div>
              <button class="view-recipe-button" @click="viewRecipe(post.recipeId)">
                查看菜谱
              </button>
            </div>
          </div>
          
          <div class="post-footer">
            <div class="post-stats">
              <button class="like-button" @click="likePost">
                <span class="like-icon">❤️</span>
                <span class="like-count">{{ post.likes }}</span>
              </button>
              
              <div class="comment-count">
                <span class="comment-icon">💬</span>
                <span class="count-value">{{ post.comments }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="comments-section">
          <h2 class="section-title">评论 ({{ comments.length }})</h2>
          
          <div class="comment-form">
            <div class="form-avatar">
              <div class="avatar-placeholder">美食</div>
            </div>
            <div class="form-input">
              <textarea 
                v-model="newComment" 
                placeholder="写下你的评论..."
                rows="3"
              ></textarea>
              <button 
                class="submit-button" 
                @click="submitComment"
                :disabled="isSubmittingComment || !newComment.trim()"
              >
                <span v-if="isSubmittingComment" class="button-spinner"></span>
                {{ isSubmittingComment ? '提交中...' : '提交' }}
              </button>
            </div>
          </div>
          
          <div v-if="comments.length === 0" class="empty-comments">
            <p>暂无评论</p>
          </div>
          
          <div v-else class="comments-list">
            <div 
              v-for="comment in comments" 
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-avatar">
                <img v-if="comment.userAvatar" :src="comment.userAvatar" :alt="comment.username" />
                <div v-else class="avatar-placeholder">{{ getUserInitials(comment.username) }}</div>
              </div>
              
              <div class="comment-content">
                <div class="comment-header">
                  <div class="comment-user">{{ comment.username }}</div>
                  <div class="comment-time">{{ formatDate(comment.createdAt) }}</div>
                </div>
                
                <div class="comment-text">{{ comment.content }}</div>
                
                <div class="comment-actions">
                  <button class="like-button" @click="likeComment(comment.id)">
                    <span class="like-icon">❤️</span>
                    <span class="like-count">{{ comment.likes }}</span>
                  </button>
                  
                  <button 
                    v-if="isCurrentUserComment(comment)"
                    class="delete-button"
                    @click="confirmDeleteComment(comment.id)"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    
    <!-- 图片查看器 -->
    <div v-if="showImageViewer" class="image-viewer" @click="closeImageViewer">
      <div class="image-container">
        <img :src="post.images[currentImageIndex]" :alt="post.title" />
      </div>
      
      <div class="image-controls">
        <button 
          class="control-button prev" 
          @click.stop="prevImage"
          :disabled="currentImageIndex === 0"
        >
          &lt;
        </button>
        <div class="image-counter">{{ currentImageIndex + 1 }} / {{ post.images.length }}</div>
        <button 
          class="control-button next" 
          @click.stop="nextImage"
          :disabled="currentImageIndex === post.images.length - 1"
        >
          &gt;
        </button>
      </div>
      
      <button class="close-button" @click.stop="closeImageViewer">×</button>
    </div>
    
    <!-- 确认删除模态框 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="modal-content delete-confirm-modal" @click.stop>
        <h2 class="modal-title">确认删除</h2>
        <p class="confirm-message">{{ deleteType === 'post' ? '确定要删除这篇帖子吗？' : '确定要删除这条评论吗？' }}</p>
        
        <div class="modal-actions">
          <button 
            class="delete-button" 
            @click="confirmDelete"
            :disabled="isDeleting"
          >
            <span v-if="isDeleting" class="button-spinner"></span>
            {{ isDeleting ? '删除中...' : '删除' }}
          </button>
          <button class="cancel-button" @click="showDeleteConfirm = false">
            取消
          </button>
        </div>
      </div>
    </div>
    
    <!-- 分享模态框 -->
    <div v-if="showShareModal" class="modal-overlay" @click="showShareModal = false">
      <div class="modal-content share-modal" @click.stop>
        <h2 class="modal-title">分享帖子</h2>
        
        <div class="share-options">
          <button class="share-option" @click="shareViaOption('wechat')">
            <span class="option-icon">📱</span>
            <span class="option-name">微信</span>
          </button>
          
          <button class="share-option" @click="shareViaOption('weibo')">
            <span class="option-icon">🔴</span>
            <span class="option-name">微博</span>
          </button>
          
          <button class="share-option" @click="shareViaOption('qq')">
            <span class="option-icon">🐧</span>
            <span class="option-name">QQ</span>
          </button>
          
          <button class="share-option" @click="shareViaOption('link')">
            <span class="option-icon">🔗</span>
            <span class="option-name">复制链接</span>
          </button>
        </div>
        
        <button class="modal-close" @click="showShareModal = false">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import communityService from '@/services/communityService'

// 路由
const route = useRoute()
const router = useRouter()

// 服务


// 状态
const isLoading = ref(true)
const post = ref<any>({})
const comments = ref<any[]>([])
const newComment = ref('')
const isSubmittingComment = ref(false)
const showImageViewer = ref(false)
const currentImageIndex = ref(0)
const showDeleteConfirm = ref(false)
const deleteType = ref('')
const deleteId = ref('')
const isDeleting = ref(false)
const showShareModal = ref(false)

// 计算属性
const isCurrentUserPost = computed(() => {
  return '1' === post.value.userId;
})

// 生命周期钩子
onMounted(async () => {
  const postId = route.query.id as string;
  
  if (!postId) {
    router.push('/community');
    return;
  }
  
  await loadPostData(postId);
})

// 方法
const loadPostData = async (postId: string) => {
  isLoading.value = true;
  
  try {
    const [postData, commentsData] = await Promise.all([
      communityService.getPostDetail(postId),
      communityService.getComments(postId)
    ]);
    
    post.value = postData;
    comments.value = commentsData;
  } catch (error) {
    console.error('加载帖子数据失败:', error);
    showNotification({
      type: 'error',
      title: '错误',
      message: '加载帖子数据失败'
    });
    
    router.push('/community');
  } finally {
    isLoading.value = false;
  }
}

const goBack = () => {
  router.back();
}

const viewRecipe = (recipeId: string) => {
  router.push({
    path: '/recipe-detail',
    query: { id: recipeId }
  });
}

const likePost = async () => {
  try {
    const newLikes = await communityService.likePost(post.value.id);
    post.value.likes = newLikes;
  } catch (error) {
    console.error('点赞失败:', error);
  }
}

const likeComment = async (commentId: string) => {
  try {
    const newLikes = await communityService.likeComment(commentId);
    const comment = comments.value.find(c => c.id === commentId);
    if (comment) {
      comment.likes = newLikes;
    }
  } catch (error) {
    console.error('点赞评论失败:', error);
  }
}

const submitComment = async () => {
  if (isSubmittingComment.value || !newComment.value.trim()) return;
  
  isSubmittingComment.value = true;
  
  try {
    const commentData = {
      postId: post.value.id,
      userId: '1',
      username: '美食爱好者',
      userAvatar: null,
      content: newComment.value.trim()
    };
    
    const newCommentData = await communityService.addComment(commentData);
    comments.value.unshift(newCommentData);
    post.value.comments += 1;
    newComment.value = '';
    
    showNotification({
      type: 'success',
      title: '成功',
      message: '评论发布成功'
    });
  } catch (error) {
    console.error('提交评论失败:', error);
    
    showNotification({
      type: 'error',
      title: '错误',
      message: '评论发布失败'
    });
  } finally {
    isSubmittingComment.value = false;
  }
}

const openImageViewer = (index: number) => {
  currentImageIndex.value = index;
  showImageViewer.value = true;
  
  // 禁止背景滚动
  document.body.style.overflow = 'hidden';
}

const closeImageViewer = () => {
  showImageViewer.value = false;
  
  // 恢复背景滚动
  document.body.style.overflow = '';
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
}

const nextImage = () => {
  if (currentImageIndex.value < post.value.images.length - 1) {
    currentImageIndex.value++;
  }
}

const confirmDeletePost = () => {
  deleteType.value = 'post';
  deleteId.value = post.value.id;
  showDeleteConfirm.value = true;
}

const confirmDeleteComment = (commentId: string) => {
  deleteType.value = 'comment';
  deleteId.value = commentId;
  showDeleteConfirm.value = true;
}

const confirmDelete = async () => {
  if (isDeleting.value) return;
  
  isDeleting.value = true;
  
  try {
    if (deleteType.value === 'post') {
      await communityService.deletePost(deleteId.value);
      
      showNotification({
        type: 'success',
        title: '成功',
        message: '帖子删除成功'
      });
      
      router.push('/community');
    } else if (deleteType.value === 'comment') {
      await communityService.deleteComment(deleteId.value);
      
      comments.value = comments.value.filter(c => c.id !== deleteId.value);
      post.value.comments -= 1;
      
      showNotification({
        type: 'success',
        title: '成功',
        message: '评论删除成功'
      });
      
      showDeleteConfirm.value = false;
    }
  } catch (error) {
    console.error('删除失败:', error);
    
    showNotification({
      type: 'error',
      title: '错误',
      message: '删除失败'
    });
  } finally {
    isDeleting.value = false;
  }
}

const sharePost = () => {
  showShareModal.value = true;
}

const shareViaOption = (option: string) => {
  const url = window.location.href;
  const title = post.value.title;
  
  if (option === 'link') {
    navigator.clipboard.writeText(url).then(() => {
      showNotification({
        type: 'success',
        title: '成功',
        message: '链接已复制到剪贴板'
      });
    });
  } else {
    // 在实际应用中，这里会调用相应的分享API
    // console.log(`分享到 ${option}:`, { url, title });
    
    showNotification({
      type: 'success',
      title: '成功',
      message: `已分享到${option}`
    });
  }
  
  showShareModal.value = false;
}

const isCurrentUserComment = (comment: any) => {
  return '1' === comment.userId;
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

const getUserInitials = (username?: string) => {
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
.post-detail-view {
  padding: 2rem 1rem;
  background-color: var(--bg-color);
  min-height: 100vh;
}

.post-detail-container {
  max-width: 800px;
  margin: 0 auto;
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

.post-navigation {
  margin-bottom: 1.5rem;
  
  .back-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: var(--bg-color-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 0.9rem;
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--hover-color);
    }
  }
}

.post-detail-card {
  background-color: var(--bg-color-secondary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.post-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-user {
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .user-avatar {
    width: 48px;
    height: 48px;
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
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-color-secondary);
  }
  
  .user-info {
    .username {
      font-size: 1rem;
      font-weight: 600;
      color: var(--heading-color);
      margin-bottom: 0.3rem;
    }
    
    .post-time {
      font-size: 0.8rem;
      color: var(--text-color-secondary);
    }
  }
}

.post-actions {
  display: flex;
  gap: 0.8rem;
  
  .action-button {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.5rem 0.8rem;
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
    
    &.delete-button:hover {
      color: #ff4d4f;
      border-color: #ff4d4f;
    }
  }
}

.post-content {
  padding: 1.5rem;
  
  .post-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--heading-color);
    margin: 0 0 1rem 0;
  }
  
  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    
    .post-tag {
      font-size: 0.9rem;
      color: var(--text-color-secondary);
    }
  }
  
  .post-text {
    font-size: 1rem;
    color: var(--text-color);
    line-height: 1.6;
    margin-bottom: 1.5rem;
    white-space: pre-line;
  }
}

.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.02);
    }
  }
}

.post-recipe {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: var(--bg-color);
  border-radius: 8px;
  
  .recipe-badge {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--primary-color);
  }
  
  .recipe-name {
    font-size: 0.9rem;
    color: var(--text-color);
    flex: 1;
  }
  
  .view-recipe-button {
    padding: 0.5rem 1rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--primary-color-dark);
    }
  }
}

.post-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-color);
}

.post-stats {
  display: flex;
  gap: 2rem;
  
  .like-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    font-size: 1rem;
    color: var(--text-color);
    cursor: pointer;
    padding: 0;
    
    &:hover {
      color: #ff4d4f;
    }
    
    .like-count {
      font-size: 0.9rem;
      color: var(--text-color-secondary);
    }
  }
  
  .comment-count {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    color: var(--text-color);
    
    .count-value {
      font-size: 0.9rem;
      color: var(--text-color-secondary);
    }
  }
}

.comments-section {
  background-color: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0 0 1.5rem 0;
}

.comment-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  
  .form-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    background-color: var(--bg-color);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    
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
  
  .form-input {
    flex: 1;
    
    textarea {
      width: 100%;
      padding: 0.8rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background-color: var(--bg-color);
      font-size: 1rem;
      color: var(--text-color);
      resize: vertical;
      margin-bottom: 1rem;
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
    
    .submit-button {
      padding: 0.8rem 1.5rem;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:hover:not(:disabled) {
        background-color: var(--primary-color-dark);
      }
      
      &:disabled {
        background-color: var(--border-color);
        cursor: not-allowed;
      }
    }
  }
}

.empty-comments {
  text-align: center;
  padding: 2rem 0;
  
  p {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
  }
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--bg-color);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.comment-content {
  flex: 1;
  
  .comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    
    .comment-user {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--heading-color);
    }
    
    .comment-time {
      font-size: 0.8rem;
      color: var(--text-color-secondary);
    }
  }
  
  .comment-text {
    font-size: 0.9rem;
    color: var(--text-color);
    line-height: 1.5;
    margin-bottom: 0.8rem;
  }
  
  .comment-actions {
    display: flex;
    justify-content: space-between;
    
    .like-button {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      background: none;
      border: none;
      font-size: 0.9rem;
      color: var(--text-color);
      cursor: pointer;
      padding: 0;
      
      &:hover {
        color: #ff4d4f;
      }
      
      .like-count {
        font-size: 0.8rem;
        color: var(--text-color-secondary);
      }
    }
    
    .delete-button {
      background: none;
      border: none;
      font-size: 0.8rem;
      color: var(--text-color-secondary);
      cursor: pointer;
      padding: 0;
      
      &:hover {
        color: #ff4d4f;
      }
    }
  }
}

.button-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

.image-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  
  .image-container {
    max-width: 90%;
    max-height: 80%;
    
    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }
  
  .image-controls {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .control-button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.3s ease;
      
      &:hover:not(:disabled) {
        background-color: rgba(255, 255, 255, 0.4);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    
    .image-counter {
      color: white;
      font-size: 0.9rem;
    }
  }
  
  .close-button {
    position: absolute;
    top: 2rem;
    right: 2rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.4);
    }
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
  max-width: 500px;
  width: 100%;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  
  &.delete-confirm-modal {
    max-width: 400px;
  }
  
  &.share-modal {
    max-width: 400px;
  }
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--heading-color);
  margin: 0 0 1.5rem 0;
}

.confirm-message {
  font-size: 1rem;
  color: var(--text-color);
  margin-bottom: 2rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  
  .delete-button,
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
  
  .delete-button {
    background-color: #ff4d4f;
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      background-color: darken(#ff4d4f, 10%);
    }
    
    &:disabled {
      background-color: var(--border-color);
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

.share-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  
  .share-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem;
    background-color: var(--bg-color-secondary);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--hover-color);
      transform: translateY(-3px);
    }
    
    .option-icon {
      font-size: 2rem;
    }
    
    .option-name {
      font-size: 0.9rem;
      color: var(--text-color);
    }
  }
}
</style>
