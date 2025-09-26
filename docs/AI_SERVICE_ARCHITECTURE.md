# 🤖 ChefMind AI 服务架构文档

## 🏗️ 架构概览

ChefMind 的 AI 服务采用插件化架构，支持多种 AI 提供商，包括 OpenAI、智谱AI、Anthropic、Google 等。通过统一的接口抽象，应用可以无缝切换不同的 AI 提供商。AI服务与数据库系统集成，确保菜谱生成和会话数据的持久化存储。

## 📐 架构图

```
┌─────────────────┐    ┌──────────────────┐    ┌────────────────────┐
│   AI 服务接口    │◄───┤  AI 配置管理器    │◄───┤   应用业务逻辑层    │
└─────────────────┘    └──────────────────┘    └────────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌────────────────────┐
│ OpenAI 适配器    │    │  智谱AI 适配器    │    │ 其他提供商适配器...  │
└─────────────────┘    └──────────────────┘    └────────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          AI 提供商 API                              │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    数据库服务层 (SQLite)                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   连接池    │ │  重试机制   │ │ 事务管理   │ │  健康监控   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## 🧩 核心组件

### 1. AI 提供商基础接口 (BaseAIProvider)

定义了所有 AI 提供商必须实现的接口：

```typescript
interface BaseAIProvider {
  generateRecipe(params: RecipeGenerationParams): Promise<Recipe>;
  analyzeNutrition(recipe: Recipe): Promise<NutritionAnalysisResult>;
  validateIngredient(ingredient: string): Promise<IngredientValidationResult>;
  getPersonalizedRecommendations(
    sessionHistory: SessionHistoryItem[],
    preferences: SessionPreferences,
    limit: number
  ): Promise<PersonalizedRecommendation[]>;
  getCookingGuidance(
    recipe: Recipe,
    currentStep: number
  ): Promise<{
    guidance: string;
    tips: string[];
    nextStep?: string;
    estimatedTime: number;
  }>;
}
```

### 2. AI 配置管理器 (AIConfigService)

负责管理 AI 提供商的配置信息，包括 API 密钥、模型选择、参数配置等。支持多种存储后端（SQLite、IndexedDB、内存存储）。

### 3. AI 提供商适配器

每个 AI 提供商都有对应的适配器实现，负责将应用的请求转换为特定提供商的 API 调用。

#### 智谱AI 适配器 (GLMProvider)
- 支持 GLM-4、GLM-4-Flash 等模型
- 支持长文本处理
- 优化中文处理能力
- 支持图片食材识别

#### Anthropic 适配器 (AnthropicProvider)
- 支持 Claude 3 系列模型
- 强大的推理和创作能力
- 适合复杂菜谱生成

#### Google Gemini 适配器 (GeminiProvider)
- 支持 Gemini Pro 和 Gemini Pro Vision 模型
- 多模态AI模型，支持图片分析
- 适合食材识别和营养分析

#### DeepSeek 适配器 (DeepSeekProvider)
- 支持 DeepSeek 系列模型
- 高性能AI模型，代码能力强
- 适合技术性菜谱生成

#### Moonshot 适配器 (MoonshotProvider)
- 支持 Moonshot 系列模型
- 支持长文本的AI模型
- 适合复杂菜谱说明

#### 通义千问 适配器 (QwenProvider)
- 支持 Qwen 系列模型
- 阿里云的大语言模型
- 优秀的中文处理能力

#### 腾讯混元 适配器 (HunyuanProvider)
- 支持 Hunyuan 系列模型
- 腾讯的大语言模型
- 良好的中文对话能力

#### OpenAI 兼容适配器 (QwenProvider)
- 兼容 OpenAI API 接口
- 支持 GPT 系列模型
- 需要配置 API 密钥

## 🛠️ 配置管理

### 环境变量配置

AI 提供商的 API 密钥可以通过环境变量配置，参考 `.env.example` 文件：

```bash
# 智谱AI 配置
VITE_GLM_API_KEY=your_glm_api_key_here
VITE_GLM_MODEL=glm-4-flash

# Anthropic 配置
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
VITE_ANTHROPIC_MODEL=claude-3-haiku-20240307

# Google Gemini 配置
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_MODEL=gemini-pro

# DeepSeek 配置
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
VITE_DEEPSEEK_MODEL=deepseek-chat

# Moonshot 配置
VITE_MOONSHOT_API_KEY=your_moonshot_api_key_here
VITE_MOONSHOT_MODEL=moonshot-v1-8k

# 通义千问 配置
VITE_QWEN_API_KEY=your_qwen_api_key_here
VITE_QWEN_MODEL=qwen-turbo

# 腾讯混元 配置
VITE_HUNYUAN_API_KEY=your_hunyuan_api_key_here
VITE_HUNYUAN_MODEL=hunyuan-lite

# OpenAI 兼容配置
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_MODEL=gpt-4o
```

### 应用内配置

可以在应用界面中动态配置 AI 提供商和模型，配置信息存储在本地数据库中。应用支持同时配置多个 AI 提供商，并可以动态切换。

### 运行时配置

可以在应用界面中动态切换 AI 提供商和模型，配置信息存储在本地存储中。

## 🔁 缓存机制

为了提高性能和减少 API 调用成本，AI 服务实现了多级缓存机制：

1. **内存缓存** - 使用 LRU 算法缓存最近使用的响应
2. **本地存储缓存** - 将结果持久化到浏览器本地存储
3. **数据库缓存** - 将重要结果存储到 SQLite 数据库

## 📊 监控与日志

AI 服务集成了性能监控功能，记录：

- API 调用响应时间
- 成功率统计
- 错误日志
- 成本分析
- 数据库操作性能
- 连接池状态
- 缓存命中率

## 🔒 安全考虑

1. **API 密钥保护** - 密钥存储在环境变量或本地数据库中，不在代码中硬编码
2. **请求限制** - 实现请求频率限制，防止滥用
3. **错误处理** - 统一的错误处理机制，避免敏感信息泄露
4. **模拟模式** - 在没有配置 API 密钥时使用模拟数据
5. **传输加密** - 所有 API 请求通过 HTTPS 加密传输
6. **数据库安全** - 外键约束、事务完整性、访问权限控制
7. **并发控制** - 连接池管理和重试机制防止数据冲突

## 🧪 测试策略

1. **单元测试** - 对每个 AI 适配器进行单元测试
2. **集成测试** - 测试完整的 AI 服务调用流程
3. **模拟测试** - 使用模拟 API 测试不同场景
4. **性能测试** - 评估不同提供商的响应时间和成本

## 🚀 扩展性

架构设计支持轻松添加新的 AI 提供商：

1. 创建新的提供商适配器，实现 `BaseAIProvider` 接口
2. 在 `AIProviderFactory` 中注册新的提供商
3. 更新 UI 组件以支持新的选项
4. 添加相应的测试用例

## ⚙️ 最佳实践

1. **错误重试机制** - 对网络错误实现指数退避重试
2. **超时控制** - 设置合理的请求超时时间
3. **资源清理** - 及时释放不再需要的资源
4. **版本兼容性** - 确保适配器兼容不同版本的 API
5. **配置管理** - 使用环境变量或应用内配置管理 API 密钥
6. **数据库集成** - AI生成的菜谱数据持久化存储到SQLite数据库
7. **事务管理** - 复杂的AI服务操作使用数据库事务确保数据一致性
8. **缓存优化** - 合理使用缓存减少AI API调用成本
9. **健康监控** - 监控AI服务和数据库服务的健康状态

## 🔄 数据集成

### AI菜谱数据流
```
会话输入 → AI服务 → 菜谱生成 → 数据库存储 → 前端展示
```

### 数据持久化策略
- **会话数据**: 存储在SQLite users表中
- **生成的菜谱**: 存储在SQLite recipes表中
- **会话收藏**: 存储在SQLite favorites表中
- **搜索历史**: 存储在SQLite search_history表中
- **缓存数据**: 存储在SQLite cache表中

### 一致性保证
- 使用数据库事务确保AI生成和存储的原子性
- 实现重试机制处理并发冲突
- 通过外键约束维护数据完整性