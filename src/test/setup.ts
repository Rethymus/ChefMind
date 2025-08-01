import { config } from '@vue/test-utils'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import { vi } from 'vitest'

// 全局配置 Vue Test Utils
config.global.plugins = [ElementPlus, createPinia()]

// 模拟 Element Plus 图标
vi.mock('@element-plus/icons-vue', () => ({
  DataAnalysis: { name: 'DataAnalysis' },
  PieChart: { name: 'PieChart' },
  Sunny: { name: 'Sunny' },
  TrendCharts: { name: 'TrendCharts' },
  Food: { name: 'Food' },
  Drizzling: { name: 'Drizzling' },
  User: { name: 'User' },
  Setting: { name: 'Setting' },
  Warning: { name: 'Warning' },
  Aim: { name: 'Aim' },
  House: { name: 'House' },
  ArrowLeft: { name: 'ArrowLeft' },
  ArrowRight: { name: 'ArrowRight' },
  MagicStick: { name: 'MagicStick' },
  RefreshLeft: { name: 'RefreshLeft' },
  Check: { name: 'Check' },
  Close: { name: 'Close' },
  Plus: { name: 'Plus' },
  Minus: { name: 'Minus' },
  Timer: { name: 'Timer' },
  VideoPlay: { name: 'VideoPlay' },
  VideoPause: { name: 'VideoPause' },
  Delete: { name: 'Delete' },
  Bell: { name: 'Bell' },
  // 添加更多图标模拟...
}))

// 全局模拟
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
