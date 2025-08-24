# 测试目录

本目录包含 ChefMind 智食谱项目的测试文件。

## 测试结构

```
tests/
├── unit/           # 单元测试
│   ├── components/ # 组件测试
│   ├── services/   # 服务测试
│   ├── stores/     # 状态管理测试
│   └── utils/      # 工具函数测试
├── e2e/            # 端到端测试
└── integration/    # 集成测试
```

## 运行测试

```bash
# 运行所有测试
npm run test

# 运行单元测试
npm run test:unit

# 运行端到端测试
npm run test:e2e

# 使用 UI 界面运行测试
npm run test:ui
```

## 测试规范

1. 每个组件应该有对应的测试文件
2. 测试文件命名应与被测试文件一致，例如：`Component.vue` -> `Component.test.ts`
3. 使用描述性的测试名称，清晰表达测试目的
4. 遵循 AAA 模式：Arrange（准备）, Act（执行）, Assert（断言）
5. 避免测试之间的依赖关系
6. 模拟外部依赖，如 API 调用

## 编写测试示例

```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Component from '@/components/Component.vue'

describe('Component', () => {
  it('应该正确渲染', () => {
    // Arrange
    const wrapper = mount(Component)
    
    // Act & Assert
    expect(wrapper.exists()).toBe(true)
  })
  
  it('应该响应点击事件', async () => {
    // Arrange
    const wrapper = mount(Component)
    
    // Act
    await wrapper.find('button').trigger('click')
    
    // Assert
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

## 测试覆盖率

我们的目标是保持至少 80% 的测试覆盖率。覆盖率报告可以通过以下命令生成：

```bash
npm run test:coverage
```

报告将生成在 `coverage/` 目录中。