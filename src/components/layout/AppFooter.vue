<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-content">
        <!-- 左侧信息 -->
        <div class="footer-info">
          <div class="logo-section">
            <el-icon class="logo-icon" :size="24">
              <Dish />
            </el-icon>
            <span class="logo-text">ChefMind 智食谱</span>
          </div>
          <p class="description">
            AI驱动的智能菜谱生成平台，让烹饪变得更简单、更有趣
          </p>
          <div class="social-links">
            <el-button circle size="small" @click="openLink('github')">
              <el-icon><Link /></el-icon>
            </el-button>
            <el-button circle size="small" @click="openLink('weibo')">
              <el-icon><Share /></el-icon>
            </el-button>
            <el-button circle size="small" @click="openLink('wechat')">
              <el-icon><ChatDotRound /></el-icon>
            </el-button>
          </div>
        </div>
        
        <!-- 快速链接 -->
        <div class="footer-links">
          <div class="link-group">
            <h4>产品功能</h4>
            <ul>
              <li><a href="#" @click.prevent="scrollToTop">智能生成</a></li>
              <li><a href="#" @click.prevent="scrollToTop">食材搭配</a></li>
              <li><a href="#" @click.prevent="scrollToTop">烹饪指导</a></li>
              <li><a href="#" @click.prevent="scrollToTop">营养分析</a></li>
            </ul>
          </div>
          
          <div class="link-group">
            <h4>帮助支持</h4>
            <ul>
              <li><a href="#" @click.prevent="showHelp">使用指南</a></li>
              <li><a href="#" @click.prevent="showFAQ">常见问题</a></li>
              <li><a href="#" @click.prevent="showContact">联系我们</a></li>
              <li><a href="#" @click.prevent="showFeedback">意见反馈</a></li>
            </ul>
          </div>
          
          <div class="link-group">
            <h4>关于我们</h4>
            <ul>
              <li><a href="#" @click.prevent="showAbout">公司介绍</a></li>
              <li><a href="#" @click.prevent="showPrivacy">隐私政策</a></li>
              <li><a href="#" @click.prevent="showTerms">服务条款</a></li>
              <li><a href="#" @click.prevent="showCareer">加入我们</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- 底部版权信息 -->
      <div class="footer-bottom">
        <div class="copyright">
          <p>&copy; {{ currentYear }} ChefMind 智食谱. 保留所有权利.</p>
          <p class="tech-info">
            基于 Vue 3 + TypeScript + Element Plus 构建
          </p>
        </div>
        
        <div class="footer-stats">
          <div class="stat-item">
            <el-icon><User /></el-icon>
            <span>{{ formatNumber(userCount) }}+ 用户</span>
          </div>
          <div class="stat-item">
            <el-icon><Collection /></el-icon>
            <span>{{ formatNumber(recipeCount) }}+ 菜谱</span>
          </div>
          <div class="stat-item">
            <el-icon><Star /></el-icon>
            <span>{{ rating }} 评分</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Dish,
  Link,
  Share,
  ChatDotRound,
  User,
  Collection,
  Star
} from '@element-plus/icons-vue'

// 当前年份
const currentYear = computed(() => new Date().getFullYear())

// 模拟统计数据
const userCount = 15680
const recipeCount = 8520
const rating = 4.8

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

// 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 打开外部链接
const openLink = (platform: string) => {
  const links = {
    github: 'https://github.com',
    weibo: 'https://weibo.com',
    wechat: '#'
  }
  
  if (platform === 'wechat') {
    ElMessage.info('微信二维码功能开发中...')
  } else {
    window.open(links[platform as keyof typeof links], '_blank')
  }
}

// 显示帮助信息
const showHelp = () => ElMessage.info('使用指南功能开发中...')
const showFAQ = () => ElMessage.info('常见问题功能开发中...')
const showContact = () => ElMessage.info('联系我们功能开发中...')
const showFeedback = () => ElMessage.info('意见反馈功能开发中...')
const showAbout = () => ElMessage.info('公司介绍功能开发中...')
const showPrivacy = () => ElMessage.info('隐私政策功能开发中...')
const showTerms = () => ElMessage.info('服务条款功能开发中...')
const showCareer = () => ElMessage.info('招聘信息功能开发中...')
</script>

<style lang="scss" scoped>
.app-footer {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-top: auto;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .footer-content {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 3rem;
    padding: 3rem 0 2rem;
  }
  
  .footer-info {
    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 1rem;
      
      .logo-icon {
        color: #ffd700;
      }
      
      .logo-text {
        font-size: 1.3rem;
        font-weight: 700;
      }
    }
    
    .description {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    
    .social-links {
      display: flex;
      gap: 12px;
      
      .el-button {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
        color: white;
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
        }
      }
    }
  }
  
  .footer-links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    
    .link-group {
      h4 {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #ffd700;
      }
      
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        
        li {
          margin-bottom: 0.5rem;
          
          a {
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            transition: color 0.3s ease;
            cursor: pointer;
            
            &:hover {
              color: white;
            }
          }
        }
      }
    }
  }
  
  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    
    .copyright {
      p {
        margin: 0;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
        
        &.tech-info {
          margin-top: 0.5rem;
          font-size: 0.8rem;
        }
      }
    }
    
    .footer-stats {
      display: flex;
      gap: 2rem;
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;
        
        .el-icon {
          color: #ffd700;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .app-footer {
    .footer-content {
      grid-template-columns: 1fr;
      gap: 2rem;
      padding: 2rem 0 1.5rem;
    }
    
    .footer-links {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    
    .footer-bottom {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
      
      .footer-stats {
        justify-content: center;
        gap: 1.5rem;
      }
    }
  }
}

@media (max-width: 480px) {
  .app-footer {
    .container {
      padding: 0 15px;
    }
    
    .footer-stats {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
}
</style>