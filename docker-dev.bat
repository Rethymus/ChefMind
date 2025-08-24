@echo off
echo 正在启动 ChefMind 开发环境 Docker 容器...

REM 检查 Docker Desktop 是否运行
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: Docker Desktop 未运行，请先启动 Docker Desktop
    pause
    exit /b 1
)

echo Docker Desktop 已运行，开始构建和启动开发环境容器...

REM 停止现有容器
docker-compose --profile dev down

REM 构建并启动开发环境容器
echo 构建开发环境镜像...
docker-compose --profile dev up --build -d

if %errorlevel% equ 0 (
    echo.
    echo ✅ ChefMind 开发环境容器启动成功！
    echo 🌐 访问地址: http://localhost:5173
    echo 🔥 热重载已启用，修改代码会自动刷新
    echo.
    echo 容器状态:
    docker-compose --profile dev ps
    echo.
    echo 查看日志: docker-compose --profile dev logs -f
    echo 停止容器: docker-compose --profile dev down
) else (
    echo ❌ 容器启动失败，请检查错误信息
)

pause