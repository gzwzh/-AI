<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()

const display = ref('0')
const expression = ref('')
const waitingForOperand = ref(true)
const lastInputWasOperator = ref(false)
const openParenCount = ref(0)

// 4列布局，参考图片
const buttons = [
  ['C', '()', '⌫', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['%', '0', '.', '='],
]

const getButtonClass = (btn: string) => {
  if (btn === '=') return 'equals'
  if (['÷', '×', '-', '+'].includes(btn)) return 'operator'
  if (['C', '()', '⌫', '%'].includes(btn)) return 'function'
  return 'number'
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
  const percentValue = value / 100
  
  // 如果已有表达式，将百分数值添加到表达式中
  if (!waitingForOperand.value) {
    display.value = String(percentValue)
  } else {
    display.value = String(percentValue)
  }
  // 不设置 waitingForOperand 为 true，允许继续输入运算符进行计算
  waitingForOperand.value = false
  lastInputWasOperator.value = false
}

const clear = () => {
  display.value = '0'
  expression.value = ''
  waitingForOperand.value = true
  lastInputWasOperator.value = false
  openParenCount.value = 0
}

const backspace = () => {
  // 如果正在等待输入新数字，需要删除表达式中的内容
  if (waitingForOperand.value && expression.value) {
    // 删除表达式最后一个字符
    const lastChar = expression.value.slice(-1)
    expression.value = expression.value.slice(0, -1)
    
    // 如果删除的是运算符，恢复之前的数字到显示
    if (['÷', '×', '-', '+'].includes(lastChar)) {
      lastInputWasOperator.value = false
      // 从表达式中提取最后一个数字
      const match = expression.value.match(/[\d.]+$/)
      if (match) {
        display.value = match[0]
        expression.value = expression.value.slice(0, -match[0].length)
        waitingForOperand.value = false
      }
    } else if (lastChar === '(') {
      openParenCount.value--
    } else if (lastChar === ')') {
      openParenCount.value++
    }
    return
  }
  
  // 正常删除显示的数字
  if (display.value.length > 1) {
    display.value = display.value.slice(0, -1)
  } else {
    display.value = '0'
    waitingForOperand.value = true
  }
}

const toggleParenthesis = () => {
  if (lastInputWasOperator.value || expression.value === '' || expression.value.endsWith('(')) {
    if (!waitingForOperand.value) {
      expression.value += display.value + '×'
    }
    expression.value += '('
    openParenCount.value++
    waitingForOperand.value = true
  } else if (openParenCount.value > 0) {
    if (!waitingForOperand.value) {
      expression.value += display.value
    }
    expression.value += ')'
    openParenCount.value--
    waitingForOperand.value = true
  }
  lastInputWasOperator.value = false
}

const performOperation = (operator: string) => {
  const current = display.value
  
  if (operator === '=') {
    let finalExpr = expression.value
    if (!waitingForOperand.value || !expression.value) {
      // 如果没有表达式但有当前值，直接显示当前值
      if (!expression.value && waitingForOperand.value) {
        return
      }
      finalExpr += current
    }
    
    if (finalExpr) {
      while (openParenCount.value > 0) {
        finalExpr += ')'
        openParenCount.value--
      }
      try {
        const evalExpr = finalExpr.replace(/×/g, '*').replace(/÷/g, '/')
        const result = Function('"use strict"; return (' + evalExpr + ')')()
        // 处理精度问题，避免浮点数误差
        const resultNum = parseFloat(result.toPrecision(12))
        display.value = String(resultNum)
        expression.value = ''
      } catch {
        display.value = 'Error'
      }
    }
    waitingForOperand.value = true
    lastInputWasOperator.value = false
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
  if (/[0-9]/.test(btn)) {
    inputDigit(btn)
  } else if (btn === '.') {
    inputDecimal()
  } else if (btn === '%') {
    inputPercent()
  } else if (btn === 'C') {
    clear()
  } else if (btn === '⌫') {
    backspace()
  } else if (btn === '()') {
    toggleParenthesis()
  } else if (['÷', '×', '-', '+', '='].includes(btn)) {
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
      <h1 class="title">基础计算器</h1>
      <ThemeToggle />
    </header>
    
    <main class="calculator">
      <div class="display">
        <div class="expression">{{ displayExpression }}</div>
        <div class="result">{{ display }}</div>
      </div>
      
      <div class="keypad">
        <div v-for="(row, i) in buttons" :key="i" class="row">
          <button
            v-for="btn in row"
            :key="btn"
            :class="['key', getButtonClass(btn)]"
            @click="handleButton(btn)"
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
  max-width: 400px;
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
  background: var(--bg);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
  text-align: right;
  min-height: 80px;
  flex-shrink: 0;
  
  .expression {
    font-size: 16px;
    color: var(--text-secondary);
    min-height: 20px;
    word-break: break-all;
  }
  
  .result {
    font-size: 32px;
    font-weight: 600;
    color: var(--text);
    word-break: break-all;
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
  border-radius: 10px;
  font-size: 22px;
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
  }
  
  &.operator {
    background: var(--bg);
    color: var(--text-secondary);
  }
  
  &.function {
    background: var(--hover);
    color: var(--text-secondary);
  }
  
  &.equals {
    background: #ff9500;
    color: white;
  }
}
</style>
