# 🗄️ ChefMind 数据库设计文档

## 📋 数据库概览

ChefMind 使用 SQLite 作为主要的数据存储方案，支持本地存储和 IndexedDB 备用方案。数据库设计遵循第三范式，确保数据的一致性和完整性。

## 📊 数据表结构

### 1. users (用户表)

存储用户基本信息和偏好设置。

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 用户唯一标识 |
| username | TEXT | UNIQUE NOT NULL | 用户名 |
| email | TEXT | UNIQUE | 邮箱地址 |
| avatar | TEXT | | 用户头像URL |
| preferences | TEXT | | 用户偏好设置(JSON) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

### 2. recipes (菜谱表)

存储AI生成的菜谱信息。

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 菜谱唯一标识 |
| name | TEXT | NOT NULL | 菜谱名称 |
| description | TEXT | | 菜谱描述 |
| ingredients | TEXT | NOT NULL | 食材列表(JSON) |
| steps | TEXT | NOT NULL | 制作步骤(JSON) |
| cooking_time | INTEGER | | 制作时间(分钟) |
| difficulty | TEXT | | 难度等级 |
| servings | INTEGER | | 份量 |
| nutrition_info | TEXT | | 营养信息(JSON) |
| cuisine_type | TEXT | | 菜系类型 |
| tags | TEXT | | 标签(JSON) |
| ai_provider | TEXT | | AI提供商 |
| ai_model | TEXT | | AI模型 |
| cover_svg | TEXT | | SVG封面代码 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

### 3. favorites (收藏表)

存储用户收藏的菜谱。

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 收藏记录唯一标识 |
| user_id | INTEGER | NOT NULL | 用户ID |
| recipe_id | INTEGER | NOT NULL | 菜谱ID |
| notes | TEXT | | 用户备注 |
| rating | INTEGER | | 用户评分(1-5) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 收藏时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

### 4. search_history (搜索历史表)

存储用户的搜索历史记录。

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 搜索记录唯一标识 |
| user_id | INTEGER | NOT NULL | 用户ID |
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
users 1-----∞ favorites
users 1-----∞ search_history
recipes 1-----∞ favorites
```

## 🛠️ 数据库初始化

数据库初始化通过 `scripts/init-database.js` 脚本完成，该脚本会创建所有必要的数据表并插入初始数据。

## 🔄 数据库版本控制

数据库版本通过迁移脚本进行管理，确保在应用升级时能够正确更新数据库结构。

## 🔒 数据安全

- 所有敏感数据(如API密钥)不存储在数据库中
- 用户数据遵循隐私保护原则
- 数据库文件存储在用户本地，确保数据安全