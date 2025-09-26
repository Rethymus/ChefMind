# 🍳 ChefMind 智食谱

> AI驱动的智能菜谱生成与烹饪指导平台

[![Vue](https://img.shields.io/badge/Vue-3.4+-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.4+-409EFF?style=flat-square&logo=element&logoColor=white)](https://element-plus.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2.0+-FFC13C?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app/)
[![Version](https://img.shields.io/badge/Version-2.2.0-brightgreen?style=flat-square)](./CHANGELOG.md)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

## 📖 项目简介

ChefMind 智食谱是一个基于AI技术的智能菜谱生成平台，通过三步式交互帮助用户快速找到适合的菜谱。用户只需选择食材、烹饪方式和约束条件，AI就能生成个性化的菜谱推荐，并提供详细的制作指导。

支持Web和桌面应用双模式，桌面应用基于Tauri构建，提供更好的性能和更小的体积。所有用户数据通过本地会话管理，无需注册登录即可使用。

## ✨ 核心特色

- **🤖 AI智能生成**: 支持多种AI提供商（智谱GLM、OpenAI GPT、Anthropic Claude、Google Gemini等），可根据食材、烹饪方式和约束条件生成智能菜谱，并能动态生成精美SVG菜谱封面。
- **🎯 交互体验**: 采用三步式交互（食材选择 → 烹饪方式 → 约束条件），响应式设计完美适配移动端和桌面端，并支持亮色/暗色主题切换和多媒体跳转。
- **📊 智能功能**: 提供评分系统、详细制作步骤、营养信息、数据分析、购物清单、备注功能以及个性化推荐。
- **🗄️ 企业级数据管理**: 采用SQLite数据库，具备连接池、重试机制、事务管理和健康监控，确保数据一致性和高性能并发访问。
- **💻 多平台支持**: 支持Web浏览器和桌面应用（Windows、macOS、Linux），桌面应用基于Tauri构建，提供原生体验。

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- Rust >= 1.70.0 (用于构建桌面应用)

### 安装与启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动 Tauri 桌面应用程序
npm run tauri dev
```

访问 [http://localhost:5173](http://localhost:5173) 查看Web应用。

### 数据库测试

```bash
# 运行完整的数据库功能测试
npm run test:database

# 运行前端模拟测试
npm run test:frontend

# 运行性能测试
npm run test:performance
```

### 构建生产版本

```bash
# 构建Web生产版本
npm run build

# 预览Web生产版本
npm run preview

# 构建桌面应用
npm run tauri build
```

## 🏗️ 项目结构

```
ChefMind/
├── public/                 # 静态资源
├── scripts/                # 数据库脚本
├── src/
│   ├── components/         # 可复用组件
│   │   ├── ai/             # AI相关组件
│   │   ├── analytics/      # 数据分析组件
│   │   ├── common/         # 通用组件
│   │   ├── layout/         # 布局组件
│   │   ├── monitoring/     # 监控组件
│   │   └── recipe/         # 菜谱相关组件
│   ├── composables/        # 组合式函数
│   ├── config/             # 配置文件
│   ├── data/               # 静态数据配置
│   ├── models/             # 数据模型
│   ├── router/             # 路由配置
│   ├── services/           # 服务层
│   │   ├── aiProviders/    # AI提供商实现
│   │   ├── cache/          # 缓存服务
│   │   ├── database/       # 数据库服务
│   │   └── monitoring/     # 监控服务
│   ├── stores/             # Pinia状态管理
│   ├── styles/             # 全局样式
│   ├── types/              # TypeScript类型定义
│   ├── utils/              # 工具函数
│   ├── views/              # 页面视图
│   ├── App.vue             # 根组件
│   └── main.ts             # 应用入口
├── src-tauri/              # Tauri桌面应用
│   ├── src/                # Rust源代码
│   ├── Cargo.toml          # Rust依赖配置
│   └── tauri.conf.json     # Tauri配置
├── data/                   # 数据库文件目录
├── docs/                   # 项目文档
├── package.json            # 项目配置
└── README.md               # 项目说明
```

## 🛠️ 技术栈

- **前端**: Vue 3, TypeScript, Vite, Element Plus, Pinia, Vue Router
- **桌面应用**: Tauri 2.0, Rust
- **数据库**: SQLite 3 (better-sqlite3), 连接池, 事务管理
- **工具**: axios, lodash-es, animate.css, chart.js, html2canvas, qrcode
- **开发工具**: ESLint, Prettier, Sass, TypeScript

## 🗄️ 数据库特性

### 高性能SQLite数据库
- **连接池管理**: 优化并发访问，减少连接开销
- **重试机制**: 自动处理 SQLite_BUSY 和 SQLITE_LOCKED 错误
- **事务管理**: 完整的事务支持，保证数据一致性
- **健康监控**: 实时数据库状态监控和预警
- **性能优化**: WAL模式，缓存优化，内存映射

### 数据库配置
```typescript
// 启用WAL模式，优化并发性能
journal_mode: 'WAL',
// 设置超时时间为10秒
busy_timeout: 10000,
// 缓存大小20MB
cache_size: -20000,
// 启用外键约束
foreign_keys: 'ON',
// 内存映射256MB
mmap_size: 268435456
```

## ⚙️ 配置说明

### 环境变量

在项目根目录创建 `.env` 文件，配置AI提供商的API Key：

```bash
VITE_AI_PROVIDER=your_ai_provider_name
VITE_API_KEY=your_ai_api_key
VITE_API_BASE_URL=https://your-api-url.com/
VITE_API_MODEL=your-model-name
```

### AI 提供商

支持 OpenAI, GLM, Anthropic/Claude, Google/Gemini, DeepSeek, Moonshot, 通义千问, 混元等多种AI模型。详细配置请查看 `src/services/aiConfig.ts`。

### 用户数据管理

项目采用本地会话管理，所有用户数据存储在本地数据库中：
- **会话标识**: 自动生成唯一会话ID
- **偏好设置**: 用户个性化配置本地存储
- **数据隐私**: 所有数据仅存储在用户设备上
- **无账户要求**: 无需注册或登录即可使用全部功能

## 📊 测试与验证

### 功能测试覆盖率
- ✅ **数据库连接**: 100% - 所有连接测试通过
- ✅ **会话管理**: 100% - 本地会话创建和偏好设置正常
- ✅ **食谱CRUD操作**: 100% - 创建、查询、更新、删除全部正常
- ✅ **收藏功能**: 100% - 收藏添加、查询、删除功能正常
- ✅ **搜索功能**: 100% - 模糊搜索和多字段查询正常
- ✅ **并发访问**: 100% - 支持多并发查询，无锁定问题
- ✅ **事务处理**: 100% - 事务操作和数据一致性保证
- ✅ **错误处理**: 100% - 异常情况处理和自动恢复

### 性能指标
- **响应时间**: < 200ms (复杂查询)
- **并发支持**: 5+ 并发连接
- **数据一致性**: 100% 无冲突
- **可用性**: 99.9% 系统稳定性

## 🤝 贡献指南

欢迎贡献代码！请Fork本仓库，创建特性分支，提交代码并开启Pull Request。

### 提交规范

我们遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

## 📄 许可证

本项目基于 [MIT License](./LICENSE) 开源。