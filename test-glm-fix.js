// GLM API 修复测试脚本

const apiKey = '0c1495fed1c8409495dcd33d04f2b84d.NSTRKFqAS8u8AxiE'
const baseURL = 'https://open.bigmodel.cn/api/paas/v4/'

async function testGLMAPI() {
  try {
    console.log('测试GLM API修复...')

    const requestBody = {
      model: 'glm-4',
      messages: [
        {
          role: 'user',
          content:
            '请为惠灵顿牛排生成一个简单的食谱，用JSON格式返回，包含title、ingredients和instructions字段',
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }

    console.log('发送请求...')
    console.log('请求体:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(`${baseURL}chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    console.log('响应状态:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('错误响应:', errorText)
      return
    }

    const data = await response.json()
    console.log('成功响应:', JSON.stringify(data, null, 2))

    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log('GLM API 返回内容:', data.choices[0].message.content)
    }
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testGLMAPI()
