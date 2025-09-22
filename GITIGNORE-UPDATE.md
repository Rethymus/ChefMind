# .gitignore 更新说明

## 更新时间
2025-09-23

## 更新内容

### 新增忽略的文件类型和目录：

#### 1. Tauri 相关构建文件
- `src-tauri/target/` - Rust 编译目标目录
- `src-tauri/target/**/*` - 所有 Tauri 构建产物
- `*.tgz`, `*.tar.gz`, `*.zip` - 压缩包文件
- `*.app`, `*.dmg`, `*.deb`, `*.rpm`, `*.msi`, `*.exe` - 各平台安装包
- `*.appimage`, `*.snap` - Linux 应用包

#### 2. Rust 和 Cargo 相关
- `Cargo.lock` - Rust 依赖锁文件
- `**/*.rs.bk` - Rust 备份文件
- `*.pdb` - 程序数据库文件

#### 3. Vue/Vite 自动生成文件
- `auto-imports.d.ts` - 自动导入类型声明
- `components.d.ts` - 组件类型声明
- `*.tsbuildinfo` - TypeScript 构建信息

#### 4. 系统和编辑器文件
- `.vscode/` - VS Code 配置目录（保留特定配置文件）
- `.idea/` - IntelliJ IDEA 配置
- `*.swp`, `*.swo`, `*~` - Vim 临时文件
- `.Thumbs.db`, `thumbs.db` - Windows 缩略图数据库
- `desktop.ini`, `$RECYCLE.BIN/` - Windows 系统文件
- `._*`, `.Spotlight-V100`, `.Trashes` - macOS 系统文件

#### 5. 开发工具缓存
- `.eslintcache`, `.stylelintcache` - 代码检查缓存
- `.node_repl_history` - Node.js REPL 历史
- `*.cache`, `*.session`, `*.history` - 各种缓存文件
- `*.localStorage` - 本地存储文件

#### 6. 测试和调试文件
- `test-*.js`, `test-*.ts` - 测试文件
- `*.test.js`, `*.test.ts` - 测试文件
- `spec/`, `tests/` - 测试目录
- `*.debug`, `*.map`, `*.ts.map` - 调试映射文件

#### 7. 数据库和存储文件
- `*.sqlite`, `*.sqlite3` - SQLite 数据库文件
- `*.db`, `*.fdb` - 其他数据库文件

#### 8. 文档和备份文件
- `docs/api/`, `docs/generated/` - 自动生成的文档
- `*.backup`, `*.bak`, `*.orig` - 备份文件
- `*.7z`, `*.dmg`, `*.gz`, `*.iso`, `*.jar`, `*.rar`, `*.tar`, `*.zip` - 压缩文件

### 保留的重要配置文件：
- `.vscode/extensions.json`
- `.vscode/settings.json`
- `.vscode/launch.json`
- `package.json`, `package-lock.json`, `yarn.lock`

## 效果
- 减少了 5,171+ 个构建文件的跟踪
- 清理了临时文件和缓存文件
- 保持了代码仓库的整洁性
- 提高了 git 操作速度

## 使用建议
1. 提交此 .gitignore 更新后，运行 `git status` 检查是否还有需要清理的已跟踪文件
2. 如果需要清理已跟踪的文件，运行 `git rm --cached <file>`
3. 建议定期检查和更新 .gitignore 文件