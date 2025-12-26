<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()

// 带分数结构：整数部分 + 分子/分母
interface MixedFraction {
  whole: number      // 整数部分
  numerator: number  // 分子
  denominator: number // 分母
}

const fraction1 = ref<MixedFraction>({ whole: 0, numerator: 0, denominator: 1 })
const fraction2 = ref<MixedFraction>({ whole: 0, numerator: 0, denominator: 1 })
const result = ref<MixedFraction>({ whole: 0, numerator: 0, denominator: 1 })
const operator = ref<'+' | '-' | '×' | '÷'>('+')
const activeInput = ref<'w1' | 'n1' | 'd1' | 'w2' | 'n2' | 'd2'>('n1')
const hasCalculated = ref(false)

// 最大公约数
const gcd = (a: number, b: number): number => {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

// 带分数转假分数
const toImproper = (f: MixedFraction): { num: number; den: number } => {
  const sign = f.whole < 0 ? -1 : 1
  const absWhole = Math.abs(f.whole)
  const num = sign * (absWhole * f.denominator + f.numerator)
  return { num, den: f.denominator }
}

// 假分数转带分数（约分后）
const toMixed = (num: number, den: number): MixedFraction => {
  if (den === 0) return { whole: 0, numerator: 0, denominator: 1 }
  
  // 约分
  const g = gcd(num, den)
  num = num / g
  den = den / g
  
  // 确保分母为正
  if (den < 0) {
    num = -num
    den = -den
  }
  
  const sign = num < 0 ? -1 : 1
  num = Math.abs(num)
  
  const whole = sign * Math.floor(num / den)
  const remainder = num % den
  
  return { whole, numerator: remainder, denominator: den }
}

// 计算
const calculate = () => {
  const f1 = toImproper(fraction1.value)
  const f2 = toImproper(fraction2.value)
  
  if (f1.den === 0 || f2.den === 0) {
    result.value = { whole: 0, numerator: 0, denominator: 1 }
    hasCalculated.value = true
    return
  }
  
  let resNum = 0
  let resDen = 1
  
  switch (operator.value) {
    case '+':
      resNum = f1.num * f2.den + f2.num * f1.den
      resDen = f1.den * f2.den
      break
    case '-':
      resNum = f1.num * f2.den - f2.num * f1.den
      resDen = f1.den * f2.den
      break
    case '×':
      resNum = f1.num * f2.num
      resDen = f1.den * f2.den
      break
    case '÷':
      if (f2.num === 0) {
        result.value = { whole: 0, numerator: 0, denominator: 1 }
        hasCalculated.value = true
        return
      }
      resNum = f1.num * f2.den
      resDen = f1.den * f2.num
      break
  }
  
  result.value = toMixed(resNum, resDen)
  hasCalculated.value = true
}

// 转换为小数
const toDecimal = computed(() => {
  const f = toImproper(result.value)
  if (f.den === 0) return '0'
  return (f.num / f.den).toFixed(6).replace(/\.?0+$/, '')
})

const inputDigit = (digit: string) => {
  const key = activeInput.value
  const isFirst = key.endsWith('1')
  const fraction = isFirst ? fraction1 : fraction2
  const field = key.startsWith('w') ? 'whole' : key.startsWith('n') ? 'numerator' : 'denominator'
  
  const current = Math.abs(fraction.value[field])
  const newValue = current * 10 + parseInt(digit)
  
  if (newValue <= 9999) {
    const sign = fraction.value[field] < 0 ? -1 : 1
    fraction.value[field] = newValue * (field === 'whole' ? sign : 1)
  }
  
  hasCalculated.value = false
}

const toggleSign = () => {
  const key = activeInput.value
  const isFirst = key.endsWith('1')
  const fraction = isFirst ? fraction1 : fraction2
  fraction.value.whole = -fraction.value.whole
  hasCalculated.value = false
}

const backspace = () => {
  const key = activeInput.value
  const isFirst = key.endsWith('1')
  const fraction = isFirst ? fraction1 : fraction2
  const field = key.startsWith('w') ? 'whole' : key.startsWith('n') ? 'numerator' : 'denominator'
  
  const sign = fraction.value[field] < 0 ? -1 : 1
  const newValue = Math.floor(Math.abs(fraction.value[field]) / 10)
  fraction.value[field] = newValue * (field === 'whole' ? sign : 1)
  hasCalculated.value = false
}

const clear = () => {
  fraction1.value = { whole: 0, numerator: 0, denominator: 1 }
  fraction2.value = { whole: 0, numerator: 0, denominator: 1 }
  result.value = { whole: 0, numerator: 0, denominator: 1 }
  hasCalculated.value = false
  activeInput.value = 'n1'
}

const setOperator = (op: '+' | '-' | '×' | '÷') => {
  operator.value = op
  hasCalculated.value = false
}

const buttons = [
  ['7', '8', '9', 'C'],
  ['4', '5', '6', '⌫'],
  ['1', '2', '3', '±'],
  ['0', '', '', '='],
]
</script>

<template>
  <div class="calculator-page">
    <header class="header">
      <button class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="title">分数计算器</h1>
      <ThemeToggle />
    </header>
    
    <main class="calculator">
      <!-- 分数输入区 -->
      <div class="fraction-area">
        <!-- 第一个分数 -->
        <div class="mixed-fraction">
          <div 
            class="whole-part"
            :class="{ active: activeInput === 'w1' }"
            @click="activeInput = 'w1'"
          >
            {{ fraction1.whole || '' }}
          </div>
          <div class="fraction-part">
            <div 
              class="numerator"
              :class="{ active: activeInput === 'n1' }"
              @click="activeInput = 'n1'"
            >
              {{ fraction1.numerator }}
            </div>
            <div class="fraction-line"></div>
            <div 
              class="denominator"
              :class="{ active: activeInput === 'd1' }"
              @click="activeInput = 'd1'"
            >
              {{ fraction1.denominator }}
            </div>
          </div>
        </div>
        
        <!-- 运算符 -->
        <div class="operator-group">
          <button :class="{ active: operator === '+' }" @click="setOperator('+')">+</button>
          <button :class="{ active: operator === '-' }" @click="setOperator('-')">-</button>
          <button :class="{ active: operator === '×' }" @click="setOperator('×')">×</button>
          <button :class="{ active: operator === '÷' }" @click="setOperator('÷')">÷</button>
        </div>
        
        <!-- 第二个分数 -->
        <div class="mixed-fraction">
          <div 
            class="whole-part"
            :class="{ active: activeInput === 'w2' }"
            @click="activeInput = 'w2'"
          >
            {{ fraction2.whole || '' }}
          </div>
          <div class="fraction-part">
            <div 
              class="numerator"
              :class="{ active: activeInput === 'n2' }"
              @click="activeInput = 'n2'"
            >
              {{ fraction2.numerator }}
            </div>
            <div class="fraction-line"></div>
            <div 
              class="denominator"
              :class="{ active: activeInput === 'd2' }"
              @click="activeInput = 'd2'"
            >
              {{ fraction2.denominator }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 结果显示 -->
      <div class="result-area" v-if="hasCalculated">
        <span class="equals">=</span>
        <div class="mixed-fraction result">
          <div class="whole-part" v-if="result.whole !== 0">
            {{ result.whole }}
          </div>
          <div class="fraction-part" v-if="result.numerator !== 0 || result.whole === 0">
            <div class="numerator">{{ result.numerator }}</div>
            <div class="fraction-line"></div>
            <div class="denominator">{{ result.denominator }}</div>
          </div>
        </div>
        <span class="decimal">≈ {{ toDecimal }}</span>
      </div>
      
      <!-- 数字键盘 -->
      <div class="keypad">
        <div v-for="(row, i) in buttons" :key="i" class="row">
          <button
            v-for="btn in row"
            :key="btn"
            class="key"
            :class="{
              number: /[0-9]/.test(btn),
              function: ['C', '⌫', '±'].includes(btn),
              equals: btn === '='
            }"
            @click="
              /[0-9]/.test(btn) ? inputDigit(btn) :
              btn === 'C' ? clear() :
              btn === '⌫' ? backspace() :
              btn === '±' ? toggleSign() :
              btn === '=' ? calculate() : null
            "
          >
            {{ btn }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.calculator-page {
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

.calculator {
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

.fraction-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 12px;
  background: var(--bg);
  border-radius: 10px;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.mixed-fraction {
  display: flex;
  align-items: center;
  gap: 6px;
}

.whole-part {
  min-width: 36px;
  min-height: 52px;
  padding: 8px;
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
  border: 2px solid var(--border);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--text-secondary);
  }
  
  &.active {
    border-color: var(--primary-color);
    background: rgba(74, 144, 217, 0.1);
  }
}

.fraction-part {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 40px;
}

.numerator,
.denominator {
  padding: 6px 10px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  border-radius: 4px;
  min-width: 36px;
  text-align: center;
  transition: all 0.2s;
  border: 2px solid transparent;
  
  &.active {
    background: var(--primary-color);
    color: white;
  }
  
  &:hover:not(.active) {
    background: var(--hover);
  }
}

.fraction-line {
  width: 100%;
  height: 2px;
  background: var(--text);
  margin: 1px 0;
}

.operator-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  button {
    width: 34px;
    height: 34px;
    border: none;
    border-radius: 6px;
    background: var(--hover);
    color: var(--text);
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
    
    &.active {
      background: var(--primary-color);
      color: white;
    }
    
    &:hover:not(.active) {
      background: var(--border);
    }
  }
}

.result-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px;
  background: var(--bg);
  border-radius: 10px;
  margin-bottom: 10px;
  flex-shrink: 0;
  
  .equals {
    font-size: 24px;
    color: var(--text);
  }
  
  .mixed-fraction.result {
    .whole-part {
      border: none;
      min-width: auto;
      min-height: auto;
      padding: 0;
      font-size: 28px;
      color: var(--primary-color);
      cursor: default;
      
      &:hover {
        border-color: transparent;
      }
    }
    
    .numerator,
    .denominator {
      font-size: 24px;
      color: var(--primary-color);
      cursor: default;
      border: none;
      
      &:hover {
        background: transparent;
      }
    }
  }
  
  .decimal {
    font-size: 15px;
    color: var(--text-secondary);
    margin-left: 8px;
  }
}

.keypad {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.row {
  display: flex;
  gap: 6px;
  flex: 1;
}

.key {
  flex: 1;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover { transform: scale(1.03); }
  &:active { transform: scale(0.97); }
  &:empty { visibility: hidden; }
  
  &.number {
    background: var(--bg);
    color: var(--text);
  }
  
  &.function {
    background: var(--hover);
    color: var(--text-secondary);
  }
  
  &.equals {
    background: var(--primary-color);
    color: white;
  }
}
</style>
