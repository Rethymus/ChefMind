# 🍳 ChefMind 智食谱

> AI驱动的智能菜谱生成与烹饪指导平台

[![Vue](https://img.shields.io/badge/Vue-3.4+-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.4+-409EFF?style=flat-square&logo=element&logoColor=white)](https://element-plus.org/)
[![Version](https://img.shields.io/badge/Version-2.1.0-brightgreen?style=flat-square)](./CHANGELOG.md)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

## 📖 项目简介

ChefMind 智食谱是一个基于AI技术的智能菜谱生成平台，通过三步式交互帮助用户快速找到适合的菜谱。用户只需选择食材、烹饪方式和约束条件，AI就能生成个性化的菜谱推荐，并提供详细的制作指导。

## ✨ 核心特色

- 🤖 **AI智能生成** - 支持智谱GLM、OpenAI GPT等多个AI提供商
- 🎯 **三步式交互** - 食材选择 → 烹饪方式 → 约束条件
- 🎨 **动态封面生成** - AI生成精美SVG菜谱封面，支持毛玻璃效果
- 📱 **响应式设计** - 完美适配移动端和桌面端
- 🌙 **暗色主题** - 支持亮色/暗色主题切换
- 🔗 **多媒体跳转** - 一键跳转B站、抖音、下厨房等平台
- ⭐ **评分系统** - 难度星级、营养评分、时间估算
- 📋 **详细指导** - 完整制作步骤和营养信息
- 📊 **数据分析** - 用户健康数据分析和个性化推荐
- 🛒 **购物清单** - 自动生成购物清单功能
- 👥 **备注功能** - 为用户提供人性化的备注功能
- 🎯 **个性化推荐** - 基于用户行为的智能推荐系统

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

### 启动开发服务器

```bash
# 启动开发服务器
npm run dev

# 或
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 🏗️ 项目结构

```
ChefMind/
├── public/                 # 静态资源
│   ├── icons/             # PWA 图标
│   ├── images/            # 图片资源
│   ├── manifest.json      # PWA 配置
│   └── sw.js              # Service Worker
├── src/
│   ├── components/         # 可复用组件
│   │   ├── ai/            # AI相关组件
│   │   ├── analytics/     # 数据分析组件
│   │   ├── common/        # 通用组件
│   │   ├── demo/          # 演示组件
│   │   ├── layout/        # 布局组件
│   │   └── recipe/        # 菜谱相关组件
│   ├── views/             # 页面视图
│   │   ├── AIView.vue     # AI助手页面
│   │   ├── AnalyticsView.vue  # 数据分析页面
│   │   ├── CommunityView.vue  # 社区页面
│   │   ├── FavoritesPageComplete.vue  # 收藏页面
│   │   ├── HomeView.vue   # 首页
│   │   ├── SearchView.vue # 搜索页面
│   │   ├── ShoppingListView.vue  # 购物清单页面
│   │   └── ...            # 其他页面
│   ├── stores/            # Pinia状态管理
│   ├── services/          # API服务层
│   │   ├── aiProviders/   # AI提供商实现
│   │   ├── aiService.ts   # AI服务
│   │   ├── glmService.ts  # 智谱GLM服务
│   │   ├── analyticsService.ts  # 数据分析服务
│   │   └── ...            # 其他服务
│   ├── composables/       # 组合式函数
│   │   ├── useI18n.ts     # 国际化
│   │   ├── useNotification.ts  # 通知系统
│   │   └── usePersonalizedRecommendations.ts  # 个性化推荐
│   ├── types/             # TypeScript类型定义
│   ├── data/              # 静态数据配置
│   │   ├── cookingMethods.ts  # 烹饪方式数据
│   │   └── chineseDietaryGuidelines.ts  # 中式饮食指南
│   ├── styles/            # 全局样式
│   │   ├── global.scss    # 全局样式
│   │   ├── variables.scss # 样式变量
│   │   └── ai-recipe.scss # AI菜谱样式
│   ├── utils/             # 工具函数
│   │   ├── aiUtils.ts     # AI工具函数
│   │   ├── apiCache.ts    # API缓存
│   │   ├── errorHandler.ts # 错误处理
│   │   ├── imageUtils.ts  # 图片处理
│   │   └── svgGenerator.ts # SVG生成器
│   ├── config/            # 配置文件
│   ├── router/            # 路由配置
│   ├── App.vue            # 根组件
│   └── main.ts            # 应用入口
├── tests/                 # 测试文件
├── docs/                  # 项目文档
├── docker-compose.yml     # Docker编排
├── Dockerfile             # Docker配置
├── package.json           # 项目配置
├── vite.config.ts         # Vite配置
├── tsconfig.json          # TypeScript配置
└── README.md              # 项目说明
```

## 🛠️ 技术栈

### 前端框架

- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - JavaScript的超集，提供类型安全
- **Vite** - 下一代前端构建工具

### UI组件库

- **Element Plus** - 基于Vue 3的组件库
- **@element-plus/icons-vue** - Element Plus图标库

### 状态管理

- **Pinia** - Vue的状态管理库

### 路由管理

- **Vue Router** - Vue.js官方路由管理器

### 工具库

- **@vueuse/core** - Vue组合式API工具集
- **axios** - HTTP客户端
- **lodash-es** - JavaScript实用工具库
- **animate.css** - CSS动画库
- **chart.js** - 图表库
- **html2canvas** - 网页截图
- **qrcode** - 二维码生成

### 开发工具

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Sass** - CSS预处理器
- **Vitest** - 单元测试框架
- **TypeScript** - 类型检查

## ⚙️ 配置说明

### 环境变量配置

项目支持多种 AI 提供商，需要配置相应的 API Key：

```bash
# .env.local
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GLM_API_KEY=your_glm_api_key
VITE_GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
```

### AI 提供商配置

支持的 AI 提供商：

- **OpenAI**: GPT-3.5/GPT-4 模型
- **GLM**: 智谱清言大模型
- **Mock**: 开发测试用的模拟 AI

配置文件位置：`src/config/aiConfig.ts`

### PWA 配置

项目支持 PWA（Progressive Web App）功能：

- 离线缓存
- 桌面安装
- 推送通知（规划中）

配置文件：`public/manifest.json`

### Docker 配置

提供完整的 Docker 部署方案：

- `Dockerfile`: 生产环境镜像
- `Dockerfile.dev`: 开发环境镜像
- `docker-compose.yml`: 容器编排
- 便捷脚本：`docker-run.bat`, `docker-dev.bat`

## 🎯 功能特性

### 1. 智能筛选系统

#### 第一步：食材选择

- 🥬 分类展示：蔬菜、肉类、海鲜、主食、调料
- 🔍 智能搜索：支持食材名称搜索
- 🏷️ 多选标签：实时显示已选食材
- 📷 食材图片：直观展示每种食材

#### 第二步：烹饪方式

- 🍳 多种方式：炒、煮、蒸、烤、炸、凉拌等
- 🎯 精准匹配：根据食材推荐最佳烹饪方式
- ⚡ 一键选择：常用烹饪方式快速选择

#### 第三步：约束条件

- ⏱️ 时间控制：设置烹饪时间范围
- 👥 分量选择：1-8人份灵活调整
- 🌶️ 口味偏好：清淡、适中、重口味
- 🥗 饮食限制：素食、无糖、低盐等选项

### 2. AI 菜谱生成

#### 智能生成引擎

- 🧠 **多模型支持**：智谱GLM、OpenAI GPT等
- 📊 **营养分析**：自动计算营养成分和热量
- 🎨 **动态封面**：AI生成精美SVG菜谱封面
- 🔄 **实时优化**：根据用户反馈不断改进

#### 生成结果展示

- 📝 **详细步骤**：分步骤详细制作指导
- 📊 **营养信息**：蛋白质、脂肪、碳水化合物等
- ⭐ **评分系统**：难度星级、营养评分、时间估算
- 🏷️ **标签分类**：菜系、口味、适宜人群等

### 3. 个性化推荐系统

#### 用户行为分析

- 📈 **浏览记录**：分析用户浏览偏好
- ❤️ **收藏分析**：基于收藏菜谱推荐相似内容
- 🎯 **智能推荐**：机器学习算法个性化推荐
- 📊 **数据可视化**：用户行为数据图表展示

#### 健康管理

- 🏥 **中医体质**：传统中医体质评估
- 💊 **营养建议**：基于体质的饮食建议
- 📅 **膳食计划**：个性化一周膳食规划
- 🎯 **目标管理**：减脂、增肌、养生等目标

### 4. 社区功能

#### 内容分享

- 📷 **菜谱分享**：用户上传原创菜谱
- 💬 **评论互动**：菜谱评论和讨论
- ⭐ **评分系统**：用户为菜谱评分
- 🏆 **热门排行**：基于评分和热度的排行榜

#### 用户系统

- 👤 **个人资料**：用户信息和偏好设置
- 📊 **成就系统**：烹饪达人等级和徽章
- 👥 **关注功能**：关注喜欢的美食达人
- 📱 **消息通知**：评论、点赞等互动通知

### 5. 实用工具

#### 购物清单

- 🛒 **自动生成**：根据菜谱自动生成购物清单
- 📝 **分类管理**：按食材类别分组显示
- ✅ **采购标记**：购买完成状态标记
- 📱 **离线使用**：PWA支持离线查看

#### 烹饪助手

- ⏰ **定时提醒**：烹饪步骤定时器
- 📐 **单位换算**：重量、体积单位自动换算
- 🥄 **用量计算**：根据人数自动调整用量
- 📊 **营养计算器**：实时计算营养成分

### 6. 多媒体跳转

#### 平台整合

- 📺 **B站跳转**：一键搜索相关烹饪视频
- 📱 **抖音跳转**：查看短视频烹饪教程
- 🥘 **下厨房**：跳转查看详细制作方法
- 🍜 **美食天下**：获取更多菜谱变化

#### 内容丰富

- 🎥 **视频教程**：图文结合视频指导
- 📸 **步骤图片**：每个步骤配图说明
- 🎧 **语音指导**：支持语音播放制作步骤
- 📋 **打印功能**：菜谱内容一键打印
- 💡 AI建议：食材搭配合理性提示

#### 第二步：烹饪方式选择

- 🍳 8种烹饪方式：炒、煮、蒸、烤、炸、炖、凉拌、焖
- 🎯 智能推荐：根据食材推荐最适合的烹饪方式
- 🔄 多选支持：支持多种烹饪方式组合

#### 第三步：约束条件设定

- ⏰ 时间选择：15分钟内、30分钟内、1小时内、不限时间
- 👥 人数选择：1-2人、3-4人、5-6人、6人以上
- 📊 难度偏好：简单、中等、困难、不限
- 🌶️ 口味偏好：清淡、适中、重口味

### 2. AI菜谱生成引擎

- 🧠 智能分析：整合用户所有选择条件
- 📋 多方案推荐：生成3-5个不同的菜谱方案
- ⭐ 评分系统：难度星级、营养星级、时间准确性
- 🎯 个性化：基于用户偏好优化推荐

### 3. 详细烹饪指导系统

- 📝 详细步骤：包含时间、温度、分量、技巧要点
- 💡 小贴士：每个步骤的注意事项和建议
- ✅ 进度追踪：支持步骤完成状态标记
- 📊 营养信息：营养成分分析和可视化

### 4. 多媒体资源跳转

- 📺 **B站/抖音**：搜索相关烹饪视频
- 📖 **下厨房**：查看图文教程
- 📱 **小红书**：浏览用户分享和评价
- 🔗 自动生成搜索关键词，新标签页打开

## 🎨 界面设计

### 视觉风格

- 🎨 温馨美食主题色彩（暖色调为主）
- 📱 响应式卡片布局设计
- 🎯 直观的图标和按钮设计
- 🌙 支持亮色/暗色主题切换

### 交互体验

- 📈 渐进式信息展示，避免信息过载
- 🤖 智能的默认选项和推荐提示
- ✨ 流畅的动画效果和状态指示
- 🔄 便捷的返回和修改功能

## 📱 响应式支持

- **桌面端** (>1200px) - 完整功能展示
- **平板端** (768px-1200px) - 自适应布局
- **移动端** (<768px) - 优化触摸交互

## 🔧 开发指南

### 代码规范

项目使用 ESLint 和 Prettier 进行代码规范检查和格式化：

```bash
# 代码检查
npm run lint

# 代码格式化
npm run format

# TypeScript类型检查
npm run type-check
```

### 组件开发

```vue
<template>
  <div class="component-name">
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
  // 使用 Composition API 和 TypeScript
  import { ref, computed } from 'vue'

  // 定义Props类型
  interface Props {
    title: string
    count?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    count: 0,
  })

  // 定义Emits类型
  interface Emits {
    (e: 'update', value: string): void
  }

  const emit = defineEmits<Emits>()
</script>

<style lang="scss" scoped>
  .component-name {
    // 组件样式
  }
</style>
```

### 状态管理

使用 Pinia 进行状态管理：

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useExampleStore = defineStore('example', () => {
  // 状态
  const count = ref(0)

  // 计算属性
  const doubleCount = computed(() => count.value * 2)

  // 方法
  const increment = () => {
    count.value++
  }

  return {
    count,
    doubleCount,
    increment,
  }
})
```

## 📄 文档说明

### 项目文档结构

- [`README.md`](./README.md) - 项目主文档
- [`CHANGELOG.md`](./CHANGELOG.md) - 版本更新记录
- [`docs/FEATURES.md`](./docs/FEATURES.md) - 功能特性详细说明
- [`tests/README.md`](./tests/README.md) - 测试文档
- [`DOCKER_DEPLOYMENT_GUIDE.md`](./DOCKER_DEPLOYMENT_GUIDE.md) - Docker部署指南
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) - 贡献指南
- [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) - 行为准则

### 开发指南

详细的开发指南请参考 [GitHub Copilot 项目指南](./.github/copilot-instructions.md)

## 🚀 部署指南

### 构建生产版本

```bash
npm run build
```

构建完成后，`dist` 目录包含了所有静态文件。

### 静态部署

项目可以部署到任何静态文件托管服务：

- **Vercel**:

  ```bash
  # 安装 Vercel CLI
  npm i -g vercel
  # 部署
  vercel --prod
  ```

- **Netlify**:

  ```bash
  # 安装 Netlify CLI
  npm install -g netlify-cli
  # 部署
  netlify deploy --prod --dir=dist
  ```

- **GitHub Pages**: 配置 GitHub Actions 自动部署
- **腾讯云静态网站托管**: 上传到云开发静态托管

### Docker 部署

#### 快速部署（推荐）

```bash
# Windows
./docker-run.bat

# Linux/macOS
docker-compose up -d
```

#### 手动构建

```bash
# 构建镜像
docker build -t chefmind .

# 运行容器
docker run -d -p 3000:80 --name chefmind-app chefmind
```

#### 开发环境部署

```bash
# Windows
./docker-dev.bat

# Linux/macOS
docker-compose -f docker-compose.yml up -d
```

### 环境变量配置

生产环境需要配置以下环境变量：

```bash
# .env.production
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GLM_API_KEY=your_glm_api_key
VITE_GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
VITE_API_BASE_URL=https://your-api-domain.com
```

### 性能优化

生产环境建议启用：

- Gzip/Brotli 压缩
- CDN 加速
- HTTP/2
- 浏览器缓存策略

详细部署指南请参考：`DOCKER_DEPLOYMENT_GUIDE.md`

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能 (对应MINOR版本号)
- `fix`: 修复bug (对应PATCH版本号)
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `ui`: UI/UX改进
- `feat!`: 破坏性变更 (对应MAJOR版本号)

### 版本发布流程

1. 更新 `package.json` 中的版本号
2. 更新 `CHANGELOG.md` 记录变更
3. 提交代码并创建版本标签
4. 创建 Release 发布

```bash
# 发布新版本示例
git add .
git commit -m "feat: 添加SVG动态封面生成功能"
git tag v2.1.0
git push origin main --tags
```

## 📄 许可证

本项目基于 [MIT License](./LICENSE) 开源。

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Element Plus](https://element-plus.org/) - Vue 3组件库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - JavaScript超集
- [Pinia](https://pinia.vuejs.org/) - Vue状态管理库

---

<div align="center">
  <p>如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！</p>
  <p>Made with ❤️ by ChefMind Team</p>
</div>
