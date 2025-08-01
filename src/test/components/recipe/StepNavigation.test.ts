import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StepNavigation from '@/components/recipe/StepNavigation.vue'

describe('StepNavigation', () => {
  const defaultProps = {
    currentStep: 1,
    canProceedStep2: true,
    canProceedStep3: false,
    canGenerate: false
  }

  it('应该正确渲染步骤导航', () => {
    const wrapper = mount(StepNavigation, {
      props: defaultProps
    })
    
    expect(wrapper.find('.step-navigation').exists()).toBe(true)
    expect(wrapper.find('.nav-buttons').exists()).toBe(true)
  })

  it('应该在第一步时不显示上一步按钮', () => {
    const wrapper = mount(StepNavigation, {
      props: {
        ...defaultProps,
        currentStep: 1
      }
    })
    
    expect(wrapper.find('.prev-btn').exists()).toBe(false)
  })

  it('应该在第二步时显示上一步按钮', () => {
    const wrapper = mount(StepNavigation, {
      props: {
        ...defaultProps,
        currentStep: 2,
        canProceedStep3: true
      }
    })
    
    expect(wrapper.find('.prev-btn').exists()).toBe(true)
  })

  it('应该在第三步时显示生成按钮', () => {
    const wrapper = mount(StepNavigation, {
      props: {
        ...defaultProps,
        currentStep: 3,
        canGenerate: true
      }
    })
    
    expect(wrapper.find('.generate-btn').exists()).toBe(true)
    expect(wrapper.text()).toContain('生成菜谱')
  })

  it('应该在无法继续时禁用下一步按钮', () => {
    const wrapper = mount(StepNavigation, {
      props: {
        ...defaultProps,
        currentStep: 1,
        canProceedStep2: false
      }
    })
    
    const nextButton = wrapper.find('.next-btn')
    expect(nextButton.attributes('disabled')).toBeDefined()
  })

  it('应该触发下一步事件', async () => {
    const wrapper = mount(StepNavigation, {
      props: {
        ...defaultProps,
        canProceedStep2: true
      }
    })
    
    await wrapper.find('.next-btn').trigger('click')
    expect(wrapper.emitted('next-step')).toBeTruthy()
  })

  it('应该触发上一步事件', async () => {
    const wrapper = mount(StepNavigation, {
      props: {
        ...defaultProps,
        currentStep: 2,
        canProceedStep3: true
      }
    })
    
    await wrapper.find('.prev-btn').trigger('click')
    expect(wrapper.emitted('prev-step')).toBeTruthy()
  })

  it('应该触发生成事件', async () => {
    const wrapper = mount(StepNavigation, {
      props: {
        ...defaultProps,
        currentStep: 3,
        canGenerate: true
      }
    })
    
    await wrapper.find('.generate-btn').trigger('click')
    expect(wrapper.emitted('generate-recipes')).toBeTruthy()
  })

  it('应该显示正确的进度提示', () => {
    const wrapper = mount(StepNavigation, {
      props: {
        ...defaultProps,
        currentStep: 1,
        canProceedStep2: false
      }
    })
    
    expect(wrapper.text()).toContain('请至少选择一种食材继续')
  })
})
