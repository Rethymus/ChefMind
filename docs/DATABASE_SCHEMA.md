# 🗄️ ChefMind 数据库设计文档

## 📋 数据库概览

ChefMind 使用 SQLite 作为主要的数据存储方案，支持本地存储和 IndexedDB 备用方案。数据库设计遵循第三范式，确保数据的一致性和完整性。系统已实现连接池、重试机制、事务管理和健康监控，确保高性能并发访问。

## 📊 数据表结构

### 1. sessions (会话表)

存储会话信息和偏好设置。

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 会话唯一标识 |
| session_id | TEXT | UNIQUE NOT NULL | 会话ID |
| preferences | TEXT | | 偏好设置(JSON) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**索引**:
- `session_id` - 唯一索引
- `created_at` - 时间索引

### 2. recipes (菜谱表)

存储AI生成的菜谱信息。

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 菜谱唯一标识 |
| title | TEXT | NOT NULL | 菜谱标题 |
| description | TEXT | | 菜谱描述 |
| ingredients | TEXT | NOT NULL | 食材列表(JSON) |
| instructions | TEXT | NOT NULL | 制作步骤(JSON) |
| cooking_time | TEXT | | 制作时间 |
| difficulty | TEXT | | 难度等级 |
| servings | INTEGER | | 份量 |
| category | TEXT | | 菜谱分类 |
| tags | TEXT | | 标签(JSON) |
| nutrition_info | TEXT | | 营养信息(JSON) |
| image_url | TEXT | | 图片URL |
| ai_provider | TEXT | | AI提供商 |
| ai_model | TEXT | | AI模型 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**索引**:
- `title` - 全文索引
- `category` - 分类索引
- `created_at` - 时间索引
- `ai_provider` - AI提供商索引

### 3. favorites (收藏表)

存储会话收藏的菜谱。

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 收藏记录唯一标识 |
| session_id | TEXT | NOT NULL | 会话ID |
| recipe_id | INTEGER | NOT NULL | 菜谱ID |
| recipe_title | TEXT | NOT NULL | 菜谱标题 |
| recipe_image | TEXT | | 菜谱图片 |
| notes | TEXT | | 备注 |
| rating | INTEGER | | 评分(1-5) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 收藏时间 |

**索引**:
- `session_id, recipe_id` - 复合唯一索引
- `session_id` - 会话索引
- `created_at` - 时间索引

### 4. search_history (搜索历史表)

存储会话的搜索历史记录。

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 搜索记录唯一标识 |
| session_id | TEXT | NOT NULL | 会话ID |
| ingredients | TEXT | NOT NULL | 搜索食材(JSON) |
| cooking_methods | TEXT | | 烹饪方式(JSON) |
| dietary_restrictions | TEXT | | 饮食限制(JSON) |
| result_count | INTEGER | | 结果数量 |
| search_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 搜索时间 |

### 5. cache (缓存表)

存储AI生成结果的缓存数据。

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 缓存记录唯一标识 |
| key | TEXT | UNIQUE NOT NULL | 缓存键 |
| value | TEXT | NOT NULL | 缓存值(JSON) |
| ttl | INTEGER | | 过期时间(秒) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| expires_at | DATETIME | | 过期时间 |

## 🔗 表关系图

```
sessions 1-----∞ favorites
sessions 1-----∞ search_history
recipes 1-----∞ favorites
```

**外键约束**:
- `favorites.recipe_id` → `recipes.id`
- `favorites.session_id` → `sessions.session_id`
- `search_history.session_id` → `sessions.session_id`
- 所有级联删除和更新操作都已配置

## 🚀 数据库性能优化

### 连接池配置
- **最大连接数**: 10个连接
- **最小连接数**: 2个连接
- **空闲超时**: 30秒
- **获取超时**: 10秒

### SQLite 优化配置
```sql
-- 启用WAL模式，提升并发性能
PRAGMA journal_mode = WAL;
-- 设置超时时间为10秒
PRAGMA busy_timeout = 10000;
-- 缓存大小20MB
PRAGMA cache_size = -20000;
-- 启用外键约束
PRAGMA foreign_keys = ON;
-- 内存映射256MB
PRAGMA mmap_size = 268435456;
-- 同步模式设置为NORMAL
PRAGMA synchronous = NORMAL;
```

### 重试机制
- **最大重试次数**: 3次
- **初始延迟**: 1000ms
- **退避因子**: 2
- **处理错误**: SQLITE_BUSY, SQLITE_LOCKED

### 事务管理
- 支持嵌套事务
- 自动回滚机制
- 超时控制
- 状态监控

## 🛠️ 数据库初始化

数据库初始化通过 `src/services/database/` 模块完成，包括：
- 自动创建数据表
- 索引优化
- 配置应用
- 健康检查

## 🔄 数据库版本控制

数据库版本通过迁移脚本进行管理，确保在应用升级时能够正确更新数据库结构。

## 📊 健康监控

### 监控指标
- 连接池状态
- 数据库文件大小
- 查询响应时间
- 错误率统计
- 并发连接数

### 监控方法
```typescript
// 获取数据库状态
const status = databaseSingleton.getStatus();

// 检查连接池状态
const poolStatus = databaseSingleton.getConnectionPoolStatus();

// 运行健康检查
const health = await databaseSingleton.healthCheck();
```

## 🔒 数据安全

- 所有敏感数据(如API密钥)不存储在数据库中
- 会话数据遵循隐私保护原则
- 数据库文件存储在本地，确保数据安全
- 外键约束保证数据完整性
- 事务处理保证数据一致性

## 📈 性能指标

- **响应时间**: < 200ms (复杂查询)
- **并发支持**: 5+ 并发连接
- **连接池效率**: 90%+ 命中率
- **错误恢复**: 自动重试成功率 95%+
- **数据一致性**: 100% 无冲突