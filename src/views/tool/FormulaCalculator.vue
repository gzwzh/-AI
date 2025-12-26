<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()

interface Formula {
  id: string
  name: string
  category: string
  formula: string
  description: string
  variables: { name: string; label: string; default: number }[]
  calculate: (vars: Record<string, number>) => number
  unit: string
}

const formulas: Formula[] = [
  // 几何公式
  {
    id: 'circle_area',
    name: '圆面积',
    category: '几何',
    formula: 'S = πr²',
    description: '已知半径求圆的面积',
    variables: [{ name: 'r', label: '半径', default: 1 }],
    calculate: (v) => Math.PI * v.r * v.r,
    unit: ''
  },
  {
    id: 'circle_perimeter',
    name: '圆周长',
    category: '几何',
    formula: 'C = 2πr',
    description: '已知半径求圆的周长',
    variables: [{ name: 'r', label: '半径', default: 1 }],
    calculate: (v) => 2 * Math.PI * v.r,
    unit: ''
  },
  {
    id: 'sphere_volume',
    name: '球体积',
    category: '几何',
    formula: 'V = 4/3πr³',
    description: '已知半径求球的体积',
    variables: [{ name: 'r', label: '半径', default: 1 }],
    calculate: (v) => (4 / 3) * Math.PI * Math.pow(v.r, 3),
    unit: ''
  },
  {
    id: 'triangle_area',
    name: '三角形面积',
    category: '几何',
    formula: 'S = ½ah',
    description: '已知底和高求三角形面积',
    variables: [
      { name: 'a', label: '底边', default: 1 },
      { name: 'h', label: '高', default: 1 }
    ],
    calculate: (v) => 0.5 * v.a * v.h,
    unit: ''
  },
  {
    id: 'trapezoid_area',
    name: '梯形面积',
    category: '几何',
    formula: 'S = ½(a+b)h',
    description: '已知上底、下底和高求梯形面积',
    variables: [
      { name: 'a', label: '上底', default: 1 },
      { name: 'b', label: '下底', default: 2 },
      { name: 'h', label: '高', default: 1 }
    ],
    calculate: (v) => 0.5 * (v.a + v.b) * v.h,
    unit: ''
  },
  {
    id: 'cylinder_volume',
    name: '圆柱体积',
    category: '几何',
    formula: 'V = πr²h',
    description: '已知底面半径和高求圆柱体积',
    variables: [
      { name: 'r', label: '底面半径', default: 1 },
      { name: 'h', label: '高', default: 1 }
    ],
    calculate: (v) => Math.PI * v.r * v.r * v.h,
    unit: ''
  },
  {
    id: 'cone_volume',
    name: '圆锥体积',
    category: '几何',
    formula: 'V = ⅓πr²h',
    description: '已知底面半径和高求圆锥体积',
    variables: [
      { name: 'r', label: '底面半径', default: 1 },
      { name: 'h', label: '高', default: 1 }
    ],
    calculate: (v) => (1 / 3) * Math.PI * v.r * v.r * v.h,
    unit: ''
  },
  // 物理公式
  {
    id: 'speed',
    name: '速度公式',
    category: '物理',
    formula: 'v = s/t',
    description: '已知路程和时间求速度',
    variables: [
      { name: 's', label: '路程', default: 100 },
      { name: 't', label: '时间', default: 10 }
    ],
    calculate: (v) => v.s / v.t,
    unit: ''
  },
  {
    id: 'acceleration',
    name: '加速度公式',
    category: '物理',
    formula: 'a = (v-v₀)/t',
    description: '已知初速度、末速度和时间求加速度',
    variables: [
      { name: 'v0', label: '初速度', default: 0 },
      { name: 'v', label: '末速度', default: 10 },
      { name: 't', label: '时间', default: 5 }
    ],
    calculate: (v) => (v.v - v.v0) / v.t,
    unit: 'm/s²'
  },
  {
    id: 'force',
    name: '牛顿第二定律',
    category: '物理',
    formula: 'F = ma',
    description: '已知质量和加速度求力',
    variables: [
      { name: 'm', label: '质量(kg)', default: 1 },
      { name: 'a', label: '加速度(m/s²)', default: 10 }
    ],
    calculate: (v) => v.m * v.a,
    unit: 'N'
  },
  {
    id: 'kinetic_energy',
    name: '动能公式',
    category: '物理',
    formula: 'Ek = ½mv²',
    description: '已知质量和速度求动能',
    variables: [
      { name: 'm', label: '质量(kg)', default: 1 },
      { name: 'v', label: '速度(m/s)', default: 10 }
    ],
    calculate: (v) => 0.5 * v.m * v.v * v.v,
    unit: 'J'
  },
  {
    id: 'potential_energy',
    name: '重力势能',
    category: '物理',
    formula: 'Ep = mgh',
    description: '已知质量、重力加速度和高度求势能',
    variables: [
      { name: 'm', label: '质量(kg)', default: 1 },
      { name: 'g', label: '重力加速度', default: 9.8 },
      { name: 'h', label: '高度(m)', default: 10 }
    ],
    calculate: (v) => v.m * v.g * v.h,
    unit: 'J'
  },
  {
    id: 'ohm_law',
    name: '欧姆定律',
    category: '物理',
    formula: 'I = U/R',
    description: '已知电压和电阻求电流',
    variables: [
      { name: 'U', label: '电压(V)', default: 220 },
      { name: 'R', label: '电阻(Ω)', default: 100 }
    ],
    calculate: (v) => v.U / v.R,
    unit: 'A'
  },
  {
    id: 'power_electric',
    name: '电功率',
    category: '物理',
    formula: 'P = UI',
    description: '已知电压和电流求功率',
    variables: [
      { name: 'U', label: '电压(V)', default: 220 },
      { name: 'I', label: '电流(A)', default: 1 }
    ],
    calculate: (v) => v.U * v.I,
    unit: 'W'
  },
  // 数学公式
  {
    id: 'pythagorean',
    name: '勾股定理',
    category: '数学',
    formula: 'c = √(a²+b²)',
    description: '已知两直角边求斜边',
    variables: [
      { name: 'a', label: '直角边a', default: 3 },
      { name: 'b', label: '直角边b', default: 4 }
    ],
    calculate: (v) => Math.sqrt(v.a * v.a + v.b * v.b),
    unit: ''
  },
  {
    id: 'quadratic',
    name: '一元二次方程求根',
    category: '数学',
    formula: 'x = (-b±√Δ)/2a',
    description: 'ax²+bx+c=0 的判别式',
    variables: [
      { name: 'a', label: 'a', default: 1 },
      { name: 'b', label: 'b', default: -5 },
      { name: 'c', label: 'c', default: 6 }
    ],
    calculate: (v) => v.b * v.b - 4 * v.a * v.c,
    unit: '(Δ值)'
  },
  {
    id: 'compound_interest',
    name: '复利公式',
    category: '金融',
    formula: 'A = P(1+r)ⁿ',
    description: '已知本金、利率和期数求本息和',
    variables: [
      { name: 'P', label: '本金', default: 10000 },
      { name: 'r', label: '利率(%)', default: 5 },
      { name: 'n', label: '期数(年)', default: 10 }
    ],
    calculate: (v) => v.P * Math.pow(1 + v.r / 100, v.n),
    unit: '元'
  },
  {
    id: 'bmi',
    name: 'BMI指数',
    category: '健康',
    formula: 'BMI = 体重/身高²',
    description: '已知体重(kg)和身高(m)求BMI',
    variables: [
      { name: 'weight', label: '体重(kg)', default: 65 },
      { name: 'height', label: '身高(m)', default: 1.7 }
    ],
    calculate: (v) => v.weight / (v.height * v.height),
    unit: ''
  },
]

const categories = [...new Set(formulas.map(f => f.category))]
const selectedCategory = ref('全部')
const selectedFormula = ref<Formula | null>(null)
const variables = ref<Record<string, number>>({})
const result = ref<number | null>(null)

const filteredFormulas = computed(() => {
  if (selectedCategory.value === '全部') return formulas
  return formulas.filter(f => f.category === selectedCategory.value)
})

const selectFormula = (formula: Formula) => {
  selectedFormula.value = formula
  variables.value = {}
  formula.variables.forEach(v => {
    variables.value[v.name] = v.default
  })
  calculate()
}

const calculate = () => {
  if (!selectedFormula.value) return
  try {
    result.value = selectedFormula.value.calculate(variables.value)
  } catch {
    result.value = null
  }
}

const formatResult = (num: number) => {
  if (Math.abs(num) < 0.000001 || Math.abs(num) > 999999999) {
    return num.toExponential(6)
  }
  return parseFloat(num.toPrecision(10)).toString()
}
</script>

<template>
  <div class="tool-page">
    <header class="header">
      <button class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="title">万能公式</h1>
      <ThemeToggle />
    </header>
    
    <main class="tool-content">
      <!-- 分类选择 -->
      <div class="category-tabs">
        <button 
          :class="{ active: selectedCategory === '全部' }"
          @click="selectedCategory = '全部'"
        >
          全部
        </button>
        <button 
          v-for="cat in categories" 
          :key="cat"
          :class="{ active: selectedCategory === cat }"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
      
      <!-- 公式列表 -->
      <div class="formula-list" v-if="!selectedFormula">
        <div 
          v-for="f in filteredFormulas" 
          :key="f.id"
          class="formula-item"
          @click="selectFormula(f)"
        >
          <div class="formula-name">{{ f.name }}</div>
          <div class="formula-expr">{{ f.formula }}</div>
        </div>
      </div>
      
      <!-- 公式计算 -->
      <div class="formula-calc" v-else>
        <button class="back-to-list" @click="selectedFormula = null">
          ← 返回列表
        </button>
        
        <div class="formula-header">
          <h3>{{ selectedFormula.name }}</h3>
          <div class="formula-display">{{ selectedFormula.formula }}</div>
          <p class="formula-desc">{{ selectedFormula.description }}</p>
        </div>
        
        <div class="variables-input">
          <div 
            v-for="v in selectedFormula.variables" 
            :key="v.name"
            class="var-item"
          >
            <label>{{ v.label }}</label>
            <input 
              type="number" 
              v-model.number="variables[v.name]"
              @input="calculate"
            />
          </div>
        </div>
        
        <div class="result-area" v-if="result !== null">
          <div class="result-label">计算结果</div>
          <div class="result-value">
            {{ formatResult(result) }}
            <span class="unit" v-if="selectedFormula.unit">{{ selectedFormula.unit }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.tool-page {
  height: 100vh;
  background: var(--bg);
  padding: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: var(--card-bg);
  color: var(--text);
  cursor: pointer;
  &:hover { background: var(--hover); }
  svg { width: 18px; height: 18px; }
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
}

.tool-content {
  flex: 1;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
  background: var(--card-bg);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 20px var(--shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
  flex-shrink: 0;
  
  button {
    padding: 8px 14px;
    border: none;
    border-radius: 16px;
    background: var(--bg);
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    
    &.active {
      background: var(--primary-color);
      color: white;
    }
  }
}

.formula-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
}

.formula-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: var(--bg);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  
  &:hover {
    background: var(--hover);
    transform: translateX(4px);
  }
  
  .formula-name {
    font-size: 15px;
    font-weight: 500;
    color: var(--text);
  }
  
  .formula-expr {
    font-size: 14px;
    color: var(--primary-color);
    font-family: 'Times New Roman', serif;
  }
}

.formula-calc {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  
  .back-to-list {
    padding: 8px 14px;
    margin-bottom: 12px;
    border: none;
    border-radius: 6px;
    background: var(--bg);
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
    flex-shrink: 0;
    align-self: flex-start;
    
    &:hover {
      color: var(--primary-color);
    }
  }
}

.formula-header {
  text-align: center;
  margin-bottom: 16px;
  flex-shrink: 0;
  
  h3 {
    font-size: 18px;
    color: var(--text);
    margin-bottom: 8px;
  }
  
  .formula-display {
    font-size: 22px;
    color: var(--primary-color);
    font-family: 'Times New Roman', serif;
    margin-bottom: 6px;
  }
  
  .formula-desc {
    font-size: 14px;
    color: var(--text-secondary);
  }
}

.variables-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.var-item {
  display: flex;
  align-items: center;
  gap: 12px;
  
  label {
    flex: 1;
    font-size: 15px;
    color: var(--text);
  }
  
  input {
    width: 110px;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg);
    color: var(--text);
    font-size: 15px;
    text-align: right;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
}

.result-area {
  padding: 18px;
  background: var(--bg);
  border-radius: 10px;
  text-align: center;
  flex-shrink: 0;
  
  .result-label {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }
  
  .result-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--primary-color);
    
    .unit {
      font-size: 15px;
      color: var(--text-secondary);
      margin-left: 6px;
    }
  }
}
</style>
