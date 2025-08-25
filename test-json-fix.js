// 测试JSON清理逻辑
const testJson = '{"calories": 950, "protein": 45g, "carbs": 130g, "fat": 40g}'

console.log('原始JSON:', testJson)

// 应用我们的清理逻辑
let cleanedJson = testJson

// 第一步：处理不带引号的数字+单位组合: 45g -> "45"
cleanedJson = cleanedJson.replace(/:\s*(\d+(?:\.\d+)?)([a-zA-Z]+)/g, ': "$1"')

// 第二步：处理带引号的数字+单位组合: "45g" -> "45"
cleanedJson = cleanedJson.replace(/"(\d+(?:\.\d+)?)([a-zA-Z]+)"/g, '"$1"')

console.log('清理后JSON:', cleanedJson)

try {
  const parsed = JSON.parse(cleanedJson)
  console.log('解析成功:', parsed)
} catch (error) {
  console.log('解析失败:', error.message)
}
