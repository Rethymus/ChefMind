<template>
  <footer class="glass-footer">
    <!-- 流体背景动画 -->
    <div class="fluid-background">
      <div class="fluid-orb fluid-orb-1"></div>
      <div class="fluid-orb fluid-orb-2"></div>
      <div class="fluid-orb fluid-orb-3"></div>
      <div class="fluid-orb fluid-orb-4"></div>
    </div>

    <!-- 主要内容区域 -->
    <div class="footer-content">
      <!-- 品牌信息 -->
      <div class="footer-section brand-section">
        <div class="logo">
          <h3 class="brand-name">ChefMind</h3>
          <p class="brand-tagline">智能烹饪助手</p>
        </div>
        <p class="brand-description">用AI技术重新定义烹饪体验，让每一道菜都充满创意与美味</p>
      </div>

      <!-- 快速链接按钮 -->
      <div class="footer-section links-section">
        <div class="footer-links-row">
          <a href="#" @click="showAboutUs" class="footer-link glass-button">
            <span class="link-icon">📖</span>
            关于我们
          </a>
          <a href="#" @click="showTerms" class="footer-link glass-button">
            <span class="link-icon">📋</span>
            用户协议
          </a>
          <a href="#" @click="showPrivacy" class="footer-link glass-button">
            <span class="link-icon">🔒</span>
            隐私协议
          </a>
          <a
            href="https://bilibili.com/video/BV1GJ411x7h7/"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-link glass-button primary"
          >
            <span class="link-icon">🌐</span>
            访问官网
          </a>
        </div>
      </div>
    </div>

    <!-- 模态框容器 -->
    <teleport to="body">
      <!-- 关于我们模态框 -->
      <div v-if="showAboutModal" class="modal-overlay" @click="closeModals">
        <div class="modal-content glass-modal" @click.stop>
          <div class="modal-header">
            <h3>关于我们</h3>
            <button class="modal-close" @click="closeModals">×</button>
          </div>
          <div class="modal-body">
            <p>ChefMind 是一款基于人工智能的智能烹饪助手，致力于为用户提供个性化的烹饪体验。</p>
            <p>我们的使命是通过先进的技术，让每个人都能轻松享受烹饪的乐趣。</p>
            <p>团队由热爱美食和技术的专业人士组成，不断探索AI与烹饪的完美结合。</p>
            <div class="video-section">
              <a
                href="https://bilibili.com/video/BV1GJ411x7h7/"
                target="_blank"
                rel="noopener noreferrer"
                class="video-play-btn glass-button"
              >
                <span class="video-icon">▶️</span>
                观看介绍视频
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户协议模态框 -->
      <div v-if="showTermsModal" class="modal-overlay" @click="closeModals">
        <div class="modal-content glass-modal" @click.stop>
          <div class="modal-header">
            <h3>用户协议</h3>
            <button class="modal-close" @click="closeModals">×</button>
          </div>
          <div class="modal-body">
            <p>欢迎使用 ChefMind 智能烹饪助手！</p>
            <p>1. 本应用仅供个人学习和娱乐使用。</p>
            <p>2. 用户应当遵守相关法律法规，不得利用本应用进行违法活动。</p>
            <p>3. 本应用提供的菜谱建议仅供参考，实际烹饪请根据个人情况调整。</p>
            <p>4. 用户应当妥善保管个人信息，不要在应用中分享敏感信息。</p>
            <p>5. 本团队保留对协议内容的最终解释权。</p>
          </div>
        </div>
      </div>

      <!-- 隐私协议模态框 -->
      <div v-if="showPrivacyModal" class="modal-overlay" @click="closeModals">
        <div class="modal-content glass-modal" @click.stop>
          <div class="modal-header">
            <h3>隐私协议</h3>
            <button class="modal-close" @click="closeModals">×</button>
          </div>
          <div class="modal-body">
            <p>ChefMind 重视用户隐私保护，特此承诺：</p>
            <p>1. 我们不会收集用户的个人身份信息。</p>
            <p>2. 所有用户数据仅存储在本地设备上。</p>
            <p>3. 我们不会向第三方分享用户信息。</p>
            <p>4. 使用AI服务时，仅会发送必要的菜谱相关数据。</p>
            <p>5. 用户可以随时清除本地数据。</p>
            <p>6. 我们会不断改进安全措施，保护用户隐私。</p>
          </div>
        </div>
      </div>
    </teleport>
  </footer>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  // 模态框状态
  const showAboutModal = ref(false)
  const showTermsModal = ref(false)
  const showPrivacyModal = ref(false)

  // 显示关于我们
  const showAboutUs = (event: Event) => {
    event.preventDefault()
    showAboutModal.value = true
  }

  // 显示用户协议
  const showTerms = (event: Event) => {
    event.preventDefault()
    showTermsModal.value = true
  }

  // 显示隐私协议
  const showPrivacy = (event: Event) => {
    event.preventDefault()
    showPrivacyModal.value = true
  }

  // 关闭所有模态框
  const closeModals = () => {
    showAboutModal.value = false
    showTermsModal.value = false
    showPrivacyModal.value = false
  }
</script>

<style scoped lang="scss">
  // 基础变量
  :root {
    --glass-bg: rgba(255, 255, 255, 0.25);
    --glass-border: rgba(0, 0, 0, 0.1);
    --glass-text: rgba(0, 0, 0, 0.8);
    --glass-shadow: rgba(0, 0, 0, 0.1);
  }

  // 页脚基础样式
  .glass-footer {
    position: relative;
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.1) 0%,
      rgba(118, 75, 162, 0.1) 25%,
      rgba(240, 147, 251, 0.1) 50%,
      rgba(245, 87, 108, 0.1) 75%,
      rgba(79, 172, 254, 0.1) 100%
    );
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid var(--glass-border);
    color: var(--glass-text);
    overflow: hidden;
    min-height: 280px;
  }

  // 流体背景动画
  .fluid-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
  }

  .fluid-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(40px);
    opacity: 0.6;
    animation: fluidMove 20s ease-in-out infinite;
  }

  .fluid-orb-1 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.8) 0%, rgba(102, 126, 234, 0) 70%);
    top: -150px;
    left: -150px;
    animation-delay: 0s;
  }

  .fluid-orb-2 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(240, 147, 251, 0.8) 0%, rgba(240, 147, 251, 0) 70%);
    bottom: -200px;
    right: -200px;
    animation-delay: -5s;
  }

  .fluid-orb-3 {
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, rgba(79, 172, 254, 0.8) 0%, rgba(79, 172, 254, 0) 70%);
    top: 50%;
    left: 20%;
    animation-delay: -10s;
  }

  .fluid-orb-4 {
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(245, 87, 108, 0.8) 0%, rgba(245, 87, 108, 0) 70%);
    top: 30%;
    right: 10%;
    animation-delay: -15s;
  }

  @keyframes fluidMove {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    25% {
      transform: translate(100px, -50px) scale(1.1);
    }
    50% {
      transform: translate(-50px, 100px) scale(0.9);
    }
    75% {
      transform: translate(80px, 80px) scale(1.05);
    }
  }

  // 主要内容区域
  .footer-content {
    position: relative;
    z-index: 1;
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 20px 30px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 50px;
    align-items: center;
  }

  // 页脚区块
  .footer-section {
    text-align: center;
  }

  .brand-section {
    text-align: left;
  }

  .brand-name {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 10px 0;
    background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c);
    background-size: 400% 400%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 8s ease-in-out infinite;
  }

  .brand-tagline {
    font-size: 1.1rem;
    color: var(--glass-text);
    margin: 0 0 15px 0;
  }

  .brand-description {
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--glass-text);
    max-width: 350px;
  }

  .section-title {
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0 0 20px 0;
    color: var(--glass-text);
  }

  // 页脚链接 - 横向布局
  .footer-links-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
    align-items: center;
  }

  .footer-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    color: var(--glass-text);
    text-decoration: none;
    font-weight: 500;
    font-size: 0.9rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    white-space: nowrap;
  }

  .footer-link::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  .footer-link:hover::before {
    left: 100%;
  }

  .footer-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .footer-link.primary {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(240, 147, 251, 0.3));
    border-color: rgba(255, 255, 255, 0.3);
  }

  .link-icon {
    font-size: 1.1rem;
  }

  // 联系信息
  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .contact-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 8px 16px;
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    font-size: 0.9rem;
  }

  .contact-icon {
    font-size: 1rem;
  }

  // 渐变文字动画
  @keyframes gradientShift {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  // 毛玻璃按钮
  .glass-button {
    position: relative;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .glass-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }

  // 模态框样式
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  }

  .modal-content {
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    border-radius: 20px;
    border: 1px solid var(--glass-border);
  }

  .glass-modal {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    color: #333;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25px 30px 15px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
  }

  .modal-close:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #333;
  }

  .modal-body {
    padding: 25px 30px;
  }

  .modal-body p {
    margin: 0 0 15px 0;
    line-height: 1.6;
    color: #666;
  }

  .modal-body p:last-child {
    margin-bottom: 0;
  }

  // 视频区域
  .video-section {
    margin-top: 25px;
    text-align: center;
  }

  .video-play-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(240, 147, 251, 0.3));
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(102, 126, 234, 0.3);
    border-radius: 25px;
    color: var(--glass-text);
    text-decoration: none;
    font-weight: 500;
    font-size: 0.95rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .video-play-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    border-color: rgba(102, 126, 234, 0.5);
  }

  .video-play-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  .video-play-btn:hover::before {
    left: 100%;
  }

  .video-icon {
    font-size: 1.1rem;
  }

  // 响应式设计
  @media (max-width: 768px) {
    .footer-content {
      grid-template-columns: 1fr;
      gap: 30px;
      padding: 30px 20px 20px;
    }

    .brand-section {
      text-align: center;
    }

    .brand-description {
      max-width: 100%;
      margin: 0 auto;
    }

    .footer-links-row {
      flex-direction: column;
      gap: 12px;
    }

    .footer-link {
      width: 100%;
      max-width: 200px;
      margin: 0 auto;
    }

    .fluid-orb-1,
    .fluid-orb-2,
    .fluid-orb-3,
    .fluid-orb-4 {
      width: 150px;
      height: 150px;
    }
  }

  @media (max-width: 480px) {
    .glass-footer {
      min-height: 280px;
    }

    .brand-name {
      font-size: 2rem;
    }

    .footer-content {
      padding: 25px 15px 15px;
    }

    .modal-header {
      padding: 20px 20px 10px;
    }

    .modal-body {
      padding: 20px;
    }

    .modal-content {
      width: 95%;
    }
  }
</style>
