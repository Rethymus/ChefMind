#!/bin/bash

# Git 历史清理脚本 - 移除敏感信息
# 警告：这将重写 Git 历史，请谨慎使用！

echo "⚠️  警告：此脚本将重写 Git 历史以移除敏感信息"
echo "⚠️  操作前请确保您已备份仓库"
echo "⚠️  这会影响所有协作者，需要强制推送"
echo ""
read -p "确认继续吗？(输入 'YES' 继续，其他任意键取消): " confirm

if [[ $confirm != "YES" ]]; then
    echo "操作已取消"
    exit 1
fi

echo "开始清理 Git 历史中的敏感信息..."

# 检查是否在 Git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ 错误：当前目录不是 Git 仓库"
    exit 1
fi

# 创建临时文件列表
echo "准备要删除的文件模式..."
cat > files-to-remove.txt << EOF
.env
.env.local
.env.development
.env.production
.env.test
config/keys.js
secrets.json
api-keys.txt
EOF

echo "将删除以下文件模式的所有历史记录："
cat files-to-remove.txt

# 检查是否安装了 BFG Repo-Cleaner
if ! command -v bfg &> /dev/null; then
    echo "📦 正在安装 BFG Repo-Cleaner..."

    # 检测操作系统
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install bfg-repo-cleaner
        else
            echo "❌ 请先安装 Homebrew 或手动下载 BFG Repo-Cleaner"
            echo "下载地址：https://rtyley.github.io/bfg-repo-cleaner/"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v wget &> /dev/null; then
            wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
            alias bfg="java -jar bfg-1.14.0.jar"
        else
            echo "❌ 请先安装 wget 或手动下载 BFG Repo-Cleaner"
            echo "下载地址：https://rtyley.github.io/bfg-repo-cleaner/"
            exit 1
        fi
    else
        echo "❌ 不支持的操作系统"
        exit 1
    fi
fi

# 运行 BFG 清理
echo "🧹 正在清理 Git 历史..."
bfg --delete-files files-to-remove.txt --no-blob-protection

# 清理 Git 引用
echo "🗑️  清理 Git 引用..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ 清理完成！"
echo ""
echo "📋 后续步骤："
echo "1. 检查清理结果：git log --oneline --name-status"
echo "2. 确认无误后，强制推送：git push --force"
echo "3. 通知所有协作者重新克隆仓库"
echo ""
echo "⚠️  重要：强制推送会影响所有协作者！"

# 清理临时文件
rm -f files-to-remove.txt
if [[ -f bfg-1.14.0.jar ]]; then
    rm -f bfg-1.14.0.jar
fi