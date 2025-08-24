@echo off
echo 正在启动 ChefMind Docker 容器...

REM 检查 Docker Desktop 是否运行
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: Docker Desktop 未运行，请先启动 Docker Desktop
    pause
    exit /b 1
)

echo Docker Desktop 已运行，开始构建和启动容器...

REM 停止并删除现有容器
docker-compose down

REM 构建并启动生产环境容器
echo 构建生产环境镜像...
docker-compose up --build -d

if %errorlevel% equ 0 (
    echo.
    echo ✅ ChefMind 容器启动成功！
    echo 🌐 访问地址: http://localhost:3000
    echo.
    echo 容器状态:
    docker-compose ps
    echo.
    echo 查看日志: docker-compose logs -f
    echo 停止容器: docker-compose down
) else (
    echo ❌ 容器启动失败，请检查错误信息
)

pause