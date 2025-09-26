# 📚 ChefMind 项目文档

欢迎来到 ChefMind 项目的官方文档中心。这里包含了项目的所有技术文档、使用指南和开发资源。

## 📋 文档目录

### 🏗️ 架构和设计
- [项目结构说明](./PROJECT_STRUCTURE.md) - 详细的项目目录结构和技术架构
- [数据库架构](./DATABASE_SCHEMA.md) - 完整的数据库设计和表结构
- [AI 服务架构](./AI_SERVICE_ARCHITECTURE.md) - AI 集成的架构设计和实现

### 💻 开发指南
- [API 文档](./API_DOCUMENTATION.md) - 完整的服务层 API 接口文档
- [组件使用指南](./COMPONENT_GUIDE.md) - Vue 组件的使用方法和最佳实践
- [部署指南](./DEPLOYMENT.md) - Web、桌面和移动应用的部署流程

## 🎯 快速开始

### 新开发者入门

1. **了解项目结构**
   - 先阅读 [项目结构说明](./PROJECT_STRUCTURE.md)
   - 了解技术栈和目录组织

2. **设置开发环境**
   - 参考 [部署指南](./DEPLOYMENT.md) 的环境要求部分
   - 安装必要的依赖和工具

3. **开始开发**
   - 查看 [组件使用指南](./COMPONENT_GUIDE.md) 了解组件使用
   - 参考 [API 文档](./API_DOCUMENTATION.md) 进行服务层开发

### 部署和运维

- **Web 应用部署** - 参考 [部署指南](./DEPLOYMENT.md) 的 Web 应用部分
- **桌面应用构建** - 参考 [部署指南](./DEPLOYMENT.md) 的桌面应用部分
- **移动应用发布** - 参考 [部署指南](./DEPLOYMENT.md) 的移动应用部分
- **数据库管理** - 参考 [数据库架构](./DATABASE_SCHEMA.md) 和 [部署指南](./DEPLOYMENT.md)

## 🚀 项目特点

### 技术栈
- **前端**: Vue 3 + TypeScript + Vite + Element Plus
- **后端**: Tauri + Rust + SQLite
- **AI 集成**: 多提供商支持 (OpenAI, GLM, Anthropic, Gemini 等)
- **状态管理**: Pinia
- **样式**: SCSS + Tailwind CSS

### 核心功能
- 🤖 AI 智能菜谱生成
- 📱 响应式设计 (Web + 桌面 + 移动)
- 🗄️ 本地数据库支持
- 🎨 主题切换和个性化
- 📊 数据分析和监控
- 🔍 智能搜索和推荐

### 设计原则
- 🧩 模块化架构
- 🔄 响应式设计
- 🔒 类型安全 (TypeScript)
- ⚡ 高性能优化
- 🛡️ 错误处理和监控

## 📖 文档使用指南

### 按角色查看

#### 前端开发者
- [组件使用指南](./COMPONENT_GUIDE.md) - 了解如何使用现有组件
- [项目结构说明](./PROJECT_STRUCTURE.md) - 了解前端目录结构
- [API 文档](./API_DOCUMENTATION.md) - 了解服务层接口

#### 后端开发者
- [数据库架构](./DATABASE_SCHEMA.md) - 了解数据库设计
- [API 文档](./API_DOCUMENTATION.md) - 了解 API 接口设计
- [部署指南](./DEPLOYMENT.md) - 了解服务部署

#### DevOps 工程师
- [部署指南](./DEPLOYMENT.md) - 完整的部署流程
- [项目结构说明](./PROJECT_STRUCTURE.md) - 了解项目架构
- [AI 服务架构](./AI_SERVICE_ARCHITECTURE.md) - 了解 AI 服务配置

#### 产品经理
- [项目结构说明](./PROJECT_STRUCTURE.md) - 了解功能模块
- [API 文档](./API_DOCUMENTATION.md) - 了解系统功能
- [组件使用指南](./COMPONENT_GUIDE.md) - 了解用户界面

### 按开发阶段查看

#### 项目初始化
1. [项目结构说明](./PROJECT_STRUCTURE.md) - 了解整体架构
2. [部署指南](./DEPLOYMENT.md) - 环境设置

#### 功能开发
1. [API 文档](./API_DOCUMENTATION.md) - 设计服务接口
2. [组件使用指南](./COMPONENT_GUIDE.md) - 开发用户界面
3. [数据库架构](./DATABASE_SCHEMA.md) - 数据库操作

#### 测试和部署
1. [部署指南](./DEPLOYMENT.md) - 构建和部署流程
2. [AI 服务架构](./AI_SERVICE_ARCHITECTURE.md) - AI 服务配置

## 🔗 相关链接

- [GitHub 仓库](https://github.com/your-username/chefmind)
- [Vue.js 官方文档](https://vuejs.org/)
- [Tauri 官方文档](https://tauri.app/)
- [Element Plus 文档](https://element-plus.org/)

## 🤝 贡献指南

### 文档贡献
1. Fork 项目仓库
2. 创建文档分支 (`git checkout -b docs/update-readme`)
3. 提交更改 (`git commit -am 'Add new documentation'`)
4. 推送到分支 (`git push origin docs/update-readme`)
5. 创建 Pull Request

### 文档规范
- 使用 Markdown 格式
- 保持文档结构清晰
- 提供代码示例
- 及时更新过时内容

## 📞 支持

如果您在阅读文档过程中遇到问题，请：

1. 查看相关文档的常见问题部分
2. 搜索现有文档
3. 在 GitHub Issues 中提问
4. 联系开发团队

## 📄 许可证

本文档遵循 MIT 许可证。详见项目根目录的 LICENSE 文件。

---

*最后更新: 2025年8月*