<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()

const display = ref('0')
const expression = ref('')
const waitingForOperand = ref(true)
const lastInputWasOperator = ref(false)
const isRadians = ref(false)
const openParenCount = ref(0)

// 5列布局，参考图片
const buttons = [
  ['fx', 'DEG', 'xʸ', 'ʸ√x', 'C'],
  ['sin', '(', ')', 'n!', '⌫'],
  ['cos', '1/x', 'π', 'e', '÷'],
  ['tan', '7', '8', '9', '×'],
  ['cot', '4', '5', '6', '-'],
  ['ln', '1', '2', '3', '+'],
  ['lg', '%', '0', '.', '='],
]

const getButtonClass = (btn: string) => {
  if (btn === '=') return 'equals'
  if (['÷', '×', '-', '+'].includes(btn)) return 'operator'
  if (/^[0-9]$/.test(btn) || btn === '.') return 'number'
  return 'function'
}

const toRadians = (deg: number) => deg * Math.PI / 180

const factorial = (n: number): number => {
  if (n < 0 || !Number.isInteger(n)) return NaN
  if (n === 0 || n === 1) return 1
  let result = 1
  for (let i = 2; i <= n; i++) result *= i
  return result
}

const inputDigit = (digit: string) => {
  if (waitingForOperand.value) {
    display.value = digit
    waitingForOperand.value = false
  } else {
    display.value = display.value === '0' ? digit : display.value + digit
  }
  lastInputWasOperator.value = false
}

const inputDecimal = () => {
  if (waitingForOperand.value) {
    display.value = '0.'
    waitingForOperand.value = false
    return
  }
  if (!display.value.includes('.')) {
    display.value += '.'
  }
  lastInputWasOperator.value = false
}

const inputPercent = () => {
  const value = parseFloat(display.value)
  display.value = String(value / 100)
  waitingForOperand.value = true
}

const clear = () => {
  display.value = '0'
  expression.value = ''
  waitingForOperand.value = true
  lastInputWasOperator.value = false
  openParenCount.value = 0
}

const backspace = () => {
  if (display.value.length > 1) {
    display.value = display.value.slice(0, -1)
  } else {
    display.value = '0'
    waitingForOperand.value = true
  }
}

const inputConstant = (constant: string) => {
  display.value = constant === 'π' ? String(Math.PI) : String(Math.E)
  waitingForOperand.value = true
  lastInputWasOperator.value = false
}

const inputParenthesis = (paren: string) => {
  if (paren === '(') {
    if (!waitingForOperand.value) {
      expression.value += display.value + '×'
    }
    expression.value += '('
    openParenCount.value++
    waitingForOperand.value = true
  } else if (paren === ')' && openParenCount.value > 0) {
    if (!waitingForOperand.value) {
      expression.value += display.value
    }
    expression.value += ')'
    openParenCount.value--
    waitingForOperand.value = true
  }
  lastInputWasOperator.value = false
}

const applyFunction = (func: string) => {
  const value = parseFloat(display.value)
  let result: number
  
  switch (func) {
    case 'sin':
      result = isRadians.value ? Math.sin(value) : Math.sin(toRadians(value))
      break
    case 'cos':
      result = isRadians.value ? Math.cos(value) : Math.cos(toRadians(value))
      break
    case 'tan':
      result = isRadians.value ? Math.tan(value) : Math.tan(toRadians(value))
      break
    case 'cot':
      const tanVal = isRadians.value ? Math.tan(value) : Math.tan(toRadians(value))
      result = 1 / tanVal
      break
    case 'ln':
      result = Math.log(value)
      break
    case 'lg':
      result = Math.log10(value)
      break
    case '1/x':
      result = 1 / value
      break
    case 'n!':
      result = factorial(Math.floor(value))
      break
    default:
      return
  }
  
  display.value = String(parseFloat(result.toFixed(10)))
  waitingForOperand.value = true
  lastInputWasOperator.value = false
}

const performOperation = (operator: string) => {
  const current = display.value
  
  if (operator === '=') {
    if (expression.value) {
      let finalExpr = expression.value
      if (!waitingForOperand.value) {
        finalExpr += current
      }
      while (openParenCount.value > 0) {
        finalExpr += ')'
        openParenCount.value--
      }
      try {
        const evalExpr = finalExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**')
        const result = Function('"use strict"; return (' + evalExpr + ')')()
        display.value = String(parseFloat(result.toFixed(10)))
        expression.value = ''
      } catch {
        display.value = 'Error'
      }
    }
    waitingForOperand.value = true
    lastInputWasOperator.value = false
    return
  }
  
  if (operator === 'xʸ') {
    if (!waitingForOperand.value || !lastInputWasOperator.value) {
      expression.value += current + '^'
    }
    waitingForOperand.value = true
    lastInputWasOperator.value = true
    return
  }
  
  if (operator === 'ʸ√x') {
    if (!waitingForOperand.value) {
      expression.value += current + '^(1/'
      openParenCount.value++
    }
    waitingForOperand.value = true
    lastInputWasOperator.value = true
    return
  }
  
  if (!waitingForOperand.value) {
    expression.value += current + operator
  } else if (lastInputWasOperator.value) {
    expression.value = expression.value.slice(0, -1) + operator
  } else {
    expression.value += current + operator
  }
  
  waitingForOperand.value = true
  lastInputWasOperator.value = true
}

const handleButton = (btn: string) => {
  if (/^[0-9]$/.test(btn)) {
    inputDigit(btn)
  } else if (btn === '.') {
    inputDecimal()
  } else if (btn === '%') {
    inputPercent()
  } else if (btn === 'C') {
    clear()
  } else if (btn === '⌫') {
    backspace()
  } else if (btn === 'π' || btn === 'e') {
    inputConstant(btn)
  } else if (btn === '(' || btn === ')') {
    inputParenthesis(btn)
  } else if (btn === 'DEG') {
    isRadians.value = !isRadians.value
  } else if (btn === 'fx') {
    // 预留
  } else if (['sin', 'cos', 'tan', 'cot', 'ln', 'lg', '1/x', 'n!'].includes(btn)) {
    applyFunction(btn)
  } else if (['÷', '×', '-', '+', '=', 'xʸ', 'ʸ√x'].includes(btn)) {
    performOperation(btn)
  }
}

const displayExpression = computed(() => expression.value || '')
</script>

<template>
  <div class="calculator-page">
    <header class="header">
      <button class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="title">科学计算器</h1>
      <ThemeToggle />
    </header>
    
    <main class="calculator">
      <div class="display">
        <div class="mode-indicator">{{ isRadians ? 'RAD' : 'DEG' }}</div>
        <div class="expression">{{ displayExpression }}</div>
        <div class="result">{{ display }}</div>
      </div>
      
      <div class="keypad">
        <div v-for="(row, i) in buttons" :key="i" class="row">
          <button
            v-for="btn in row"
            :key="btn"
            :class="['key', getButtonClass(btn), { active: btn === 'DEG' && isRadians }]"
            @click="handleButton(btn)"
          >
            <template v-if="btn === 'DEG'">
              {{ isRadians ? 'RAD' : 'DEG' }}
            </template>
            <template v-else>{{ btn }}</template>
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
  transition: all 0.3s ease;
  
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

.display {
  position: relative;
  background: var(--bg);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
  text-align: right;
  min-height: 70px;
  flex-shrink: 0;
  
  .mode-indicator {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 12px;
    color: var(--primary-color);
    font-weight: bold;
  }
  
  .expression {
    font-size: 14px;
    color: var(--text-secondary);
    min-height: 18px;
    word-break: break-all;
  }
  
  .result {
    font-size: 28px;
    font-weight: 600;
    color: var(--text);
    word-break: break-all;
  }
}

.keypad {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.row {
  display: flex;
  gap: 4px;
  flex: 1;
}

.key {
  flex: 1;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    transform: scale(1.03);
  }
  
  &:active {
    transform: scale(0.97);
  }
  
  &.number {
    background: var(--bg);
    color: var(--text);
    font-size: 18px;
  }
  
  &.operator {
    background: var(--bg);
    color: var(--text-secondary);
    font-size: 17px;
  }
  
  &.function {
    background: var(--hover);
    color: var(--text-secondary);
    font-size: 14px;
  }
  
  &.equals {
    background: #ff9500;
    color: white;
  }
  
  &.active {
    background: #ff9500;
    color: white;
  }
}
</style>
