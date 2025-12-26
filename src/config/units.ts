// 单位换算配置
export interface UnitConfig {
  name: string
  symbol: string
  toBase: number  // 转换到基准单位的系数
}

export interface UnitCategory {
  name: string
  baseUnit: string
  units: UnitConfig[]
}

export const unitConfigs: Record<string, UnitCategory> = {
  length: {
    name: '长度',
    baseUnit: '米',
    units: [
      { name: '千米', symbol: 'km', toBase: 1000 },
      { name: '米', symbol: 'm', toBase: 1 },
      { name: '分米', symbol: 'dm', toBase: 0.1 },
      { name: '厘米', symbol: 'cm', toBase: 0.01 },
      { name: '毫米', symbol: 'mm', toBase: 0.001 },
      { name: '微米', symbol: 'μm', toBase: 0.000001 },
      { name: '纳米', symbol: 'nm', toBase: 0.000000001 },
      { name: '英里', symbol: 'mi', toBase: 1609.344 },
      { name: '码', symbol: 'yd', toBase: 0.9144 },
      { name: '英尺', symbol: 'ft', toBase: 0.3048 },
      { name: '英寸', symbol: 'in', toBase: 0.0254 },
      { name: '海里', symbol: 'nmi', toBase: 1852 },
      { name: '里', symbol: '里', toBase: 500 },
      { name: '丈', symbol: '丈', toBase: 3.333 },
      { name: '尺', symbol: '尺', toBase: 0.333 },
      { name: '寸', symbol: '寸', toBase: 0.0333 },
    ]
  },
  
  area: {
    name: '面积',
    baseUnit: '平方米',
    units: [
      { name: '平方千米', symbol: 'km²', toBase: 1000000 },
      { name: '公顷', symbol: 'ha', toBase: 10000 },
      { name: '平方米', symbol: 'm²', toBase: 1 },
      { name: '平方分米', symbol: 'dm²', toBase: 0.01 },
      { name: '平方厘米', symbol: 'cm²', toBase: 0.0001 },
      { name: '平方毫米', symbol: 'mm²', toBase: 0.000001 },
      { name: '平方英里', symbol: 'mi²', toBase: 2589988.11 },
      { name: '英亩', symbol: 'acre', toBase: 4046.86 },
      { name: '平方码', symbol: 'yd²', toBase: 0.836127 },
      { name: '平方英尺', symbol: 'ft²', toBase: 0.092903 },
      { name: '平方英寸', symbol: 'in²', toBase: 0.00064516 },
      { name: '亩', symbol: '亩', toBase: 666.667 },
      { name: '分', symbol: '分', toBase: 66.667 },
    ]
  },
  
  volume: {
    name: '体积',
    baseUnit: '立方米',
    units: [
      { name: '立方米', symbol: 'm³', toBase: 1 },
      { name: '立方分米', symbol: 'dm³', toBase: 0.001 },
      { name: '立方厘米', symbol: 'cm³', toBase: 0.000001 },
      { name: '立方毫米', symbol: 'mm³', toBase: 0.000000001 },
      { name: '升', symbol: 'L', toBase: 0.001 },
      { name: '毫升', symbol: 'mL', toBase: 0.000001 },
      { name: '加仑(美)', symbol: 'gal', toBase: 0.003785 },
      { name: '加仑(英)', symbol: 'gal(UK)', toBase: 0.004546 },
      { name: '品脱(美)', symbol: 'pt', toBase: 0.000473 },
      { name: '立方英尺', symbol: 'ft³', toBase: 0.028317 },
      { name: '立方英寸', symbol: 'in³', toBase: 0.0000164 },
    ]
  },
  
  weight: {
    name: '重量',
    baseUnit: '千克',
    units: [
      { name: '吨', symbol: 't', toBase: 1000 },
      { name: '千克', symbol: 'kg', toBase: 1 },
      { name: '克', symbol: 'g', toBase: 0.001 },
      { name: '毫克', symbol: 'mg', toBase: 0.000001 },
      { name: '微克', symbol: 'μg', toBase: 0.000000001 },
      { name: '磅', symbol: 'lb', toBase: 0.453592 },
      { name: '盎司', symbol: 'oz', toBase: 0.028349 },
      { name: '克拉', symbol: 'ct', toBase: 0.0002 },
      { name: '斤', symbol: '斤', toBase: 0.5 },
      { name: '两', symbol: '两', toBase: 0.05 },
      { name: '钱', symbol: '钱', toBase: 0.005 },
    ]
  },
  
  temperature: {
    name: '温度',
    baseUnit: '摄氏度',
    units: [
      { name: '摄氏度', symbol: '°C', toBase: 1 },
      { name: '华氏度', symbol: '°F', toBase: 1 },
      { name: '开尔文', symbol: 'K', toBase: 1 },
      { name: '兰氏度', symbol: '°R', toBase: 1 },
      { name: '列氏度', symbol: '°Ré', toBase: 1 },
    ]
  },
  
  speed: {
    name: '速度',
    baseUnit: '米/秒',
    units: [
      { name: '米/秒', symbol: 'm/s', toBase: 1 },
      { name: '千米/时', symbol: 'km/h', toBase: 0.277778 },
      { name: '英里/时', symbol: 'mph', toBase: 0.44704 },
      { name: '节', symbol: 'kn', toBase: 0.514444 },
      { name: '马赫', symbol: 'Ma', toBase: 340.3 },
      { name: '光速', symbol: 'c', toBase: 299792458 },
    ]
  },
  
  time: {
    name: '时间',
    baseUnit: '秒',
    units: [
      { name: '世纪', symbol: '世纪', toBase: 3153600000 },
      { name: '年', symbol: '年', toBase: 31536000 },
      { name: '月', symbol: '月', toBase: 2592000 },
      { name: '周', symbol: '周', toBase: 604800 },
      { name: '天', symbol: '天', toBase: 86400 },
      { name: '小时', symbol: 'h', toBase: 3600 },
      { name: '分钟', symbol: 'min', toBase: 60 },
      { name: '秒', symbol: 's', toBase: 1 },
      { name: '毫秒', symbol: 'ms', toBase: 0.001 },
      { name: '微秒', symbol: 'μs', toBase: 0.000001 },
      { name: '纳秒', symbol: 'ns', toBase: 0.000000001 },
    ]
  },
  
  power: {
    name: '功率',
    baseUnit: '瓦特',
    units: [
      { name: '千瓦', symbol: 'kW', toBase: 1000 },
      { name: '瓦特', symbol: 'W', toBase: 1 },
      { name: '毫瓦', symbol: 'mW', toBase: 0.001 },
      { name: '马力', symbol: 'hp', toBase: 745.7 },
      { name: '公制马力', symbol: 'PS', toBase: 735.5 },
      { name: '千卡/秒', symbol: 'kcal/s', toBase: 4184 },
      { name: '英热单位/秒', symbol: 'BTU/s', toBase: 1055.06 },
    ]
  },
  
  heat: {
    name: '热量',
    baseUnit: '焦耳',
    units: [
      { name: '千焦', symbol: 'kJ', toBase: 1000 },
      { name: '焦耳', symbol: 'J', toBase: 1 },
      { name: '卡路里', symbol: 'cal', toBase: 4.184 },
      { name: '千卡', symbol: 'kcal', toBase: 4184 },
      { name: '瓦时', symbol: 'Wh', toBase: 3600 },
      { name: '千瓦时', symbol: 'kWh', toBase: 3600000 },
      { name: '英热单位', symbol: 'BTU', toBase: 1055.06 },
    ]
  },
  
  force: {
    name: '力',
    baseUnit: '牛顿',
    units: [
      { name: '千牛', symbol: 'kN', toBase: 1000 },
      { name: '牛顿', symbol: 'N', toBase: 1 },
      { name: '达因', symbol: 'dyn', toBase: 0.00001 },
      { name: '千克力', symbol: 'kgf', toBase: 9.80665 },
      { name: '克力', symbol: 'gf', toBase: 0.00980665 },
      { name: '磅力', symbol: 'lbf', toBase: 4.44822 },
    ]
  },
  
  pressure: {
    name: '压强',
    baseUnit: '帕斯卡',
    units: [
      { name: '帕斯卡', symbol: 'Pa', toBase: 1 },
      { name: '百帕', symbol: 'hPa', toBase: 100 },
      { name: '千帕', symbol: 'kPa', toBase: 1000 },
      { name: '兆帕', symbol: 'MPa', toBase: 1000000 },
      { name: '巴', symbol: 'bar', toBase: 100000 },
      { name: '毫巴', symbol: 'mbar', toBase: 100 },
      { name: '标准大气压', symbol: 'atm', toBase: 101325 },
      { name: '毫米汞柱', symbol: 'mmHg', toBase: 133.322 },
      { name: '英寸汞柱', symbol: 'inHg', toBase: 3386.39 },
      { name: '磅力/英尺²', symbol: 'lbf/ft²(psf)', toBase: 47.8803 },
      { name: '磅力/英寸²', symbol: 'lbf/in²(psi)', toBase: 6894.76 },
      { name: '公斤力/厘米²', symbol: 'kgf/cm²', toBase: 98066.5 },
      { name: '公斤力/米²', symbol: 'kgf/m²', toBase: 9.80665 },
      { name: '毫米水柱', symbol: 'mmH₂O', toBase: 9.80665 },
      { name: '托', symbol: 'Torr', toBase: 133.322 },
    ]
  },
  
  capacity: {
    name: '容量',
    baseUnit: '升',
    units: [
      { name: '千升', symbol: 'kL', toBase: 1000 },
      { name: '升', symbol: 'L', toBase: 1 },
      { name: '分升', symbol: 'dL', toBase: 0.1 },
      { name: '厘升', symbol: 'cL', toBase: 0.01 },
      { name: '毫升', symbol: 'mL', toBase: 0.001 },
      { name: '加仑(美)', symbol: 'gal', toBase: 3.78541 },
      { name: '加仑(英)', symbol: 'gal(UK)', toBase: 4.54609 },
      { name: '夸脱(美)', symbol: 'qt', toBase: 0.946353 },
      { name: '品脱(美)', symbol: 'pt', toBase: 0.473176 },
      { name: '杯', symbol: 'cup', toBase: 0.236588 },
      { name: '液量盎司', symbol: 'fl oz', toBase: 0.0295735 },
    ]
  },

  data: {
    name: '数据存储',
    baseUnit: '字节',
    units: [
      { name: '比特', symbol: 'bit', toBase: 0.125 },
      { name: '字节', symbol: 'B', toBase: 1 },
      { name: '千字节', symbol: 'KB', toBase: 1024 },
      { name: '兆字节', symbol: 'MB', toBase: 1048576 },
      { name: '吉字节', symbol: 'GB', toBase: 1073741824 },
      { name: '太字节', symbol: 'TB', toBase: 1099511627776 },
      { name: '拍字节', symbol: 'PB', toBase: 1125899906842624 },
      { name: '千比特', symbol: 'Kbit', toBase: 128 },
      { name: '兆比特', symbol: 'Mbit', toBase: 131072 },
      { name: '吉比特', symbol: 'Gbit', toBase: 134217728 },
    ]
  },
}

// 温度特殊转换
export const convertTemperature = (value: number, from: string, to: string): number => {
  // 先转换到摄氏度
  let celsius: number
  switch (from) {
    case '°C': celsius = value; break
    case '°F': celsius = (value - 32) * 5 / 9; break
    case 'K': celsius = value - 273.15; break
    case '°R': celsius = (value - 491.67) * 5 / 9; break  // 兰氏度转摄氏度
    case '°Ré': celsius = value * 5 / 4; break  // 列氏度转摄氏度
    default: celsius = value
  }
  
  // 从摄氏度转换到目标单位
  switch (to) {
    case '°C': return celsius
    case '°F': return celsius * 9 / 5 + 32
    case 'K': return celsius + 273.15
    case '°R': return celsius * 9 / 5 + 491.67  // 摄氏度转兰氏度
    case '°Ré': return celsius * 4 / 5  // 摄氏度转列氏度
    default: return celsius
  }
}
