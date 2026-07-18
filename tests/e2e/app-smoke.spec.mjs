import { expect, test } from '@playwright/test'

const routes = [
  ['/', /ChefMind|智能烹饪助手/],
  ['/search', /搜索|食谱/],
  ['/ai', /AI|智能/],
  ['/settings', /AI 服务设置|API Key|测试连接/],
  ['/shopping-list', /购物清单/],
  ['/cooking-guide', /烹饪指导/],
  ['/analytics', /营养|分析|数据/],
]

async function openRoute(page, hashPath) {
  const target = `/#${hashPath}`
  await page.goto(target, { waitUntil: 'domcontentloaded' })
}

test.describe('ChefMind smoke paths', () => {
  for (const [hashPath, expectedText] of routes) {
    test(`renders ${hashPath}`, async ({ page }) => {
      const errors = []
      page.on('pageerror', error => errors.push(error.message))

      await openRoute(page, hashPath)

      await expect(page.locator('body')).toContainText(expectedText)
      expect(errors).toEqual([])
    })
  }

  test('opens the About Us video link to the configured Bilibili URL', async ({ page }) => {
    await openRoute(page, '/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.getByText('关于我们').first().click()

    const link = page.getByRole('link', { name: /观看介绍视频/ })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute(
      'href',
      'https://www.bilibili.com/video/BV1GJ411x7h7/'
    )
    await expect(link).toHaveAttribute('target', '_blank')
  })

  test('keeps Web BYOK keys out of persistent browser storage', async ({ page }) => {
    await openRoute(page, '/settings')

    const fields = page.locator('.settings-view .field')
    await fields.nth(1).locator('input').fill('demo-model')
    await fields.nth(2).locator('input').fill('https://api.example.com/v1')
    await fields.nth(3).locator('input').fill('demo-user-key')
    await page.getByRole('button', { name: '保存配置' }).click()

    await expect(page.getByText('AI 配置已保留在本次页面')).toBeVisible()
    const leakedKey = await page.evaluate(() => {
      const persistedValues = [...Array.from({ length: localStorage.length }, (_, index) => {
        const key = localStorage.key(index)
        return key ? `${key}:${localStorage.getItem(key)}` : ''
      }), ...Array.from({ length: sessionStorage.length }, (_, index) => {
        const key = sessionStorage.key(index)
        return key ? `${key}:${sessionStorage.getItem(key)}` : ''
      })]
      return persistedValues.some(value => value.includes('demo-user-key'))
    })

    expect(leakedKey).toBe(false)
  })
})
