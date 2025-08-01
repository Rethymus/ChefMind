<template>
  <header class="app-header">
    <div class="container">
      <div class="header-content">
        <!-- Logo区域 -->
        <div class="logo-section">
          <div class="logo-link" @click="handleLogoClick">
            <el-icon class="logo-icon" :size="32">
              <Dish />
            </el-icon>
            <h1 class="logo-text">ChefMind 智食谱</h1>
          </div>
        </div>
        
        <!-- 导航菜单 -->
        <nav class="nav-menu">
          <router-link 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path" 
            class="nav-link"
            :class="{ active: $route.path === item.path }"
          >
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.label }}</span>
          </router-link>
        </nav>
        
        <!-- 右侧操作区 -->
        <div class="header-actions">
          <!-- 主题切换 -->
          <el-tooltip content="切换主题" placement="bottom">
            <el-button 
              circle 
              @click="themeStore.toggleTheme"
              :icon="themeStore.isDark ? Sunny : Moon"
            />
          </el-tooltip>
          
          <!-- 用户菜单 -->
          <el-dropdown trigger="click">
            <el-button circle>
              <el-icon><User /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleProfile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item @click="handleSettings">
                  <el-icon><Setting /></el-icon>
                  设置
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        
        <!-- 移动端菜单按钮 -->
        <div class="mobile-menu-btn">
          <el-button 
            circle 
            @click="showMobileMenu = !showMobileMenu"
            :icon="showMobileMenu ? Close : Menu"
          />
        </div>
      </div>
      
      <!-- 移动端导航菜单 -->
      <div v-show="showMobileMenu" class="mobile-nav">
        <router-link 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path" 
          class="mobile-nav-link"
          @click="showMobileMenu = false"
        >
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useRecipeStore } from '@/stores/recipe'
import { ElMessage } from 'element-plus'
import {
  House,
  Collection,
  InfoFilled,
  User,
  Setting,
  SwitchButton,
  Sunny,
  Moon,
  Menu,
  Close,
  Dish
} from '@element-plus/icons-vue'

const router = useRouter()
const themeStore = useThemeStore()
const recipeStore = useRecipeStore()
const showMobileMenu = ref(false)

// 导航菜单项
const navItems = [
  {
    path: '/',
    label: '智能生成',
    icon: House
  },
  {
    path: '/my-recipes',
    label: '我的菜谱',
    icon: Collection
  },
  {
    path: '/about',
    label: '关于我们',
    icon: InfoFilled
  }
]

// 处理Logo点击 - 重新开始
const handleLogoClick = () => {
  // 重置菜谱store状态
  recipeStore.$reset()
  
  // 跳转到首页
  router.push('/')
  
  // 显示提示信息
  ElMessage.success('已重新开始，可以开始制作新的菜谱')
}

// 处理用户操作
const handleProfile = () => {
  ElMessage.info('个人中心功能开发中...')
}

const handleSettings = () => {
  ElMessage.info('设置功能开发中...')
}

const handleLogout = () => {
  ElMessage.success('已退出登录')
}
</script>

<style lang="scss" scoped>
.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
  }
  
  .logo-section {
    .logo-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
      
      .logo-icon {
        color: #ff6b6b;
      }
      
      .logo-text {
        font-size: 1.5rem;
        font-weight: 700;
        color: #2c3e50;
        margin: 0;
      }
    }
  }
  
  .nav-menu {
    display: flex;
    gap: 2rem;
    
    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      text-decoration: none;
      color: #666;
      font-weight: 500;
      transition: all 0.3s ease;
      
      &:hover,
      &.active {
        color: #ff6b6b;
        background: rgba(255, 107, 107, 0.1);
      }
    }
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .mobile-menu-btn {
    display: none;
  }
  
  .mobile-nav {
    display: none;
    flex-direction: column;
    padding: 1rem 0;
    border-top: 1px solid #eee;
    
    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      text-decoration: none;
      color: #666;
      font-weight: 500;
      transition: all 0.3s ease;
      
      &:hover {
        color: #ff6b6b;
        background: rgba(255, 107, 107, 0.1);
      }
    }
  }
}

// 暗色主题
:global(.dark) .app-header {
  background: rgba(31, 41, 55, 0.95);
  
  .logo-text {
    color: #f9fafb;
  }
  
  .nav-link {
    color: #d1d5db;
    
    &:hover,
    &.active {
      color: #ff6b6b;
    }
  }
  
  .mobile-nav {
    border-top-color: #374151;
    
    .mobile-nav-link {
      color: #d1d5db;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .app-header {
    .nav-menu {
      display: none;
    }
    
    .header-actions {
      display: none;
    }
    
    .mobile-menu-btn {
      display: block;
    }
    
    .mobile-nav {
      display: flex;
    }
  }
}

@media (max-width: 480px) {
  .app-header {
    .container {
      padding: 0 15px;
    }
    
    .header-content {
      height: 60px;
    }
    
    .logo-text {
      font-size: 1.2rem;
    }
  }
}
</style>