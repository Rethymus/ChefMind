<template>
  <div class="login-view">
    <div class="auth-container">
      <div class="auth-header">
        <div class="logo-container">
          <span class="logo-icon">👨‍🍳</span>
          <h1 class="logo-text">{{ t('app.name') }}</h1>
        </div>
      </div>
      
      <div class="auth-tabs">
        <button 
          :class="['auth-tab', { active: activeTab === 'login' }]"
          @click="activeTab = 'login'"
        >
          {{ t('auth.login') }}
        </button>
        <button 
          :class="['auth-tab', { active: activeTab === 'register' }]"
          @click="activeTab = 'register'"
        >
          {{ t('auth.register') }}
        </button>
      </div>
      
      <!-- 登录表单 -->
      <form v-if="activeTab === 'login'" class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="login-email">{{ t('auth.email') }}</label>
          <input 
            id="login-email"
            type="email" 
            v-model="loginForm.email" 
            :placeholder="t('auth.email_placeholder')"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="login-password">{{ t('auth.password') }}</label>
          <div class="password-input">
            <input 
              id="login-password"
              :type="showPassword ? 'text' : 'password'" 
              v-model="loginForm.password" 
              :placeholder="t('auth.password_placeholder')"
              required
            />
            <button 
              type="button" 
              class="toggle-password" 
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>
        
        <div class="form-options">
          <div class="remember-me">
            <input type="checkbox" id="remember" v-model="loginForm.remember" />
            <label for="remember">{{ t('auth.remember_me') }}</label>
          </div>
          <a href="#" class="forgot-password" @click.prevent="forgotPassword">
            {{ t('auth.forgot_password') }}
          </a>
        </div>
        
        <button 
          type="submit" 
          class="auth-button" 
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="button-spinner"></span>
          {{ isLoading ? t('app.loading') : t('auth.login') }}
        </button>
        
        <div class="social-login">
          <p class="social-divider">{{ t('auth.or_continue_with') }}</p>
          <div class="social-buttons">
            <button type="button" class="social-button google" @click="socialLogin('google')">
              Google
            </button>
            <button type="button" class="social-button wechat" @click="socialLogin('wechat')">
              微信
            </button>
          </div>
        </div>
      </form>
      
      <!-- 注册表单 -->
      <form v-else class="auth-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="register-username">{{ t('auth.username') }}</label>
          <input 
            id="register-username"
            type="text" 
            v-model="registerForm.username" 
            :placeholder="t('auth.username_placeholder')"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="register-email">{{ t('auth.email') }}</label>
          <input 
            id="register-email"
            type="email" 
            v-model="registerForm.email" 
            :placeholder="t('auth.email_placeholder')"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="register-password">{{ t('auth.password') }}</label>
          <div class="password-input">
            <input 
              id="register-password"
              :type="showPassword ? 'text' : 'password'" 
              v-model="registerForm.password" 
              :placeholder="t('auth.password_placeholder')"
              required
            />
            <button 
              type="button" 
              class="toggle-password" 
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label for="register-confirm-password">{{ t('auth.confirm_password') }}</label>
          <div class="password-input">
            <input 
              id="register-confirm-password"
              :type="showPassword ? 'text' : 'password'" 
              v-model="registerForm.confirmPassword" 
              :placeholder="t('auth.confirm_password_placeholder')"
              required
            />
          </div>
        </div>
        
        <div class="form-options">
          <div class="terms-agreement">
            <input type="checkbox" id="terms" v-model="registerForm.agreeTerms" required />
            <label for="terms">
              {{ t('auth.agree_terms') }}
              <a href="#" @click.prevent="showTerms = true">{{ t('auth.terms_of_service') }}</a>
            </label>
          </div>
        </div>
        
        <button 
          type="submit" 
          class="auth-button" 
          :disabled="isLoading || !registerForm.agreeTerms || registerForm.password !== registerForm.confirmPassword"
        >
          <span v-if="isLoading" class="button-spinner"></span>
          {{ isLoading ? t('app.loading') : t('auth.register') }}
        </button>
      </form>
      
      <div class="auth-footer">
        <button class="back-to-home" @click="goToHome">
          <span class="back-icon">←</span>
          {{ t('auth.back_to_home') }}
        </button>
      </div>
    </div>
    
    <!-- 忘记密码模态框 -->
    <div v-if="showForgotPassword" class="modal-overlay" @click="showForgotPassword = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">{{ t('auth.reset_password') }}</h3>
        <form class="forgot-password-form" @submit.prevent="handleResetPassword">
          <div class="form-group">
            <label for="reset-email">{{ t('auth.email') }}</label>
            <input 
              id="reset-email"
              type="email" 
              v-model="resetEmail" 
              :placeholder="t('auth.email_placeholder')"
              required
            />
          </div>
          
          <button 
            type="submit" 
            class="auth-button" 
            :disabled="isResetting"
          >
            <span v-if="isResetting" class="button-spinner"></span>
            {{ isResetting ? t('app.loading') : t('auth.send_reset_link') }}
          </button>
        </form>
        <button class="modal-close" @click="showForgotPassword = false">×</button>
      </div>
    </div>
    
    <!-- 服务条款模态框 -->
    <div v-if="showTerms" class="modal-overlay" @click="showTerms = false">
      <div class="modal-content terms-modal" @click.stop>
        <h3 class="modal-title">{{ t('auth.terms_of_service') }}</h3>
        <div class="terms-content">
          <h4>1. {{ t('auth.terms_acceptance') }}</h4>
          <p>{{ t('auth.terms_acceptance_desc') }}</p>
          
          <h4>2. {{ t('auth.user_accounts') }}</h4>
          <p>{{ t('auth.user_accounts_desc') }}</p>
          
          <h4>3. {{ t('auth.privacy_policy') }}</h4>
          <p>{{ t('auth.privacy_policy_desc') }}</p>
          
          <h4>4. {{ t('auth.content_ownership') }}</h4>
          <p>{{ t('auth.content_ownership_desc') }}</p>
          
          <h4>5. {{ t('auth.prohibited_activities') }}</h4>
          <p>{{ t('auth.prohibited_activities_desc') }}</p>
        </div>
        <div class="terms-actions">
          <button class="auth-button" @click="acceptTerms">{{ t('auth.accept') }}</button>
          <button class="cancel-button" @click="showTerms = false">{{ t('app.cancel') }}</button>
        </div>
        <button class="modal-close" @click="showTerms = false">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserService } from '@/services/userService'
import { useI18n } from '@/composables/useI18n'

// 国际化
const { t } = useI18n()

// 路由
const router = useRouter()

// 用户服务
const userService = useUserService()

// 状态
const activeTab = ref('login')
const showPassword = ref(false)
const isLoading = ref(false)
const isResetting = ref(false)
const showForgotPassword = ref(false)
const showTerms = ref(false)

// 登录表单
const loginForm = ref({
  email: '',
  password: '',
  remember: false
})

// 注册表单
const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

// 重置密码
const resetEmail = ref('')

// 处理登录
const handleLogin = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    await userService.login(loginForm.value.email, loginForm.value.password)
    
    // 显示成功通知
    showNotification({
      type: 'success',
      title: t('notification.success'),
      message: t('auth.login_success')
    })
    
    // 跳转到首页
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
    
    // 显示错误通知
    showNotification({
      type: 'error',
      title: t('notification.error'),
      message: error instanceof Error ? error.message : t('auth.login_error')
    })
  } finally {
    isLoading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  if (isLoading.value) return
  
  // 验证密码是否匹配
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    showNotification({
      type: 'error',
      title: t('notification.error'),
      message: t('auth.passwords_not_match')
    })
    return
  }
  
  isLoading.value = true
  
  try {
    await userService.register(
      registerForm.value.username,
      registerForm.value.email,
      registerForm.value.password
    )
    
    // 显示成功通知
    showNotification({
      type: 'success',
      title: t('notification.success'),
      message: t('auth.register_success')
    })
    
    // 跳转到首页
    router.push('/')
  } catch (error) {
    console.error('注册失败:', error)
    
    // 显示错误通知
    showNotification({
      type: 'error',
      title: t('notification.error'),
      message: error instanceof Error ? error.message : t('auth.register_error')
    })
  } finally {
    isLoading.value = false
  }
}

// 处理重置密码
const handleResetPassword = async () => {
  if (isResetting.value) return
  
  isResetting.value = true
  
  try {
    // 使用用户服务重置密码
    await userService.resetPassword(resetEmail.value)
    
    // 显示成功通知
    showNotification({
      type: 'success',
      title: t('notification.success'),
      message: t('auth.reset_link_sent')
    })
    
    // 关闭模态框
    showForgotPassword.value = false
  } catch (error) {
    console.error('重置密码失败:', error)
    
    // 显示错误通知
    showNotification({
      type: 'error',
      title: t('notification.error'),
      message: error instanceof Error ? error.message : t('auth.reset_error')
    })
  } finally {
    isResetting.value = false
  }
}

// 社交登录
const socialLogin = async (provider: string) => {
  try {
    // 检查用户服务是否支持社交登录
    if (!userService.socialLogin) {
      throw new Error('社交登录功能暂未实现')
    }
    
    // 使用用户服务进行社交登录
    await userService.socialLogin(provider)
    
    // 显示成功通知
    showNotification({
      type: 'success',
      title: t('notification.success'),
      message: t('auth.login_success')
    })
    
    // 跳转到首页
    router.push('/')
  } catch (error) {
    console.error('社交登录失败:', error)
    
    // 显示错误通知
    showNotification({
      type: 'error',
      title: t('notification.error'),
      message: error instanceof Error ? error.message : `${provider} ${t('auth.login_not_available')}`
    })
  }
}

// 忘记密码
const forgotPassword = () => {
  showForgotPassword.value = true
}

// 接受条款
const acceptTerms = () => {
  registerForm.value.agreeTerms = true
  showTerms.value = false
}

// 返回首页
const goToHome = () => {
  router.push('/')
}

// 显示通知
const showNotification = (notification: { type: string, title: string, message?: string }) => {
  // 创建自定义事件
  const event = new CustomEvent('notification', {
    detail: notification
  })
  
  // 触发事件
  window.dispatchEvent(event)
}
</script>

<style lang="scss" scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: var(--bg-color);
}

.auth-container {
  width: 100%;
  max-width: 500px;
  background-color: var(--bg-color-secondary);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.auth-header {
  padding: 2rem;
  text-align: center;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 2rem;
}

.logo-text {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--heading-color);
  margin: 0;
}

.auth-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.auth-tab {
  flex: 1;
  padding: 1rem;
  text-align: center;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.active {
    color: var(--primary-color);
    border-bottom: 2px solid var(--primary-color);
  }
  
  &:hover:not(.active) {
    color: var(--text-color);
    background-color: var(--hover-color);
  }
}

.auth-form {
  padding: 2rem;
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
  input[type="email"],
  input[type="password"] {
    width: 100%;
    padding: 0.8rem 1rem;
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
}

.password-input {
  position: relative;
  
  input {
    padding-right: 3rem;
  }
  
  .toggle-password {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 1.2rem;
    color: var(--text-color-secondary);
    cursor: pointer;
    padding: 0;
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
  
  label {
    color: var(--text-color);
    cursor: pointer;
  }
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
}

.terms-agreement {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    margin-top: 0.2rem;
    cursor: pointer;
  }
  
  label {
    color: var(--text-color);
    font-size: 0.9rem;
    line-height: 1.4;
    
    a {
      color: var(--primary-color);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.auth-button {
  width: 100%;
  padding: 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:hover:not(:disabled) {
    background-color: var(--primary-color-dark);
  }
  
  &:disabled {
    background-color: var(--border-color);
    cursor: not-allowed;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.social-login {
  margin-top: 2rem;
}

.social-divider {
  text-align: center;
  position: relative;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  margin: 1.5rem 0;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: calc(50% - 3rem);
    height: 1px;
    background-color: var(--border-color);
  }
  
  &::before {
    left: 0;
  }
  
  &::after {
    right: 0;
  }
}

.social-buttons {
  display: flex;
  gap: 1rem;
}

.social-button {
  flex: 1;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &.google {
    background-color: #fff;
    color: #333;
    border: 1px solid #ddd;
    
    &:hover {
      background-color: #f1f1f1;
    }
  }
  
  &.wechat {
    background-color: #07C160;
    color: white;
    border: none;
    
    &:hover {
      background-color: #06ad56;
    }
  }
}

.auth-footer {
  padding: 1.5rem 2rem;
  text-align: center;
  border-top: 1px solid var(--border-color);
}

.back-to-home {
  background: none;
  border: none;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
  
  &:hover {
    color: var(--primary-color);
  }
}

.back-icon {
  font-size: 1rem;
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
  
  &.terms-modal {
    max-width: 700px;
    max-height: 80vh;
    overflow-y: auto;
  }
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

.forgot-password-form {
  .form-group {
    margin-bottom: 1.5rem;
  }
}

.terms-content {
  margin-bottom: 2rem;
  
  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 1.5rem 0 0.5rem 0;
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  p {
    font-size: 0.95rem;
    color: var(--text-color);
    line-height: 1.6;
    margin: 0 0 1rem 0;
  }
}

.terms-actions {
  display: flex;
  gap: 1rem;
  
  .auth-button,
  .cancel-button {
    flex: 1;
  }
  
  .cancel-button {
    padding: 1rem;
    background-color: var(--bg-color-secondary);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--hover-color);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-view {
    padding: 1rem;
  }
  
  .auth-container {
    max-width: 100%;
  }
  
  .auth-header {
    padding: 1.5rem;
  }
  
  .auth-form {
    padding: 1.5rem;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .social-buttons {
    flex-direction: column;
  }
  
  .terms-actions {
    flex-direction: column;
  }
}
</style>