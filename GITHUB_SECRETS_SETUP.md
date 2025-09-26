# GitHub Secrets 设置指南

## 🔒 安全说明

为了保护您的 AI API 密钥安全，我们已经配置了 GitHub Actions 来使用 GitHub Secrets 而不是将敏感信息硬编码在代码中。

## 🚀 设置步骤

### 1. 访问 GitHub Secrets 设置

1. 进入您的 GitHub 仓库页面
2. 点击 **Settings** 标签
3. 在左侧菜单中点击 **Secrets and variables** → **Actions**
4. 点击 **New repository secret**

### 2. 需要设置的 Secrets

根据您的 `.env.example` 文件，请设置以下 secrets：

| Secret 名称 | 描述 | 示例值 |
|------------|------|---------|
| `VITE_AI_PROVIDER` | AI 提供商名称 | `openai`, `qwen`, `glm` 等 |
| `VITE_API_KEY` | 您的 AI API 密钥 | `sk-xxxxxxxxxxxxxxxxxxxxxxxx` |
| `VITE_API_BASE_URL` | API 基础 URL | `https://api.openai.com/v1` |
| `VITE_API_MODEL` | 模型名称 | `gpt-3.5-turbo`, `qwen-turbo` 等 |

### 3. 具体设置

**对于 OpenAI:**
- `VITE_AI_PROVIDER`: `openai`
- `VITE_API_KEY`: 您的 OpenAI API key
- `VITE_API_BASE_URL`: `https://api.openai.com/v1`
- `VITE_API_MODEL`: `gpt-3.5-turbo`

**对于通义千问:**
- `VITE_AI_PROVIDER`: `qwen`
- `VITE_API_KEY`: 您的通义千问 API key
- `VITE_API_BASE_URL`: `https://dashscope.aliyuncs.com/api/v1`
- `VITE_API_MODEL`: `qwen-turbo`

**对于智谱清言:**
- `VITE_AI_PROVIDER`: `glm`
- `VITE_API_KEY`: 您的智谱清言 API key
- `VITE_API_BASE_URL`: `https://open.bigmodel.cn/api/paas/v4`
- `VITE_API_MODEL`: `glm-4`

## 🛠️ 本地开发设置

### 创建本地 .env 文件

1. 复制模板文件：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入您的真实 API 密钥：
   ```bash
   VITE_AI_PROVIDER=your_provider
   VITE_API_KEY=your_api_key
   VITE_API_BASE_URL=your_api_url
   VITE_API_MODEL=your_model_name
   ```

3. 重启开发服务器：
   ```bash
   npm run tauri dev
   ```

## 🔒 安全注意事项

1. **不要**将真实的 API 密钥提交到 Git
2. **不要**在代码中硬编码敏感信息
3. **定期**轮换您的 API 密钥
4. **监控**您的 API 使用情况
5. **限制** API 密钥的使用权限

## 🚨 重要提醒

- GitHub Secrets 只对当前仓库有效
- 如果您 fork 了仓库，需要重新设置 Secrets
- Secrets 不会传递给 pull requests
- 在 GitHub Actions 日志中，secrets 的值会被自动屏蔽

## ✅ 验证设置

设置完成后，您可以通过以下方式验证：

1. 触发 GitHub Actions 工作流
2. 检查构建日志，确保环境变量被正确注入
3. 下载构建的应用程序，验证 AI 功能正常工作

## 📞 需要帮助？

如果您在设置过程中遇到问题，请检查：

1. Secret 名称是否完全匹配（包括大小写）
2. API 密钥格式是否正确
3. GitHub Actions 是否有足够的权限
4. 网络连接是否正常

---

**⚠️ 重要：设置完成后，请确保删除任何可能包含敏感信息的文件或提交记录。**