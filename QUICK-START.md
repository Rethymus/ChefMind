# ChefMind Tauri 快速启动指南

## 当前状态
Tauri应用程序正在编译中。这是一个正常的过程，首次编译可能需要5-15分钟。

## 立即可用的解决方案

### 方案1: Web版本（推荐用于快速测试）
```bash
npm run dev
```
这将在 http://localhost:1420 启动Web版本

### 方案2: 等待Tauri编译完成
```bash
npm run tauri:dev
```
编译完成后，这将启动原生桌面应用程序

## 编译进度检查
要检查编译是否完成：
```bash
ps aux | grep cargo
```

如果看到cargo进程仍在运行，说明编译正在进行中。

## 预期行为
- 编译完成后，会出现一个ChefMind桌面应用程序窗口
- 应用程序标题为"ChefMind 智食谱"
- 窗口大小为1400x900像素
- 包含完整的AI菜谱生成功能

## 故障排除
如果编译失败：
1. 确保有足够的磁盘空间（至少5GB）
2. 检查网络连接（需要下载依赖）
3. 确保Rust和Node.js版本兼容

## 项目文件说明
- `src-tauri/` - Tauri Rust后端代码
- `src/` - Vue 3前端代码
- `dist/` - 构建输出目录
- `start-tauri.sh` - 启动脚本