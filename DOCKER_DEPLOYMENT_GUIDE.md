# ChefMind Docker 部署指南

## 概述

本指南详细说明如何在 Windows Docker Desktop 上部署 ChefMind Vue.js 应用程序。

## 前置要求

- Windows 10/11 操作系统
- Docker Desktop for Windows (已安装并运行)
- Git (用于克隆项目)

## 项目结构

```
ChefMind/
├── Dockerfile              # 生产环境 Docker 配置
├── Dockerfile.dev          # 开发环境 Docker 配置
├── docker-compose.yml      # Docker Compose 配置
├── .dockerignore           # Docker 忽略文件
├── docker-run.bat          # Windows 批处理脚本
├── docker-dev.bat          # 开发环境批处理脚本
└── src/                    # 源代码目录
```

## 快速部署

### 方法一：使用 Docker Compose（推荐）

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd ChefMind
   ```

2. **构建并启动容器**
   ```bash
   docker-compose up --build -d
   ```

3. **访问应用**
   - 打开浏览器访问：http://localhost:3000

### 方法二：使用批处理脚本

1. **双击运行 `docker-run.bat`**
   - 自动构建镜像并启动容器

2. **访问应用**
   - 浏览器自动打开 http://localhost:3000

## 详细配置说明

### Dockerfile 配置

```dockerfile
# 多阶段构建
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose 配置

```yaml
version: '3.8'
services:
  chefmind:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 常用命令

### 容器管理

```bash
# 查看容器状态
docker-compose ps

# 查看容器日志
docker-compose logs -f

# 停止容器
docker-compose down

# 重新构建并启动
docker-compose up --build -d

# 进入容器内部
docker-compose exec chefmind sh
```

### 镜像管理

```bash
# 查看镜像
docker images

# 删除镜像
docker rmi chefmind-chefmind

# 清理未使用的镜像
docker image prune
```

## 开发环境部署

### 使用开发环境配置

1. **启动开发容器**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **或使用批处理脚本**
   ```bash
   docker-dev.bat
   ```

### 开发环境特性

- 热重载支持
- 源代码映射
- 开发工具集成
- 端口：http://localhost:8080

## 故障排除

### 常见问题

1. **端口占用**
   ```bash
   # 检查端口占用
   netstat -ano | findstr :3000
   
   # 修改 docker-compose.yml 中的端口映射
   ports:
     - "3001:3000"  # 使用其他端口
   ```

2. **构建失败**
   ```bash
   # 清理 Docker 缓存
   docker system prune -a
   
   # 重新构建
   docker-compose build --no-cache
   ```

3. **容器无法启动**
   ```bash
   # 查看详细日志
   docker-compose logs chefmind
   
   # 检查容器状态
   docker-compose ps -a
   ```

4. **依赖安装失败**
   ```bash
   # 清理 node_modules 和 package-lock.json
   rm -rf node_modules package-lock.json
   
   # 重新安装依赖
   npm install
   ```

### 性能优化

1. **多阶段构建**
   - 减少最终镜像大小
   - 分离构建和运行环境

2. **缓存优化**
   - 合理安排 Dockerfile 层级
   - 利用 Docker 层缓存

3. **资源限制**
   ```yaml
   services:
     chefmind:
       deploy:
         resources:
           limits:
             memory: 512M
             cpus: '0.5'
   ```

## 生产环境注意事项

### 安全配置

1. **环境变量管理**
   ```bash
   # 创建 .env 文件
   NODE_ENV=production
   API_BASE_URL=https://api.chefmind.com
   ```

2. **HTTPS 配置**
   - 配置 SSL 证书
   - 使用反向代理

3. **健康检查**
   - 配置容器健康检查
   - 监控应用状态

### 监控和日志

1. **日志管理**
   ```yaml
   services:
     chefmind:
       logging:
         driver: "json-file"
         options:
           max-size: "10m"
           max-file: "3"
   ```

2. **监控指标**
   - CPU 使用率
   - 内存使用率
   - 响应时间

## 部署验证

### 功能测试清单

- [ ] 应用正常启动
- [ ] 页面可以访问
- [ ] 路由功能正常
- [ ] API 接口可用
- [ ] 静态资源加载
- [ ] 响应式设计
- [ ] 主题切换功能
- [ ] 多语言支持

### 性能测试

```bash
# 使用 curl 测试响应时间
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000

# 使用 ab 进行压力测试
ab -n 1000 -c 10 http://localhost:3000/
```

## 维护和更新

### 应用更新流程

1. **拉取最新代码**
   ```bash
   git pull origin main
   ```

2. **重新构建部署**
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

3. **验证更新**
   - 检查应用功能
   - 验证新特性

### 数据备份

```bash
# 备份容器数据
docker cp chefmind-chefmind-1:/app/data ./backup/

# 恢复数据
docker cp ./backup/data chefmind-chefmind-1:/app/
```

## 技术支持

### 联系方式

- 项目仓库：[GitHub Repository]
- 问题反馈：[Issues]
- 文档更新：[Wiki]

### 版本信息

- Docker 版本：20.10+
- Node.js 版本：18.x
- Vue.js 版本：3.x
- Nginx 版本：Alpine

---

**最后更新时间：** 2025年1月6日  
**文档版本：** v1.0.0