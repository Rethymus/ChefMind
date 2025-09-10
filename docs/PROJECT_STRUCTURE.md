# 📁 ChefMind 项目结构说明

## 📂 根目录结构

```
ChefMind/
├── public/                 # 静态资源文件
├── scripts/                # 数据库初始化脚本
├── src/                    # 源代码目录
├── data/                   # SQLite数据库文件
├── docs/                   # 项目文档
├── .env.example           # 环境变量示例文件
├── package.json           # 项目依赖和脚本配置
└── README.md              # 项目说明文档
```

## 📂 src 目录结构

```
src/
├── components/            # 可复用组件
│   ├── ai/                # AI相关组件
│   ├── analytics/         # 数据分析组件
│   ├── common/            # 通用组件
│   ├── layout/            # 布局组件
│   ├── monitoring/        # 监控组件
│   └── recipe/            # 菜谱相关组件
├── composables/           # Vue组合式函数
├── config/                # 全局配置文件
├── data/                  # 静态数据配置
├── models/                # 数据模型定义
├── router/                # 路由配置
├── services/              # 业务逻辑层
│   ├── aiProviders/       # 各AI提供商实现
│   ├── cache/             # 缓存服务
│   ├── database/          # 数据库服务
│   └── monitoring/        # 性能监控服务
├── stores/                # Pinia状态管理
├── styles/                # 全局样式文件
├── types/                 # TypeScript类型定义
├── utils/                 # 工具函数
├── views/                 # 页面视图组件
├── App.vue               # 根组件
└── main.ts               # 应用入口文件
```

## 📂 主要模块说明

### 🧩 components (组件)

- `ai/` - AI相关功能组件，如API配置、模型选择等
- `analytics/` - 数据分析可视化组件
- `common/` - 通用UI组件，如按钮、模态框等
- `layout/` - 页面布局组件，如导航栏、侧边栏等
- `monitoring/` - 系统监控相关组件
- `recipe/` - 菜谱相关的业务组件

### 🔄 composables (组合式函数)

Vue 3的组合式函数，封装可复用的逻辑，如：
- 状态管理逻辑
- API调用封装
- 数据处理逻辑

### ⚙️ config (配置)

全局配置文件，包括：
- AI服务配置
- 应用基础配置
- 路由配置

### 📊 data (静态数据)

应用所需的静态数据文件，如：
- 食材分类数据
- 烹饪方式数据
- 营养成分数据

### 🗃️ models (数据模型)

TypeScript数据模型定义，包括：
- 用户模型
- 菜谱模型
- 收藏模型
- 搜索历史模型

### 🚦 router (路由)

Vue Router配置，定义应用的路由规则。

### 🛠️ services (服务层)

业务逻辑的核心实现：
- `aiProviders/` - 各种AI提供商的API实现
- `cache/` - 缓存服务，支持多种淘汰策略
- `database/` - 数据库访问层，统一SQLite和IndexedDB接口
- `monitoring/` - 性能监控服务

### 📦 stores (状态管理)

使用Pinia进行状态管理，包括：
- 菜谱状态
- 用户偏好设置
- UI状态管理

### 🎨 styles (样式)

全局样式文件：
- CSS变量定义
- 通用样式类
- 主题样式

### 📐 types (类型定义)

TypeScript类型定义文件：
- 接口定义
- 枚举类型
- 工具类型

### 🔧 utils (工具函数)

通用工具函数：
- 数据处理工具
- 格式化工具
- 工具类函数

### 🖼️ views (页面视图)

应用的页面组件：
- 首页
- 菜谱详情页
- 收藏页
- 个人中心页
- AI测试页

## 📁 其他重要目录

### 📂 public

存放不需要编译处理的静态资源：
- 图标文件
- 图片资源
- 视频文件
- manifest.json (PWA配置)

### 📂 scripts

数据库相关的Node.js脚本：
- 数据库初始化
- 数据库重置

### 📂 data

SQLite数据库文件存储位置：
- chefmind.db (主数据库文件)
- chefmind_navicat.db (Navicat兼容数据库文件)