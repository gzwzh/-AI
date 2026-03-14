export interface ModuleItem {
  id: string
  icon: string
  route: string
  category: 'calculator' | 'converter' | 'tool'
}

export interface ModuleCategory {
  id: string
  modules: ModuleItem[]
}

const calculatorModules: ModuleItem[] = [
  { id: 'basic', icon: 'calculator', route: '/calculator/basic', category: 'calculator' },
  { id: 'scientific', icon: 'scientific', route: '/calculator/scientific', category: 'calculator' },
  { id: 'fraction', icon: 'fraction', route: '/calculator/fraction', category: 'calculator' },
]

const toolModules: ModuleItem[] = [
  { id: 'currency', icon: 'currency', route: '/tool/currency', category: 'tool' },
  { id: 'relative', icon: 'relative', route: '/tool/relative', category: 'tool' },
  { id: 'mortgage', icon: 'mortgage', route: '/tool/mortgage', category: 'tool' },
  { id: 'tax', icon: 'tax', route: '/tool/tax', category: 'tool' },
  { id: 'date', icon: 'date', route: '/tool/date', category: 'tool' },
  { id: 'radix', icon: 'radix', route: '/tool/radix', category: 'tool' },
  { id: 'uppercase', icon: 'uppercase', route: '/tool/uppercase', category: 'tool' },
  { id: 'finance', icon: 'finance', route: '/tool/finance', category: 'tool' },
  { id: 'formula', icon: 'formula', route: '/tool/formula', category: 'tool' },
  { id: 'discount', icon: 'discount', route: '/tool/discount', category: 'tool' },
  { id: 'account', icon: 'account', route: '/tool/account', category: 'tool' },
  { id: 'memo', icon: 'memo', route: '/tool/memo', category: 'tool' },
  { id: 'health', icon: 'health', route: '/tool/health', category: 'tool' },
  { id: 'graph', icon: 'graph', route: '/tool/graph', category: 'tool' },
]

const converterModules: ModuleItem[] = [
  { id: 'length', icon: 'length', route: '/converter/length', category: 'converter' },
  { id: 'area', icon: 'area', route: '/converter/area', category: 'converter' },
  { id: 'volume', icon: 'volume', route: '/converter/volume', category: 'converter' },
  { id: 'temperature', icon: 'temperature', route: '/converter/temperature', category: 'converter' },
  { id: 'speed', icon: 'speed', route: '/converter/speed', category: 'converter' },
  { id: 'time', icon: 'time', route: '/converter/time', category: 'converter' },
  { id: 'weight', icon: 'weight', route: '/converter/weight', category: 'converter' },
  { id: 'power', icon: 'power', route: '/converter/power', category: 'converter' },
  { id: 'heat', icon: 'heat', route: '/converter/heat', category: 'converter' },
  { id: 'force', icon: 'force', route: '/converter/force', category: 'converter' },
  { id: 'pressure', icon: 'pressure', route: '/converter/pressure', category: 'converter' },
  { id: 'capacity', icon: 'capacity', route: '/converter/capacity', category: 'converter' },
  { id: 'data', icon: 'data', route: '/converter/data', category: 'converter' },
]

export const moduleCategories: ModuleCategory[] = [
  { id: 'calculator', modules: calculatorModules },
  { id: 'tool', modules: toolModules },
  { id: 'converter', modules: converterModules },
]

export const allModules: ModuleItem[] = [
  ...calculatorModules,
  ...toolModules,
  ...converterModules,
]
