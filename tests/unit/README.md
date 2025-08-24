# 单元测试

本目录包含 ChefMind 智食谱项目的单元测试文件。

## 测试结构

```
unit/
├── components/  # 组件测试
├── services/    # 服务测试
├── stores/      # 状态管理测试
└── utils/       # 工具函数测试
```

## 编写单元测试

使用 Vitest 和 Vue Test Utils 编写组件测试：

```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Component from '@/components/Component.vue'

describe('Component', () => {
  it('应该正确渲染', () => {
    const wrapper = mount(Component)
    expect(wrapper.exists()).toBe(true)
  })
})