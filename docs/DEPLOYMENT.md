# 🚀 ChefMind 部署指南

## 📋 概述

本指南提供 ChefMind 项目的完整部署流程，涵盖 Web 应用、桌面应用、移动应用的部署方案。

## 📋 目录

- [环境要求](#环境要求)
- [Web 应用部署](#web-应用部署)
- [桌面应用部署](#桌面应用部署)
- [移动应用部署](#移动应用部署)
- [数据库部署](#数据库部署)
- [CI/CD 配置](#cicd-配置)
- [监控和维护](#监控和维护)

---

## 🔧 环境要求

### 系统要求

- **操作系统**: Linux (Ubuntu 20.04+), macOS, Windows
- **Node.js**: v18.0.0 或更高版本
- **Rust**: v1.70.0 或更高版本 (桌面应用)
- **内存**: 最少 2GB RAM
- **存储**: 最少 5GB 可用空间

### 软件依赖

```bash
# Node.js 和 npm
node --version
npm --version

# Rust (桌面应用)
rustc --version
cargo --version

# Tauri CLI
npm install -g @tauri-apps/cli
```

---

## 🌐 Web 应用部署

### 1. 构建生产版本

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 2. 静态文件部署

#### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/chefmind/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. 环境变量配置

```bash
# .env.production
VITE_APP_TITLE=ChefMind
VITE_APP_VERSION=2.2.0
VITE_API_BASE_URL=https://api.your-domain.com
VITE_AI_API_KEY=your-ai-api-key
VITE_ENABLE_ANALYTICS=true
```

### 4. PM2 部署 (Node.js 后端)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'chefmind-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

---

## 💻 桌面应用部署

### 1. Tauri 桌面应用构建

```bash
# 开发环境运行
npm run tauri dev

# 构建生产版本
npm run tauri build

# 构建特定平台
npm run tauri build --target universal-apple-darwin  # macOS
npm run tauri build --target x86_64-pc-windows-msvc  # Windows
npm run tauri build --target x86_64-unknown-linux-gnu # Linux
```

### 2. 代码签名 (可选但推荐)

#### Windows 代码签名

```bash
# 安装 signtool
# 使用 Windows SDK 中的 signtool

signtool sign /f certificate.pfx /p password /t http://timestamp.digicert.com /fd sha256 target/release/chefmind.exe
```

#### macOS 代码签名

```bash
# 使用 Apple Developer 证书
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" target/release/bundle/macos/ChefMind.app
```

### 3. 分发包创建

```bash
# 创建 DMG (macOS)
npm run tauri build --target dmg

# 创建 MSI (Windows)
npm run tauri build --target msi

# 创建 DEB (Linux)
npm run tauri build --target deb

# 创建 AppImage (Linux)
npm run tauri build --target appimage
```

### 4. 自动更新配置

```json
// tauri.conf.json
{
  "tauri": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://updates.your-domain.com",
        "https://api.github.com/repos/your-repo/releases/latest"
      ],
      "dialog": true,
      "pubkey": "your-public-key"
    }
  }
}
```

---

## 📱 移动应用部署

### 1. Android 应用部署

#### 环境配置

```bash
# 安装 Android SDK
# 配置 ANDROID_HOME 环境变量
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# 安装 NDK
sdkmanager "ndk;26.1.10909125"
```

#### 构建签名 APK

```bash
# 生成签名密钥
keytool -genkey -v -keystore chefmind-key.keystore \
  -alias chefmind-key -keyalg RSA -keysize 2048 -validity 10000

# 构建发布版本
cd src-tauri
cargo tauri android build

# 签名 APK
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore ../chefmind-key.keystore app-release-unsigned.apk chefmind-key

# 优化 APK
zipalign -v 4 app-release-unsigned.apk chefmind-release.apk
```

#### Google Play 发布

1. 创建 Google Play 开发者账号
2. 在 Google Play Console 创建应用
3. 上传 APK 或 AAB 文件
4. 填写应用信息和截图
5. 提交审核

### 2. iOS 应用部署

#### 环境配置

```bash
# 需要 macOS 和 Xcode
xcode-select --version

# 安装 iOS 工具链
rustup target add aarch64-apple-ios
rustup target add x86_64-apple-ios
```

#### 构建和发布

```bash
# 构建iOS应用
cd src-tauri
cargo tauri ios build

# 在 Xcode 中打开项目
open gen/apple/ChefMind.xcworkspace

# 配置签名证书和 Provisioning Profile
# 在 Xcode 中 Archive 并提交到 App Store
```

---

## 🗄️ 数据库部署

### 1. SQLite 数据库优化配置

```bash
# 创建数据库目录
mkdir -p /var/lib/chefmind/data

# 设置权限
chown -R www-data:www-data /var/lib/chefmind
chmod -R 755 /var/lib/chefmind

# 优化SQLite配置
cat > /var/lib/chefmind/data/sqlite-config.sql << EOF
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 10000;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -20000;
PRAGMA foreign_keys = ON;
PRAGMA mmap_size = 268435456;
EOF

# 应用配置
sqlite3 /var/lib/chefmind/data/chefmind.db < /var/lib/chefmind/data/sqlite-config.sql

# 备份数据库
sqlite3 /var/lib/chefmind/data/chefmind.db ".backup /backup/chefmind-backup.db"
```

### 2. 数据库迁移

```bash
# 运行数据库迁移
npm run db:migrate

# 重置数据库
npm run db:reset

# 创建数据库备份
npm run db:backup

# 运行数据库测试
npm run test:database
```

### 3. 生产环境数据库配置

```typescript
// src/config/sqlite.ts
export const sqliteConfig = {
  databasePath: process.env.DB_PATH || '/var/lib/chefmind/data/chefmind.db',
  backupPath: process.env.BACKUP_PATH || '/backup/chefmind',
  autoBackup: true,
  backupInterval: 24 * 60 * 60 * 1000, // 24小时
  maxBackups: 7,
  // 连接池配置
  pool: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 10000
  },
  // 重试配置
  retry: {
    maxAttempts: 3,
    delayMs: 1000,
    backoffFactor: 2
  },
  // 性能优化
  performance: {
    walMode: true,
    busyTimeout: 10000,
    cacheSize: 20000,
    mmapSize: 268435456
  }
};
```

---

## ⚙️ CI/CD 配置

### GitHub Actions 配置

```yaml
# .github/workflows/deploy.yml
name: Deploy ChefMind

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Build
      run: npm run build

  deploy-web:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist

  build-desktop:
    needs: test
    runs-on: ${{ matrix.os }}
    if: github.ref == 'refs/heads/main'

    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]

    steps:
    - uses: actions/checkout@v3

    - name: Setup Rust
      uses: dtolnay/rust-toolchain@stable

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Build Tauri app
      uses: tauri-apps/tauri-action@v0.4
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Docker CI/CD

```yaml
# .github/workflows/docker.yml
name: Build and Push Docker Image

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: |
          ${{ secrets.DOCKER_USERNAME }}/chefmind:latest
          ${{ secrets.DOCKER_USERNAME }}/chefmind:${{ github.sha }}
```

---

## 📊 监控和维护

### 1. 应用监控

```typescript
// 监控配置
export const monitoringConfig = {
  enabled: process.env.NODE_ENV === 'production',
  apiKey: process.env.MONITORING_API_KEY,
  endpoint: process.env.MONITORING_ENDPOINT,
  sampleRate: 0.1,
  ignoreErrors: ['NetworkError', 'AbortError']
};
```

### 2. 性能监控

```typescript
// 性能指标收集
export const collectMetrics = () => {
  return {
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    uptime: process.uptime(),
    timestamp: Date.now()
  };
};
```

### 3. 日志配置

```javascript
// 日志配置
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 4. 健康检查

```typescript
// 健康检查端点
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {
      database: checkDatabase(),
      cache: checkCache(),
      externalServices: checkExternalServices(),
      connectionPool: checkConnectionPool(),
      databaseHealth: checkDatabaseHealth()
    }
  };

  res.status(health.checks.database && health.checks.connectionPool ? 200 : 503).json(health);
});

// 数据库健康检查
function checkDatabaseHealth() {
  try {
    const db = getDatabaseConnection();
    const result = db.prepare('PRAGMA integrity_check').get();
    return result.integrity_check === 'ok';
  } catch (error) {
    return false;
  }
}

// 连接池状态检查
function checkConnectionPool() {
  try {
    const poolStatus = getConnectionPoolStatus();
    return poolStatus.availableConnections > 0 && poolStatus.totalConnections < poolStatus.maxConnections;
  } catch (error) {
    return false;
  }
}
```

### 5. 备份策略

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/chefmind"
DB_PATH="/var/lib/chefmind/data/chefmind.db"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份
sqlite3 "$DB_PATH" ".backup $BACKUP_DIR/chefmind_$DATE.db"

# 压缩备份
gzip "$BACKUP_DIR/chefmind_$DATE.db"

# 清理旧备份 (保留7天)
find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete

# 上传到云存储 (可选)
aws s3 cp "$BACKUP_DIR/chefmind_$DATE.db.gz" s3://your-bucket/backups/
```

---

## 🔐 安全配置

### 1. HTTPS 配置

```nginx
# SSL 配置
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
}
```

### 2. 环境变量保护

```bash
# 只在服务器上设置
export DATABASE_URL="postgresql://user:password@localhost/db"
export AI_API_KEY="your-secret-api-key"
export JWT_SECRET="your-jwt-secret"

# 使用 systemd 环境文件
# /etc/systemd/system/chefmind.service
[Service]
EnvironmentFile=/etc/chefmind/.env
```

### 3. 防火墙配置

```bash
# UFW 防火墙配置
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 🚨 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 清理缓存
   npm run clean
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **数据库连接问题**
   ```bash
   # 检查数据库文件权限
   ls -la /var/lib/chefmind/data/

   # 检查数据库文件完整性
   sqlite3 /var/lib/chefmind/data/chefmind.db "PRAGMA integrity_check;"

   # 检查数据库锁定状态
   sqlite3 /var/lib/chefmind/data/chefmind.db "PRAGMA busy_timeout;"
   ```

3. **SQLite 锁定问题**
   ```bash
   # 检查WAL模式
   sqlite3 /var/lib/chefmind/data/chefmind.db "PRAGMA journal_mode;"

   # 清理WAL文件
   sqlite3 /var/lib/chefmind/data/chefmind.db "PRAGMA wal_checkpoint(TRUNCATE);"

   # 重置数据库配置
   sqlite3 /var/lib/chefmind/data/chefmind.db "PRAGMA busy_timeout = 10000;"
   ```

4. **权限问题**
   ```bash
   # 修复文件权限
   sudo chown -R www-data:www-data /var/lib/chefmind
   sudo chmod -R 755 /var/lib/chefmind
   ```

### 性能优化

```bash
# 启用 Brotli 压缩
sudo apt-get install brotli

# 优化 Nginx 配置
sudo nginx -t
sudo systemctl reload nginx

# 监控系统资源
htop
iotop

# 数据库性能优化
sqlite3 /var/lib/chefmind/data/chefmind.db "PRAGMA wal_checkpoint(FULL);"
sqlite3 /var/lib/chefmind/data/chefmind.db "VACUUM;"
sqlite3 /var/lib/chefmind/data/chefmind.db "ANALYZE;"

# 检查数据库性能
sqlite3 /var/lib/chefmind/data/chefmind.db "PRAGMA cache_status;"
sqlite3 /var/lib/chefmind/data/chefmind.db "PRAGMA page_count;"
sqlite3 /var/lib/chefmind/data/chefmind.db "PRAGMA freelist_count;"
```

---

## 📚 相关文档

- [项目结构说明](./PROJECT_STRUCTURE.md)
- [API 文档](./API_DOCUMENTATION.md)
- [组件使用指南](./COMPONENT_GUIDE.md)
- [数据库架构](./DATABASE_SCHEMA.md)
- [AI 服务架构](./AI_SERVICE_ARCHITECTURE.md)
- [测试报告](../test-report.md)

## 🎯 部署检查清单

### 环境准备
- [ ] Node.js 18.0+ 安装
- [ ] Rust 1.70+ 安装 (桌面应用)
- [ ] Tauri CLI 安装
- [ ] 数据库目录创建和权限设置
- [ ] 环境变量配置

### 数据库配置
- [ ] SQLite 数据库初始化
- [ ] WAL 模式启用
- [ ] 连接池配置
- [ ] 重试机制配置
- [ ] 健康检查配置
- [ ] 备份策略配置

### 应用部署
- [ ] Web 应用构建
- [ ] 桌面应用构建 (可选)
- [ ] Nginx 配置
- [ ] SSL 证书配置
- [ ] PM2 进程管理 (可选)

### 监控和维护
- [ ] 健康检查端点
- [ ] 日志配置
- [ ] 性能监控
- [ ] 备份自动化
- [ ] 错误报警

### 安全配置
- [ ] HTTPS 配置
- [ ] 防火墙配置
- [ ] 环境变量保护
- [ ] 数据库访问权限
- [ ] API 密钥管理