import { evaluate } from 'mathjs'

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

const defaultCurrencies = {
  CNY: { code: 'CNY', name: '人民币', rate: 1 },
  USD: { code: 'USD', name: '美元', rate: 7.24 },
  EUR: { code: 'EUR', name: '欧元', rate: 7.86 },
  GBP: { code: 'GBP', name: '英镑', rate: 9.18 },
  JPY: { code: 'JPY', name: '日元', rate: 0.048 },
  HKD: { code: 'HKD', name: '港币', rate: 0.93 }
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[？?！!，,。.\s]/g, '')
}

function formatDate(date: Date) {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`
}

function mapCurrencyName(value: string) {
  const normalized = value.toUpperCase()
  if (['人民币', 'CNY', 'RMB'].includes(normalized)) return defaultCurrencies.CNY
  if (['美元', 'USD'].includes(normalized)) return defaultCurrencies.USD
  if (['欧元', 'EUR'].includes(normalized)) return defaultCurrencies.EUR
  if (['英镑', 'GBP'].includes(normalized)) return defaultCurrencies.GBP
  if (['日元', 'JPY'].includes(normalized)) return defaultCurrencies.JPY
  if (['港币', 'HKD'].includes(normalized)) return defaultCurrencies.HKD
  return null
}

export const getSmartResult = (query: string): SmartResult | null => {
  if (!query.trim()) return null

  const raw = query.trim()
  const q = raw.toLowerCase()
  const normalized = normalizeText(raw)

  const dateMatch = normalized.match(/^(?:(\d{4})年(\d{1,2})月(\d{1,2})日)?(\d+)天后(是)?(哪天|几号|星期几)?$/)
  if (dateMatch) {
    const baseDate = dateMatch[1]
      ? new Date(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]))
      : new Date()
    const days = Number(dateMatch[4])
    const targetDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000)

    return {
      type: 'math',
      title: '日期推算',
      content: `${days}天后是 ${formatDate(targetDate)}`,
      action: {
        label: '打开日期计算',
        route: '/tool/date'
      }
    }
  }

  const taxMatch = normalized.match(/^(工资|月薪)?(\d+(?:\.\d+)?)(w|万|k|千)?(扣多少税|交多少税|个税多少|税多少)$/)
  if (taxMatch) {
    let salary = Number(taxMatch[2])
    const unit = taxMatch[3]
    if (unit === 'w' || unit === '万') salary *= 10000
    if (unit === 'k' || unit === '千') salary *= 1000

    const taxableIncome = Math.max(0, salary - 5000)
    const tax = taxableIncome <= 3000
      ? taxableIncome * 0.03
      : taxableIncome <= 12000
        ? taxableIncome * 0.1 - 210
        : taxableIncome <= 25000
          ? taxableIncome * 0.2 - 1410
          : taxableIncome * 0.25 - 2660
    const afterTax = salary - Math.max(0, tax)

    return {
      type: 'math',
      title: '个税估算',
      content: `税前约 ${salary.toFixed(2)} 元，个税约 ${Math.max(0, tax).toFixed(2)} 元，到手约 ${afterTax.toFixed(2)} 元`,
      action: {
        label: '打开个税计算',
        route: '/tool/tax',
        params: { salary }
      }
    }
  }

  const uppercaseMatch = normalized.match(/^(金额转大写|大写金额|大写)(\d+(?:\.\d+)?)?$/)
  if (uppercaseMatch) {
    const amount = uppercaseMatch[2]
    return {
      type: 'module',
      title: '金额大写',
      content: amount ? `将 ${amount} 转换为人民币大写` : '打开金额大写工具',
      action: {
        label: '打开金额大写',
        route: '/tool/uppercase',
        params: amount ? { amount } : undefined
      }
    }
  }

  const currencyMatch = q.match(/^(\d+(?:\.\d+)?)\s*(人民币|cny|rmb|美元|usd|欧元|eur|英镑|gbp|日元|jpy|港币|hkd)\s*(?:to|换算|兑换|等于)?\s*(人民币|cny|rmb|美元|usd|欧元|eur|英镑|gbp|日元|jpy|港币|hkd)?$/i)
  if (currencyMatch) {
    const amount = Number(currencyMatch[1])
    const from = mapCurrencyName(currencyMatch[2])
    const to = mapCurrencyName(currencyMatch[3] || (from?.code === 'CNY' ? 'USD' : 'CNY'))

    if (from && to) {
      const result = (amount * from.rate / to.rate).toFixed(2)
      return {
        type: 'currency',
        title: '汇率换算',
        content: `${amount} ${from.name} ≈ ${result} ${to.name}`,
        action: {
          label: '打开汇率换算',
          route: '/tool/currency',
          params: { from: from.code, to: to.code, amount }
        }
      }
    }
  }

  if (/(cm|mm|km|m)\s*(to|in)\s*(cm|mm|km|m)/i.test(q)) {
    try {
      const result = evaluate(q)
      return {
        type: 'unit',
        title: '单位换算',
        content: `${raw} = ${result.toString()}`,
        action: {
          label: '复制结果',
          route: '',
          params: { copy: result.toString() }
        }
      }
    } catch {
      return {
        type: 'module',
        title: '单位换算',
        content: '打开单位换算工具继续计算',
        action: {
          label: '打开单位换算',
          route: '/converter/length'
        }
      }
    }
  }

  if (/^[\d+\-*/().%\s]+$/.test(raw)) {
    try {
      const result = evaluate(raw)
      return {
        type: 'math',
        title: '计算结果',
        content: `${raw} = ${result}`,
        action: {
          label: '复制结果',
          route: '',
          params: { copy: String(result) }
        }
      }
    } catch {
      // ignore
    }
  }

  if (normalized.includes('房贷') || normalized.includes('月供') || normalized.includes('按揭')) {
    return {
      type: 'module',
      title: '房贷计算',
      content: '打开房贷计算工具，继续输入贷款金额、利率和年限',
      action: {
        label: '打开房贷计算',
        route: '/tool/mortgage'
      }
    }
  }

  if (normalized.includes('个税') || normalized.includes('工资')) {
    return {
      type: 'module',
      title: '个税计算',
      content: '打开个税计算工具，继续完善工资与专项扣除',
      action: {
        label: '打开个税计算',
        route: '/tool/tax'
      }
    }
  }

  if (normalized.includes('日期') || normalized.includes('天后') || normalized.includes('星期几')) {
    return {
      type: 'module',
      title: '日期计算',
      content: '打开日期计算工具，继续做日期推算',
      action: {
        label: '打开日期计算',
        route: '/tool/date'
      }
    }
  }

  return null
}
