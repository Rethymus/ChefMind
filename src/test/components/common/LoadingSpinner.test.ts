import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('应该正确渲染加载动画', () => {
    const wrapper = mount(LoadingSpinner)
    
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    expect(wrapper.find('.spinner').exists()).toBe(true)
  })

  it('应该在没有消息时不显示文本', () => {
    const wrapper = mount(LoadingSpinner)
    
    expect(wrapper.find('.loading-message').exists()).toBe(false)
  })

  it('应该显示自定义加载文本', () => {
    const customText = '正在生成菜谱...'
    const wrapper = mount(LoadingSpinner, {
      props: {
        message: customText
      }
    })
    
    expect(wrapper.text()).toContain(customText)
    expect(wrapper.find('.loading-message').exists()).toBe(true)
  })

  it('应该支持不同尺寸', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        size: 48
      }
    })
    
    // 检查组件是否正确接收尺寸属性
    expect(wrapper.props('size')).toBe(48)
  })

  it('应该支持全屏模式', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        fullScreen: true
      }
    })
    
    expect(wrapper.classes()).toContain('full-screen')
  })
})
