<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { unitConfigs, convertTemperature } from '@/config/units'

const route = useRoute()
const router = useRouter()

const type = computed(() => route.params.type as string)
const config = computed(() => unitConfigs[type.value])

const fromUnit = ref(0)
const toUnit = ref(1)
const fromValue = ref('1')
const toValue = ref('')

const convert = () => {
  const value = parseFloat(fromValue.value) || 0
  const units = config.value?.units
  
  if (!units) return
  
  const from = units[fromUnit.value]
  const to = units[toUnit.value]
  
  if (type.value === 'temperature') {
    const result = convertTemperature(value, from.symbol, to.symbol)
    toValue.value = formatNumber(result)
  } else {
    // 通用转换：先转到基准单位，再转到目标单位
    const baseValue = value * from.toBase
    const result = baseValue / to.toBase
    toValue.value = formatNumber(result)
  }
}

const formatNumber = (num: number): string => {
  if (Math.abs(num) < 0.000001 || Math.abs(num) > 999999999) {
    return num.toExponential(6)
  }
  // 最多保留10位有效数字
  const str = num.toPrecision(10)
  return parseFloat(str).toString()
}

const swapUnits = () => {
  const temp = fromUnit.value
  fromUnit.value = toUnit.value
  toUnit.value = temp
  fromValue.value = toValue.value
  convert()
}

const inputDigit = (digit: string) => {
  if (fromValue.value === '0' && digit !== '.') {
    fromValue.value = digit
  } else {
    fromValue.value += digit
  }
  convert()
}

const inputDecimal = () => {
  if (!fromValue.value.includes('.')) {
    fromValue.value += '.'
  }
}

const backspace = () => {
  if (fromValue.value.length > 1) {
    fromValue.value = fromValue.value.slice(0, -1)
  } else {
    fromValue.value = '0'
  }
  convert()
}

const clear = () => {
  fromValue.value = '0'
  toValue.value = '0'
}

const toggleSign = () => {
  if (fromValue.value.startsWith('-')) {
    fromValue.value = fromValue.value.slice(1)
  } else if (fromValue.value !== '0') {
    fromValue.value = '-' + fromValue.value
  }
  convert()
}

watch([fromUnit, toUnit], convert, { immediate: true })

const buttons = [
  ['7', '8', '9', 'C'],
  ['4', '5', '6', '⌫'],
  ['1', '2', '3', '±'],
  ['0', '.', '', '↔'],
]
</script>

<template>
  <div class="converter-page">
    <header class="header">
      <button class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="title">{{ config?.name }}转换</h1>
      <ThemeToggle />
    </header>
    
    <main class="converter" v-if="config">
      <!-- 输入区域 -->
      <div class="convert-area">
        <div class="unit-row">
          <select v-model="fromUnit" class="unit-select">
            <option v-for="(unit, i) in config.units" :key="i" :value="i">
              {{ unit.name }} ({{ unit.symbol }})
            </option>
          </select>
          <div class="value-display from">{{ fromValue }}</div>
        </div>
        
        <button class="swap-btn" @click="swapUnits">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4"/>
          </svg>
        </button>
        
        <div class="unit-row">
          <select v-model="toUnit" class="unit-select">
            <option v-for="(unit, i) in config.units" :key="i" :value="i">
              {{ unit.name }} ({{ unit.symbol }})
            </option>
          </select>
          <div class="value-display to">{{ toValue }}</div>
        </div>
      </div>
      
      <!-- 数字键盘 -->
      <div class="keypad">
        <div v-for="(row, i) in buttons" :key="i" class="row">
          <button
            v-for="btn in row"
            :key="btn"
            class="key"
            :class="{
              number: /[0-9.]/.test(btn),
              function: ['C', '⌫', '±', '↔'].includes(btn)
            }"
            @click="
              /[0-9]/.test(btn) ? inputDigit(btn) :
              btn === '.' ? inputDecimal() :
              btn === 'C' ? clear() :
              btn === '⌫' ? backspace() :
              btn === '±' ? toggleSign() :
              btn === '↔' ? swapUnits() : null
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
.converter-page {
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

.converter {
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

.convert-area {
  background: var(--bg);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.unit-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.unit-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--card-bg);
  color: var(--text);
  font-size: 15px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
}

.value-display {
  padding: 12px;
  font-size: 26px;
  font-weight: 600;
  text-align: right;
  background: var(--card-bg);
  border-radius: 6px;
  color: var(--text);
  word-break: break-all;
  
  &.from {
    border: 2px solid var(--primary-color);
  }
  
  &.to {
    color: var(--primary-color);
  }
}

.swap-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 10px auto;
  border: none;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: rotate(180deg);
  }
  
  svg {
    width: 20px;
    height: 20px;
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
