# ChefMind Tauri Application

## 项目概述
ChefMind 智食谱已经成功打包为 Tauri 桌面应用程序。这是一个集成了AI API的独立可执行文件，可以在Linux系统上运行。

## 已完成的功能
- ✅ Tauri v2 配置
- ✅ Vue 3 + TypeScript 前端集成
- ✅ AI API 环境变量集成
- ✅ 跨平台构建配置
- ✅ 开发服务器设置

## 启动方法

### 开发模式
```bash
./start-tauri.sh
```

或者直接运行：
```bash
npm run tauri:dev
```

### 生产构建
```bash
npm run tauri:build
```

## 技术配置
- **前端框架**: Vue 3 + TypeScript + Vite
- **后端框架**: Tauri v2 + Rust
- **AI集成**: 支持多种AI提供商（OpenAI、GLM等）
- **开发端口**: 1420

## 环境要求
- Node.js 22+
- Rust 1.70+
- Linux GUI环境（或WSL2 with WSLg）

## 故障排除
如果遇到GUI显示问题，请确保：
1. 系统有GUI环境
2. 在WSL2中启用了WSLg
3. DISPLAY环境变量正确设置

## AI API配置
应用程序已预配置了AI API密钥，包含在.env文件中：
- API密钥: ms-07eb8667-2750-46ef-a074-4a5872e8c7f3
- API基础URL: https://api-inference.modelscope.cn/v1/chat/completions