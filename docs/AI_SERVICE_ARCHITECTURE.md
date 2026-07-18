# ChefMind AI 服务架构

ChefMind 使用以用户自带 Key（BYOK）为中心的 Provider 中立架构。模型供应商只是设置页中的预设；应用不指定默认模型，也不代付模型额度。

## 调用链

```text
设置页（Provider 预设、Base URL、模型、用户 Key）
                 │
                 ▼
AIProviderFactory ──► OpenAICompatibleProvider ──► 用户选择的供应商
                 │
                 └──► Mock Provider（离线演示）
```

- 菜谱生成、搜索、营养分析和文本增强都通过当前 Provider 的统一文本生成能力执行。
- OpenAI、DeepSeek、通义千问、Moonshot、智谱、硅基流动等只是 OpenAI-compatible 预设；用户可选择任意支持 Chat Completions 的 HTTPS 服务。
- 每次真实请求使用用户的 Key，费用、速率限制和供应商数据策略由该用户的供应商账户决定。

## 凭据存储

| 运行环境 | Key 的保存方式 | 请求发起方 |
| --- | --- | --- |
| Web / GitHub Pages | 仅当前页面内存；刷新后清除 | 浏览器直连供应商 |
| Tauri 桌面版 | 操作系统凭据库 | Rust 原生层直连供应商 |

桌面版只将非敏感的 Provider 元数据保存在 SQLite。Key 不写入 SQLite，也不会从 Rust 返回给 WebView。旧版本的 `localStorage`/SQLite 明文 Key 会在读取时迁移或清除。

## GitHub Pages 边界

GitHub Pages 仅发布静态文件，不接收也不托管用户 API Key。由于没有代理服务，供应商必须允许来自该站点的浏览器 CORS 请求。Web 版本不能使用操作系统钥匙串，也不能承诺抵御同源恶意脚本或浏览器扩展；用户应使用受限/可撤销的供应商 Key。

菜谱、收藏和购物清单可保存在 IndexedDB。浏览器存储不是备份，设置页提供 JSON 导出、导入和清除操作；备份不包含任何 API 配置或 Key。

## 安全约束

- 自定义 Provider 仅接受公共 HTTPS URL，不接受 URL 内凭据、查询参数、回环地址或 IP 地址。
- Key 不能放入 `.env`、`VITE_*` 变量、GitHub Actions Secret 或公开仓库。
- 连接测试和错误处理不记录 Key；桌面原生请求拒绝任意 URL/Header 参数。
