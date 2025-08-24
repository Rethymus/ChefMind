<template>
  <div class="recipe-comments">
    <h2 class="section-title">
      <span class="section-icon">💬</span>
      评论与评价
      <span class="comment-count" v-if="comments.length > 0">({{ comments.length }})</span>
    </h2>
    
    <!-- 评分区域 -->
    <div class="rating-section">
      <div class="rating-header">
        <h3 class="rating-title">为这个食谱评分</h3>
        <div class="average-rating" v-if="averageRating > 0">
          <span class="average-rating-value">{{ averageRating.toFixed(1) }}</span>
          <div class="stars">
            <span v-for="i in 5" :key="`avg-${i}`" :class="['star', { filled: i <= Math.round(averageRating) }]">★</span>
          </div>
          <span class="rating-count">({{ comments.length }}个评价)</span>
        </div>
      </div>
      
      <div class="rating-input">
        <div class="stars-input">
          <span 
            v-for="i in 5" 
            :key="`input-${i}`" 
            :class="['star', { filled: i <= userRating }]"
            @click="setRating(i)"
            @mouseover="hoverRating = i"
            @mouseleave="hoverRating = 0"
          >
            ★
          </span>
        </div>
        <span class="rating-text">{{ ratingText }}</span>
      </div>
    </div>
    
    <!-- 评论表单 -->
    <div class="comment-form">
      <div class="form-group">
        <label for="comment-name">昵称</label>
        <input 
          type="text" 
          id="comment-name" 
          v-model="commentForm.name" 
          placeholder="请输入您的昵称"
          maxlength="20"
        >
      </div>
      
      <div class="form-group">
        <label for="comment-content">评论内容</label>
        <textarea 
          id="comment-content" 
          v-model="commentForm.content" 
          placeholder="分享您的烹饪体验和建议..."
          rows="4"
          maxlength="500"
        ></textarea>
        <div class="char-count">{{ commentForm.content.length }}/500</div>
      </div>
      
      <button 
        class="submit-button" 
        @click="submitComment"
        :disabled="!canSubmit"
      >
        发布评论
      </button>
    </div>
    
    <!-- 评论列表 -->
    <div class="comments-list" v-if="comments.length > 0">
      <h3 class="comments-title">用户评论</h3>
      
      <div class="comment-item" v-for="(comment, index) in comments" :key="index">
        <div class="comment-header">
          <div class="comment-user">
            <div class="user-avatar">{{ comment.name.charAt(0).toUpperCase() }}</div>
            <div class="user-name">{{ comment.name }}</div>
          </div>
          
          <div class="comment-rating">
            <span v-for="i in 5" :key="`comment-${index}-${i}`" :class="['star', { filled: i <= comment.rating }]">★</span>
          </div>
        </div>
        
        <div class="comment-content">{{ comment.content }}</div>
        
        <div class="comment-footer">
          <div class="comment-date">{{ formatDate(comment.date) }}</div>
          
          <div class="comment-actions">
            <button 
              class="like-button" 
              @click="likeComment(index)"
              :class="{ liked: comment.liked }"
            >
              <span class="like-icon">{{ comment.liked ? '❤️' : '🤍' }}</span>
              <span class="like-count">{{ comment.likes }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="no-comments" v-else>
      <div class="no-comments-icon">💬</div>
      <p>暂无评论，成为第一个评论的人吧！</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// 定义属性
const props = defineProps<{
  recipeId: string
}>()

// 定义事件
const emit = defineEmits<{
  (_e: 'rating-change', _rating: number): void
}>()

// 评分相关
const userRating = ref(0)
const hoverRating = ref(0)

// 评论表单
const commentForm = ref({
  name: '',
  content: '',
  rating: 0
})

// 评论列表
const comments = ref<Array<{
  name: string
  content: string
  rating: number
  date: Date
  likes: number
  liked: boolean
}>>([])

// 计算属性
const ratingText = computed(() => {
  const rating = hoverRating.value || userRating.value
  switch (rating) {
    case 1: return '不推荐'
    case 2: return '一般'
    case 3: return '还不错'
    case 4: return '推荐'
    case 5: return '强烈推荐'
    default: return '点击星星评分'
  }
})

const averageRating = computed(() => {
  if (comments.value.length === 0) return 0
  const sum = comments.value.reduce((acc, comment) => acc + comment.rating, 0)
  return sum / comments.value.length
})

const canSubmit = computed(() => {
  return commentForm.value.name.trim() !== '' && 
         commentForm.value.content.trim() !== '' && 
         userRating.value > 0
})

// 方法
const setRating = (rating: number) => {
  userRating.value = rating
  commentForm.value.rating = rating
}

const submitComment = () => {
  if (!canSubmit.value) return
  
  // 添加新评论
  comments.value.unshift({
    name: commentForm.value.name,
    content: commentForm.value.content,
    rating: userRating.value,
    date: new Date(),
    likes: 0,
    liked: false
  })
  
  // 保存评论到本地存储
  saveComments()
  
  // 更新食谱评分
  updateRecipeRating()
  
  // 重置表单
  commentForm.value.content = ''
  // 保留用户名，方便下次评论
}

const likeComment = (index: number) => {
  const comment = comments.value[index]
  if (comment.liked) {
    comment.likes--
    comment.liked = false
  } else {
    comment.likes++
    comment.liked = true
  }
  
  // 保存评论到本地存储
  saveComments()
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 保存评论到本地存储
const saveComments = () => {
  try {
    const allComments = JSON.parse(localStorage.getItem('recipe-comments') || '{}')
    allComments[props.recipeId] = comments.value
    localStorage.setItem('recipe-comments', JSON.stringify(allComments))
  } catch (error) {
    console.error('保存评论失败:', error)
  }
}

// 从本地存储加载评论
const loadComments = () => {
  try {
    const allComments = JSON.parse(localStorage.getItem('recipe-comments') || '{}')
    if (allComments[props.recipeId]) {
      comments.value = allComments[props.recipeId].map((comment: any) => ({
        ...comment,
        date: new Date(comment.date)
      }))
      
      // 如果有评论，设置用户评分为最后一次评分
      if (comments.value.length > 0) {
        const userComment = comments.value.find(c => c.name === commentForm.value.name)
        if (userComment) {
          userRating.value = userComment.rating
        }
      }
    }
  } catch (error) {
    console.error('加载评论失败:', error)
    comments.value = []
  }
}

// 更新食谱评分
const updateRecipeRating = () => {
  emit('update-rating', averageRating.value)
}

// 加载用户名
const loadUserName = () => {
  try {
    const userName = localStorage.getItem('comment-user-name')
    if (userName) {
      commentForm.value.name = userName
    }
  } catch (error) {
    console.error('加载用户名失败:', error)
  }
}

// 保存用户名
watch(() => commentForm.value.name, (newName) => {
  if (newName.trim()) {
    localStorage.setItem('comment-user-name', newName)
  }
})

// 初始化
loadUserName()
loadComments()
</script>

<style lang="scss" scoped>
.recipe-comments {
  background-color: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid var(--border-color);
}

.section-icon {
  font-size: 1.5rem;
}

.comment-count {
  font-size: 1rem;
  color: var(--text-color-secondary);
  margin-left: 0.5rem;
}

.rating-section {
  background-color: var(--bg-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.rating-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0;
}

.average-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.average-rating-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--heading-color);
}

.rating-count {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.stars, .stars-input {
  display: flex;
  gap: 0.3rem;
}

.star {
  font-size: 1.5rem;
  color: var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.filled {
    color: var(--warning-color);
  }
}

.stars-input .star:hover {
  transform: scale(1.2);
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rating-text {
  font-size: 1rem;
  color: var(--text-color);
}

.comment-form {
  background-color: var(--bg-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    font-size: 1rem;
    font-weight: 500;
    color: var(--heading-color);
    margin-bottom: 0.5rem;
  }
  
  input, textarea {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 1rem;
    background-color: var(--bg-color-light);
    color: var(--text-color);
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
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

.char-count {
  text-align: right;
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  margin-top: 0.5rem;
}

.submit-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--primary-color-dark);
  }
  
  &:disabled {
    background-color: var(--border-color);
    cursor: not-allowed;
  }
}

.comments-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0 0 1.5rem 0;
}

.comment-item {
  background-color: var(--bg-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
}

.user-name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--heading-color);
}

.comment-rating .star {
  font-size: 1.2rem;
  cursor: default;
}

.comment-content {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-color);
  margin-bottom: 1rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-date {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.like-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--hover-color);
  }
  
  &.liked {
    color: var(--primary-color);
  }
}

.like-icon {
  font-size: 1rem;
}

.no-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  text-align: center;
}

.no-comments-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-comments p {
  font-size: 1.1rem;
  color: var(--text-color-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .rating-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .rating-input {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  
  .comment-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
}
</style>