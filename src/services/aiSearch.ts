import { evaluate } from 'mathjs'
import { allModules, ModuleItem } from '@/config/modules'

export interface SmartResult {
  type: 'math' | 'currency' | 'unit' | 'module'
  title: string
  content: string
  action?: {
    label: string
    route: string
    params?: any
  }
}

const defaultCurrencies = [
  { code: 'CNY', name: '人民币', symbol: '¥', rate: 1 },
  { code: 'USD', name: '美元', symbol: '$', rate: 7.24 },
  { code: 'EUR', name: '欧元', symbol: '€', rate: 7.86 },
  { code: 'GBP', name: '英镑', symbol: '£', rate: 9.18 },
  { code: 'JPY', name: '日元', symbol: '¥', rate: 0.048 },
  { code: 'HKD', name: '港币', symbol: 'HK$', rate: 0.93 },
]

export const getSmartResult = (query: string): SmartResult | null => {
  if (!query.trim()) return null

  const q = query.toLowerCase().trim()

  // 1. 模块模糊匹配 (最高优先级，如果是精确的模块名，直接提示跳转)
  const matchedModule = allModules.find(m => 
    m.name === q || m.name === q + '计算' || m.name === q + '器' || m.name === q + '换算'
  )
  if (matchedModule) {
    return {
      type: 'module',
      title: '功能直达',
      content: `打开 ${matchedModule.name}`,
      action: {
        label: '立即进入',
        route: matchedModule.route
      }
    }
  }

  // 2. 汇率换算匹配 (e.g. "100美元", "100 usd to cny", "100人民币等于多少美金")
  const currencyRegex = /^(\d+(\.\d+)?)\s*(美元|usd|人民币|cny|欧元|eur|英镑|gbp|日元|jpy|港币|hkd)\s*(?:等于|换算|是多少|to|in)?\s*(美元|usd|人民币|cny|欧元|eur|英镑|gbp|日元|jpy|港币|hkd)?$/i
  const currencyMatch = q.match(currencyRegex)
  if (currencyMatch) {
    const amount = parseFloat(currencyMatch[1])
    const fromName = currencyMatch[3].toUpperCase()
    const toName = (currencyMatch[4] || (fromName === 'CNY' || fromName === '人民币' ? 'USD' : 'CNY')).toUpperCase()

    const getCurrency = (name: string) => {
      if (['人民币', 'CNY'].includes(name)) return defaultCurrencies[0]
      if (['美元', 'USD'].includes(name)) return defaultCurrencies[1]
      if (['欧元', 'EUR'].includes(name)) return defaultCurrencies[2]
      if (['英镑', 'GBP'].includes(name)) return defaultCurrencies[3]
      if (['日元', 'JPY'].includes(name)) return defaultCurrencies[4]
      if (['港币', 'HKD'].includes(name)) return defaultCurrencies[5]
      return null
    }

    const from = getCurrency(fromName)
    const to = getCurrency(toName)

    if (from && to) {
      const result = (amount * from.rate / to.rate).toFixed(2)
      return {
        type: 'currency',
        title: '汇率换算',
        content: `${amount} ${from.name} ≈ ${result} ${to.name}`,
        action: {
          label: '查看详情',
          route: '/tool/currency',
          params: { from: from.code, to: to.code, amount: amount }
        }
      }
    }
  }

  // 3. 百分比计算 (e.g. "25的40%", "100的10%")
  const percentRegex = /^(\d+(\.\d+)?)\s*(?:的|的)?\s*(\d+(\.\d+)?)\s*%$/
  const percentMatch = q.match(percentRegex)
  if (percentMatch) {
    const base = parseFloat(percentMatch[1])
    const percent = parseFloat(percentMatch[3])
    const result = (base * percent / 100).toFixed(2).replace(/\.00$/, '')
    return {
      type: 'math',
      title: '百分比计算',
      content: `${base} 的 ${percent}% 是 ${result}`,
      action: {
        label: '复制结果',
        route: '', // Special case handled in UI
        params: { copy: result }
      }
    }
  }

  // 4. 大写转换 (e.g. "123.45转大写", "大写 500")
  const uppercaseRegex = /^(?:(\d+(\.\d+)?)\s*转?大写|大写\s*(\d+(\.\d+)?))$/
  const uppercaseMatch = q.match(uppercaseRegex)
  if (uppercaseMatch) {
    const amount = uppercaseMatch[1] || uppercaseMatch[3]
    return {
      type: 'module',
      title: '金额转大写',
      content: `将金额 ${amount} 转换为大写人民币`,
      action: {
        label: '立即转换',
        route: '/tool/uppercase',
        params: { amount }
      }
    }
  }

  // 5. 日期偏移 (e.g. "100天后是哪天", "2024年元旦后50天")
  const dateOffsetRegex = /^(?:(\d{4}[年/-]\d{1,2}[月/-]\d{1,2}日?)?)\s*(?:后|往后)?\s*(\d+)\s*(?:天|日)(?:后|是哪天)?$/
  const dateOffsetMatch = q.match(dateOffsetRegex)
  if (dateOffsetMatch) {
    const baseDate = dateOffsetMatch[1] ? new Date(dateOffsetMatch[1].replace(/[年月]/g, '-').replace('日', '')) : new Date()
    const days = parseInt(dateOffsetMatch[2])
    const targetDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000)
    const resultStr = `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月${targetDate.getDate()}日`
    return {
      type: 'math',
      title: '日期推算',
      content: `${dateOffsetMatch[1] || '今天'} 的 ${days} 天后是 ${resultStr}`,
      action: {
        label: '查看日期详情',
        route: '/tool/date'
      }
    }
  }

  // 6. 个税意图识别 (e.g. "工资15000扣多少税", "1.5w工资交税")
  const taxRegex = /^(?:工资|月薪)?\s*(\d+(\.\d+)?)(?:[wk万])?\s*(?:扣?多少税|交?税)$/
  const taxMatch = q.match(taxRegex)
  if (taxMatch) {
    let salary = parseFloat(taxMatch[1])
    if (q.includes('w') || q.includes('万')) salary *= 10000
    else if (salary < 1000) salary *= 1000 // 简易纠错，如输入15默认为15k
    
    return {
      type: 'module',
      title: '个税计算',
      content: `估算月薪 ${salary} 元的个人所得税`,
      action: {
        label: '去计算',
        route: '/tool/tax',
        params: { salary }
      }
    }
  }

  // 7. 折扣与小费意图识别 (e.g. "1000块打8折", "200块的小费", "1000减200")
  const discountRegex = /^(\d+(\.\d+)?)\s*(?:块|元)?\s*(?:打|打)?\s*(\d+(\.\d+)?)\s*(?:折|折)$/
  const discountMatch = q.match(discountRegex)
  if (discountMatch) {
    const price = parseFloat(discountMatch[1])
    const rate = parseFloat(discountMatch[3])
    const finalRate = (10 - rate) * 10 
    return {
      type: 'module',
      title: '折扣计算',
      content: `${price} 元打 ${rate} 折，省下 ${(price * finalRate / 100).toFixed(2)} 元`,
      action: {
        label: '查看详情',
        route: '/tool/discount',
        params: { price, discount: finalRate, discountType: 'percent' }
      }
    }
  }

  const minusRegex = /^(\d+(\.\d+)?)\s*(?:块|元)?\s*(?:减|减)\s*(\d+(\.\d+)?)\s*(?:块|元)?$/
  const minusMatch = q.match(minusRegex)
  if (minusMatch) {
    const price = parseFloat(minusMatch[1])
    const discount = parseFloat(minusMatch[3])
    return {
      type: 'module',
      title: '满减计算',
      content: `${price} 元减 ${discount} 元，现价 ${(price - discount).toFixed(2)} 元`,
      action: {
        label: '去计算',
        route: '/tool/discount',
        params: { price, discount, discountType: 'amount' }
      }
    }
  }

  const tipRegex = /^(\d+(\.\d+)?)\s*(?:块|元)?\s*(?:的|的)?\s*(\d+(\.\d+)?)\s*(?:%|%)\s*(?:小费|小费)$/
  const tipMatch = q.match(tipRegex)
  if (tipMatch) {
    const price = parseFloat(tipMatch[1])
    const rate = parseFloat(tipMatch[3])
    return {
      type: 'module',
      title: '小费计算',
      content: `${price} 元的 ${rate}% 小费是 ${(price * rate / 100).toFixed(2)} 元`,
      action: {
        label: '去支付',
        route: '/tool/discount',
        params: { price, tip: rate }
      }
    }
  }

  // 8. 健康意图 (e.g. "bmi", "我的bmi是多少", "基础代谢")
  if (q.includes('bmi') || q.includes('健康') || q.includes('体重') || q.includes('肥胖')) {
    return {
      type: 'module',
      title: '健康计算',
      content: '计算您的 BMI 指数和基础代谢率 (BMR)',
      action: {
        label: '立即计算',
        route: '/tool/health'
      }
    }
  }

  // 9. 绘图意图 (e.g. "画图", "函数绘图", "plot x^2")
  const plotRegex = /^(?:画|画图|绘图|绘制|plot)\s*(.*)$/
  const plotMatch = q.match(plotRegex)
  if (plotMatch || q.includes('函数') || q.includes('坐标系')) {
    const expr = plotMatch ? plotMatch[1].trim() : ''
    return {
      type: 'module',
      title: '函数绘图',
      content: expr ? `绘制函数 y = ${expr}` : '打开交互式函数绘图工具',
      action: {
        label: '开始绘图',
        route: '/tool/graph',
        params: expr ? { expression: expr } : undefined
      }
    }
  }

  // 10. 数学表达式 / 单位换算 (利用 mathjs)
  try {
    // 简单数学表达式过滤，避免误触发 (必须包含操作符或 mathjs 函数)
    if (/[\+\-\*\/\^\(\)]|[a-z]{2,}\(/.test(q) || / (to|in) /.test(q)) {
      const result = evaluate(q)
      if (typeof result === 'number' || (typeof result === 'object' && result.type === 'Unit')) {
        const resultStr = result.toString()
        return {
          type: result.type === 'Unit' ? 'unit' : 'math',
          title: result.type === 'Unit' ? '单位换算' : '智能计算',
          content: `${q} = ${resultStr}`,
          action: {
            label: '复制结果',
            route: '',
            params: { copy: resultStr }
          }
        }
      }
    }
  } catch {
    // Ignore math errors
  }

  return null
}
