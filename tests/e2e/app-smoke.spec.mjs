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

test.describe('ChefMind smoke paths', () => {
  for (const [hashPath, expectedText] of routes) {
    test(`renders ${hashPath}`, async ({ page }) => {
      const errors = []
      page.on('pageerror', error => errors.push(error.message))

      await page.goto(`/#${hashPath}`)
      await page.waitForLoadState('networkidle')

      await expect(page.locator('body')).toContainText(expectedText)
      expect(errors).toEqual([])
    })
  }

  test('opens the About Us video link to the configured Bilibili URL', async ({ page }) => {
    await page.goto('/#/')
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
})
