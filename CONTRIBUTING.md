# 贡献指南

感谢您考虑为 ChefMind 智食谱做出贡献！以下是一些指导方针，帮助您开始。

## 开发环境设置

1. Fork 本仓库
2. 克隆您的 fork 到本地机器
   ```bash
   git clone https://github.com/YOUR-USERNAME/ChefMind.git
   cd ChefMind
   ```
3. 安装依赖
   ```bash
   npm install
   ```
4. 启动开发服务器
   ```bash
   npm run dev
   ```

## 代码规范

我们使用 ESLint 和 Prettier 来保持代码质量和一致性：

```bash
# 运行代码检查
npm run lint

# 格式化代码
npm run format
```

## 提交规范

我们遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

示例：
```
feat: 添加多语言支持
fix: 修复移动端菜单显示问题
docs: 更新安装说明
```

## 分支策略

- `main`: 主分支，包含稳定版本
- `dev`: 开发分支，包含最新功能
- 功能分支: 从 `dev` 分支创建，命名为 `feature/your-feature-name`
- 修复分支: 从 `main` 分支创建，命名为 `fix/issue-number`

## Pull Request 流程

1. 确保您的代码通过所有测试
2. 更新相关文档
3. 提交 PR 到 `dev` 分支
4. 在 PR 描述中引用相关 issue
5. 等待代码审查

## 测试

在提交 PR 前，请确保您的代码通过所有测试：

```bash
# 运行所有测试
npm run test

# 运行特定测试
npm run test -- -t "测试名称"
```

## 文档

如果您的更改影响用户体验或 API，请更新相应的文档。

## 问题和讨论

如有任何问题，请在 GitHub Issues 中提出，或加入我们的讨论。

感谢您的贡献！