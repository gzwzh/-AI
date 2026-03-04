export interface ModuleItem {
  id: string
  name: string
  icon: string
  route: string
  category: 'calculator' | 'converter' | 'tool'
}

export interface ModuleCategory {
  id: string
  name: string
  modules: ModuleItem[]
}

const calculatorModules: ModuleItem[] = [
  { id: 'basic', name: '基础计算器', icon: 'calculator', route: '/calculator/basic', category: 'calculator' },
  { id: 'scientific', name: '科学计算器', icon: 'scientific', route: '/calculator/scientific', category: 'calculator' },
  { id: 'fraction', name: '分数计算器', icon: 'fraction', route: '/calculator/fraction', category: 'calculator' },
]

const toolModules: ModuleItem[] = [
  { id: 'currency', name: '汇率换算', icon: 'currency', route: '/tool/currency', category: 'tool' },
  { id: 'relative', name: '亲戚称呼', icon: 'relative', route: '/tool/relative', category: 'tool' },
  { id: 'mortgage', name: '房贷计算', icon: 'mortgage', route: '/tool/mortgage', category: 'tool' },
  { id: 'tax', name: '个税计算', icon: 'tax', route: '/tool/tax', category: 'tool' },
  { id: 'date', name: '日期计算', icon: 'date', route: '/tool/date', category: 'tool' },
  { id: 'radix', name: '进制转换', icon: 'radix', route: '/tool/radix', category: 'tool' },
  { id: 'uppercase', name: '大写金额', icon: 'uppercase', route: '/tool/uppercase', category: 'tool' },
  { id: 'finance', name: '理财计算', icon: 'finance', route: '/tool/finance', category: 'tool' },
  { id: 'formula', name: '万能公式', icon: 'formula', route: '/tool/formula', category: 'tool' },
  { id: 'account', name: '记账本', icon: 'account', route: '/tool/account', category: 'tool' },
  { id: 'memo', name: '备忘录', icon: 'memo', route: '/tool/memo', category: 'tool' },
]

const converterModules: ModuleItem[] = [
  { id: 'length', name: '长度转换', icon: 'length', route: '/converter/length', category: 'converter' },
  { id: 'area', name: '面积转换', icon: 'area', route: '/converter/area', category: 'converter' },
  { id: 'volume', name: '体积转换', icon: 'volume', route: '/converter/volume', category: 'converter' },
  { id: 'temperature', name: '温度转换', icon: 'temperature', route: '/converter/temperature', category: 'converter' },
  { id: 'speed', name: '速度转换', icon: 'speed', route: '/converter/speed', category: 'converter' },
  { id: 'time', name: '时间转换', icon: 'time', route: '/converter/time', category: 'converter' },
  { id: 'weight', name: '重量转换', icon: 'weight', route: '/converter/weight', category: 'converter' },
  { id: 'power', name: '功率转换', icon: 'power', route: '/converter/power', category: 'converter' },
  { id: 'heat', name: '热量转换', icon: 'heat', route: '/converter/heat', category: 'converter' },
  { id: 'force', name: '力转换', icon: 'force', route: '/converter/force', category: 'converter' },
  { id: 'pressure', name: '压强转换', icon: 'pressure', route: '/converter/pressure', category: 'converter' },
  { id: 'capacity', name: '容量转换', icon: 'capacity', route: '/converter/capacity', category: 'converter' },
  { id: 'data', name: '数据存储', icon: 'data', route: '/converter/data', category: 'converter' },
]

export const moduleCategories: ModuleCategory[] = [
  { id: 'calculator', name: '计算器', modules: calculatorModules },
  { id: 'tool', name: '实用工具', modules: toolModules },
  { id: 'converter', name: '单位换算', modules: converterModules },
]

export const allModules: ModuleItem[] = [
  ...calculatorModules,
  ...toolModules,
  ...converterModules,
]
