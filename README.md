# ChefMind 智食谱

> 把“今天吃什么”这件小事，变成一个更健康、更省心、更有掌控感的日常系统。

[![Vue](https://img.shields.io/badge/Vue-3.4+-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.4+-409EFF?style=flat-square)](https://element-plus.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2.0+-FFC13C?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

## 产品故事

很多人不是不会做饭，而是每天都卡在同一个问题上：冰箱里有几样食材，但不知道能做什么；收藏夹里有几十个菜谱，但真正下厨时还是手忙脚乱；想吃得健康一点，却很难把营养、口味、时间和采购清单串起来。

ChefMind 想做的不是又一个菜谱列表，而是一位贴身的厨房产品经理。它从“我有什么食材”开始，帮你搜索、生成、收藏、采购、烹饪、复盘营养，最后把这套流程沉淀成个人厨房数据。用户不需要注册账号，也不需要把饮食偏好交给云端；API Key、购物清单、收藏和个人信息都优先保存在本机。

一句话：ChefMind 让厨房从临时决策，变成可持续迭代的个人健康系统。

## 为什么值得用

- **从食材到成菜**：输入食材或直接选择冰箱里的东西，搜索热门菜谱，或让 AI 生成专属方案。
- **从菜谱到行动**：一键收藏、加入购物清单、按菜谱分组采购，烹饪时按步骤推进并可设置计时器。
- **从吃饱到吃好**：记录个人资料和饮食，进行营养概览、平衡分析和 AI 建议。
- **从演示到真实 AI**：新增设置页支持 OpenAI 协议 API Key，预设 OpenAI、DeepSeek、通义千问、Moonshot、智谱、硅基流动等 Base URL，也允许自定义兼容网关。
- **从云端焦虑到本地掌控**：用户数据和 API 配置保存在本机，适合个人使用、课程展示和桌面端封装。

## 功能截图

### 1. 首页：从“今天吃什么”进入完整厨房工作流

![首页](./docs/screenshots/01-home.png)

### 2. 搜索食谱：输入食材，发现可执行的热门菜谱

![搜索食谱](./docs/screenshots/02-search-results.png)

### 3. 食谱详情：查看食材、步骤、营养与相关操作

![食谱详情](./docs/screenshots/03-recipe-detail.png)

### 4. 收藏食谱：把常用菜谱沉淀为个人厨房资产

![收藏食谱](./docs/screenshots/04-recipe-favorite.png)

### 5. 我的收藏：集中管理已保存菜谱

![我的收藏](./docs/screenshots/05-favorites.png)

### 6. AI 生成表单：选择食材、厨具、限制和口味偏好

![AI 生成表单](./docs/screenshots/06-ai-form-filled.png)

### 7. AI 生成结果：输出食材、步骤、营养和烹饪建议

![AI 生成结果](./docs/screenshots/07-ai-generated-recipe.png)

### 8. 加购食材：把 AI 菜谱转成采购清单

![加购食材](./docs/screenshots/08-ai-shopping-confirm.png)

### 9. AI 设置页：选择供应商并填写 OpenAI 协议配置

![AI 设置页](./docs/screenshots/09-settings-config.png)

### 10. 测试连接：一键验证 API Key、Base URL 和模型

![测试连接](./docs/screenshots/10-settings-test-result.png)

### 11. 购物清单：跟踪采购进度

![购物清单](./docs/screenshots/11-shopping-list.png)

### 12. 按菜谱分组采购：知道每一样食材来自哪道菜

![按菜谱分组](./docs/screenshots/12-shopping-grouped.png)

### 13. 编辑购物项：补充分类和备注

![编辑购物项](./docs/screenshots/13-shopping-edit-modal.png)

### 14. 烹饪指导：按步骤推进，准备食材和记录进度

![烹饪指导](./docs/screenshots/14-cooking-guide-progress.png)

### 15. 烹饪计时器：关键步骤不再靠感觉

![烹饪计时器](./docs/screenshots/15-cooking-timer.png)

### 16. 营养分析：把个人信息和饮食记录转成健康洞察

![营养分析](./docs/screenshots/16-analytics-overview.png)

### 17. 个人资料表单：记录活动水平、目标、过敏和饮食

![个人资料表单](./docs/screenshots/17-analytics-profile-form.png)

### 18. 主题切换：支持明暗主题体验

![主题切换](./docs/screenshots/18-theme-selector.png)

### 19. 关于我们：产品叙事与品牌信息

![关于我们](./docs/screenshots/19-footer-about-modal.png)

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- Rust >= 1.70.0，用于构建 Tauri 桌面应用

### 安装与启动

```bash
npm install
npm run dev
```

访问 [http://localhost:1420](http://localhost:1420) 查看 Web 应用。

### 桌面端

```bash
npm run tauri:dev
npm run tauri:build
```

## AI 配置

进入应用顶部导航的 **设置** 页面，选择供应商预设并填写：

- `Base URL`：OpenAI-compatible 服务地址，例如 `https://api.deepseek.com/v1`
- `Model`：模型名称，例如 `deepseek-chat`
- `API Key`：对应供应商控制台创建的 Key

设置页会展示该供应商的 API Key 获取地址，并提供 **测试连接** 按钮。测试会调用 `/chat/completions`，用于确认 Key、Base URL 和模型是否可用。

本地演示或截图时可以使用 Mock 模式：

```bash
VITE_AI_PROVIDER=mock npm run dev
```

## 常用命令

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 重新生成 README 展示截图
VITE_AI_PROVIDER=mock npm run dev -- --host 127.0.0.1 --port 1420
npx playwright test scripts/capture-user-screenshots.spec.mjs --reporter=line
```

## 技术栈

- **前端**：Vue 3, TypeScript, Vite, Vue Router, Pinia, Element Plus
- **桌面端**：Tauri 2, Rust
- **AI 接入**：OpenAI-compatible Chat Completions，支持多供应商预设与自定义 Base URL
- **本地数据**：localStorage / IndexedDB / SQLite 相关服务封装
- **工具链**：Sass, Playwright, html2canvas, qrcode

## 项目结构

```text
ChefMind/
├── docs/screenshots/       # README 产品截图
├── scripts/                # 数据库脚本与截图自动化
├── src/
│   ├── components/         # 可复用组件
│   ├── data/               # 供应商预设、Mock 数据
│   ├── router/             # 路由配置
│   ├── services/           # AI、收藏、购物清单、数据库服务
│   ├── stores/             # Pinia 状态
│   ├── styles/             # 全局样式
│   └── views/              # 页面视图
├── src-tauri/              # Tauri 桌面应用
└── README.md
```

## 产品路线

ChefMind 的长期方向是把“做饭”拆成更可管理的产品闭环：

1. **决策**：今天吃什么，为什么适合我。
2. **准备**：还缺什么，应该怎么买。
3. **执行**：每一步怎么做，什么时候该停。
4. **复盘**：这顿饭对健康目标有什么影响。

当每一次下厨都能被记录、分析和复用，厨房就不只是一个做饭的地方，而是个人健康系统的入口。

## 许可证

本项目基于 [MIT License](./LICENSE) 开源。
