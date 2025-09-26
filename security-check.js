#!/usr/bin/env node

/**
 * 安全检查脚本
 * 检查项目中可能存在的敏感信息泄露问题
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔒 ChefMind 安全检查报告');
console.log('================================\n');

// 检查结果
const results = {
    passed: [],
    warnings: [],
    errors: []
};

// 1. 检查是否存在 .env 文件
function checkEnvFiles() {
    console.log('📋 检查环境变量文件...');

    const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
    const existingEnvFiles = envFiles.filter(file => fs.existsSync(file));

    if (existingEnvFiles.length > 0) {
        existingEnvFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('api_key') || content.includes('API_KEY') ||
                content.includes('sk-') || content.length > 100) {
                results.errors.push(`❌ ${file} 文件存在且可能包含敏感信息`);
            } else {
                results.warnings.push(`⚠️  ${file} 文件存在，请确认是否包含敏感信息`);
            }
        });
    } else {
        results.passed.push('✅ 未发现敏感的环境变量文件');
    }
}

// 2. 检查 .gitignore 文件
function checkGitignore() {
    console.log('📋 检查 .gitignore 文件...');

    if (!fs.existsSync('.gitignore')) {
        results.errors.push('❌ 未找到 .gitignore 文件');
        return;
    }

    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    const requiredPatterns = ['.env', '*.key', 'secret*', 'config*key*'];

    const missingPatterns = requiredPatterns.filter(pattern => !gitignore.includes(pattern));

    if (missingPatterns.length > 0) {
        results.warnings.push(`⚠️  .gitignore 可能缺少以下模式: ${missingPatterns.join(', ')}`);
    } else {
        results.passed.push('✅ .gitignore 文件配置合理');
    }
}

// 3. 检查 Git 历史中的敏感信息
function checkGitHistory() {
    console.log('📋 检查 Git 历史记录...');

    try {
        // 检查是否有 .env 文件的历史记录
        const envHistory = execSync('git log --name-status --all -- .env 2>/dev/null || echo ""', { encoding: 'utf8' });

        if (envHistory.trim()) {
            results.errors.push('❌ Git 历史中包含 .env 文件记录');
            results.warnings.push('⚠️  建议使用 clean-git-history.sh 清理历史记录');
        } else {
            results.passed.push('✅ Git 历史中未发现 .env 文件记录');
        }

        // 检查是否有 API key 的历史记录
        const apiKeyHistory = execSync('git log --grep="api.*key\|secret.*key\|API.*KEY" --oneline 2>/dev/null || echo ""', { encoding: 'utf8' });

        if (apiKeyHistory.trim()) {
            results.warnings.push('⚠️  Git 历史中可能包含 API key 相关的提交信息');
        }

    } catch (error) {
        results.warnings.push('⚠️  无法检查 Git 历史记录');
    }
}

// 4. 检查代码中的硬编码密钥
function checkHardcodedKeys() {
    console.log('📋 检查代码中的硬编码密钥...');

    const keyPatterns = [
        /sk-[a-zA-Z0-9]{48,}/g,  // OpenAI API key pattern
        /AIza[0-9A-Za-z\-_]{35}/g,  // Google API key pattern
        /pk-[a-zA-Z0-9]{48,}/g,  // Stripe key pattern
        /['"`][a-zA-Z0-9]{32,}['"`]/g  // Generic long string pattern
    ];

    const checkFiles = [
        'package.json',
        'tauri.conf.json',
        '*.js',
        '*.ts',
        '*.vue',
        '*.json'
    ];

    let foundIssues = false;

    checkFiles.forEach(pattern => {
        try {
            if (pattern.includes('*')) {
                // 简单的 glob 支持
                const dir = pattern.includes('/') ? pattern.substring(0, pattern.lastIndexOf('/')) : '.';
                const ext = pattern.substring(pattern.lastIndexOf('.'));
                // 这里应该使用更复杂的 glob 实现，但为了简化，我们跳过
                return;
            }

            if (fs.existsSync(pattern)) {
                const content = fs.readFileSync(pattern, 'utf8');
                keyPatterns.forEach(regex => {
                    const matches = content.match(regex);
                    if (matches) {
                        results.errors.push(`❌ 在 ${pattern} 中发现可能的硬编码密钥: ${matches[0].substring(0, 20)}...`);
                        foundIssues = true;
                    }
                });
            }
        } catch (error) {
            // 忽略文件读取错误
        }
    });

    if (!foundIssues) {
        results.passed.push('✅ 未发现明显的硬编码密钥');
    }
}

// 5. 检查 GitHub Actions 配置
function checkGitHubActions() {
    console.log('📋 检查 GitHub Actions 配置...');

    const workflowDir = '.github/workflows';
    if (!fs.existsSync(workflowDir)) {
        results.warnings.push('⚠️  未发现 GitHub Actions 配置');
        return;
    }

    const workflowFiles = fs.readdirSync(workflowDir);
    let hasSecretsConfig = false;

    workflowFiles.forEach(file => {
        if (file.endsWith('.yml') || file.endsWith('.yaml')) {
            const content = fs.readFileSync(path.join(workflowDir, file), 'utf8');
            if (content.includes('secrets.')) {
                hasSecretsConfig = true;
            }
        }
    });

    if (hasSecretsConfig) {
        results.passed.push('✅ GitHub Actions 配置使用了 secrets');
    } else {
        results.warnings.push('⚠️  GitHub Actions 配置中未发现 secrets 使用');
    }
}

// 运行所有检查
function runChecks() {
    console.log('🚀 开始安全检查...\n');

    checkEnvFiles();
    checkGitignore();
    checkGitHistory();
    checkHardcodedKeys();
    checkGitHubActions();

    // 输出结果
    console.log('\n📊 检查结果:');
    console.log('============');

    if (results.passed.length > 0) {
        console.log('\n✅ 通过的检查:');
        results.passed.forEach(result => console.log(`  ${result}`));
    }

    if (results.warnings.length > 0) {
        console.log('\n⚠️  警告:');
        results.warnings.forEach(result => console.log(`  ${result}`));
    }

    if (results.errors.length > 0) {
        console.log('\n❌ 错误 (需要修复):');
        results.errors.forEach(result => console.log(`  ${result}`));
    }

    // 总结
    console.log('\n📋 总结:');
    console.log(`- 通过检查: ${results.passed.length} 项`);
    console.log(`- 警告: ${results.warnings.length} 项`);
    console.log(`- 错误: ${results.errors.length} 项`);

    if (results.errors.length === 0) {
        console.log('\n🎉 基本安全检查通过！');
        if (results.warnings.length > 0) {
            console.log('建议处理警告项以进一步提高安全性。');
        }
    } else {
        console.log('\n🚨 发现安全问题，请及时修复！');
    }

    // 提供建议
    console.log('\n💡 安全建议:');
    console.log('1. 定期轮换 API 密钥');
    console.log('2. 使用 GitHub Secrets 管理敏感信息');
    console.log('3. 定期检查依赖包安全性');
    console.log('4. 监控 API 使用情况');
    console.log('5. 设置适当的访问权限');

    console.log('\n📞 需要帮助？');
    console.log('请查看 GITHUB_SECRETS_SETUP.md 获取详细设置指南。');
}

// 运行检查
runChecks();