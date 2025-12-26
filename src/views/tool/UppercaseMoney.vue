<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()

const amount = ref('0')

const digitMap = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const unitMap = ['', '拾', '佰', '仟']
const bigUnitMap = ['', '万', '亿', '兆']

const toUppercase = (num: number): string => {
  if (num === 0) return '零元整'
  
  const isNegative = num < 0
  num = Math.abs(num)
  
  // 分离整数和小数部分
  const [intPart, decPart] = num.toFixed(2).split('.')
  const jiao = parseInt(decPart[0])
  const fen = parseInt(decPart[1])
  
  let result = ''
  
  // 处理整数部分
  if (parseInt(intPart) > 0) {
    const intStr = intPart
    const len = intStr.length
    let zeroFlag = false
    
    for (let i = 0; i < len; i++) {
      const digit = parseInt(intStr[i])
      const pos = len - i - 1
      const unitPos = pos % 4
      const bigUnitPos = Math.floor(pos / 4)
      
      if (digit === 0) {
        zeroFlag = true
        if (unitPos === 0 && bigUnitPos > 0) {
          // 添加万、亿等大单位
          result += bigUnitMap[bigUnitPos]
        }
      } else {
        if (zeroFlag) {
          result += '零'
          zeroFlag = false
        }
        result += digitMap[digit] + unitMap[unitPos]
        if (unitPos === 0 && bigUnitPos > 0) {
          result += bigUnitMap[bigUnitPos]
        }
      }
    }
    result += '元'
  }
  
  // 处理小数部分
  if (jiao === 0 && fen === 0) {
    result += '整'
  } else {
    if (jiao > 0) {
      result += digitMap[jiao] + '角'
    } else if (parseInt(intPart) > 0) {
      result += '零'
    }
    if (fen > 0) {
      result += digitMap[fen] + '分'
    }
  }
  
  return (isNegative ? '负' : '') + result
}

const uppercase = computed(() => {
  const num = parseFloat(amount.value) || 0
  return toUppercase(num)
})

const inputDigit = (digit: string) => {
  if (amount.value === '0' && digit !== '.') {
    amount.value = digit
  } else {
    // 限制小数点后两位
    if (amount.value.includes('.')) {
      const [, dec] = amount.value.split('.')
      if (dec && dec.length >= 2) return
    }
    amount.value += digit
  }
}

const inputDecimal = () => {
  if (!amount.value.includes('.')) {
    amount.value += '.'
  }
}

const backspace = () => {
  if (amount.value.length > 1) {
    amount.value = amount.value.slice(0, -1)
  } else {
    amount.value = '0'
  }
}

const clear = () => {
  amount.value = '0'
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(uppercase.value)
    // 可以添加提示
  } catch {
    // 复制失败
  }
}

const buttons = [
  ['7', '8', '9', 'C'],
  ['4', '5', '6', '⌫'],
  ['1', '2', '3', ''],
  ['0', '00', '.', ''],
]
</script>

<template>
  <div class="tool-page">
    <header class="header">
      <button class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="title">大写金额</h1>
      <ThemeToggle />
    </header>
    
    <main class="tool-content">
      <div class="display-area">
        <div class="amount-display">
          <span class="currency">¥</span>
          <span class="value">{{ amount }}</span>
        </div>
        
        <div class="uppercase-display" @click="copyResult">
          <div class="label">大写金额 (点击复制)</div>
          <div class="value">{{ uppercase }}</div>
        </div>
      </div>
      
      <div class="keypad">
        <div v-for="(row, i) in buttons" :key="i" class="row">
          <button
            v-for="btn in row"
            :key="btn"
            class="key"
            :class="{
              number: /[0-9.]/.test(btn),
              function: ['C', '⌫'].includes(btn)
            }"
            @click="
              /[0-9]/.test(btn) ? inputDigit(btn) :
              btn === '00' ? (inputDigit('0'), inputDigit('0')) :
              btn === '.' ? inputDecimal() :
              btn === 'C' ? clear() :
              btn === '⌫' ? backspace() : null
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
  max-width: 450px;
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

.display-area {
  margin-bottom: 12px;
  flex-shrink: 0;
}

.amount-display {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  padding: 14px;
  background: var(--bg);
  border-radius: 10px;
  margin-bottom: 10px;
  
  .currency {
    font-size: 20px;
    color: var(--text-secondary);
    margin-right: 6px;
  }
  
  .value {
    font-size: 32px;
    font-weight: 600;
    color: var(--text);
    font-family: 'Consolas', monospace;
  }
}

.uppercase-display {
  padding: 14px;
  background: var(--bg);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--hover);
  }
  
  .label {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }
  
  .value {
    font-size: 18px;
    font-weight: 600;
    color: var(--primary-color);
    line-height: 1.4;
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
}
</style>
