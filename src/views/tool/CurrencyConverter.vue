<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()

// 货币配置 (以人民币CNY为基准，汇率为1单位外币=多少人民币)
interface Currency {
  code: string
  name: string
  symbol: string
  rate: number  // 1单位该货币 = rate 人民币
}

const defaultCurrencies: Currency[] = [
  { code: 'CNY', name: '人民币', symbol: '¥', rate: 1 },
  { code: 'USD', name: '美元', symbol: '$', rate: 7.24 },
  { code: 'EUR', name: '欧元', symbol: '€', rate: 7.86 },
  { code: 'GBP', name: '英镑', symbol: '£', rate: 9.18 },
  { code: 'JPY', name: '日元', symbol: '¥', rate: 0.048 },
  { code: 'KRW', name: '韩元', symbol: '₩', rate: 0.0052 },
  { code: 'HKD', name: '港币', symbol: 'HK$', rate: 0.93 },
  { code: 'TWD', name: '新台币', symbol: 'NT$', rate: 0.22 },
  { code: 'SGD', name: '新加坡元', symbol: 'S$', rate: 5.38 },
  { code: 'AUD', name: '澳元', symbol: 'A$', rate: 4.72 },
  { code: 'CAD', name: '加元', symbol: 'C$', rate: 5.28 },
  { code: 'CHF', name: '瑞士法郎', symbol: 'Fr', rate: 8.12 },
  { code: 'THB', name: '泰铢', symbol: '฿', rate: 0.21 },
  { code: 'MYR', name: '马来西亚林吉特', symbol: 'RM', rate: 1.63 },
  { code: 'RUB', name: '俄罗斯卢布', symbol: '₽', rate: 0.073 },
  { code: 'INR', name: '印度卢比', symbol: '₹', rate: 0.086 },
]

// 从localStorage加载或使用默认值
const loadCurrencies = (): Currency[] => {
  const saved = localStorage.getItem('currencies')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return [...defaultCurrencies]
    }
  }
  return [...defaultCurrencies]
}

const currencies = ref<Currency[]>(loadCurrencies())
const fromCurrency = ref(0) // CNY
const toCurrency = ref(1)   // USD
const fromValue = ref('100')
const showRateEditor = ref(false)
const editingRates = ref<Currency[]>([])

const toValue = computed(() => {
  const amount = parseFloat(fromValue.value) || 0
  const from = currencies.value[fromCurrency.value]
  const to = currencies.value[toCurrency.value]
  
  // 先转成人民币，再转成目标货币
  const cnyAmount = amount * from.rate
  const result = cnyAmount / to.rate
  
  return result.toFixed(4).replace(/\.?0+$/, '')
})

const exchangeRate = computed(() => {
  const from = currencies.value[fromCurrency.value]
  const to = currencies.value[toCurrency.value]
  return (from.rate / to.rate).toFixed(6)
})

const swapCurrencies = () => {
  const temp = fromCurrency.value
  fromCurrency.value = toCurrency.value
  toCurrency.value = temp
}

const inputDigit = (digit: string) => {
  if (fromValue.value === '0' && digit !== '.') {
    fromValue.value = digit
  } else {
    fromValue.value += digit
  }
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
}

const clear = () => {
  fromValue.value = '0'
}

// 汇率编辑
const openRateEditor = () => {
  editingRates.value = JSON.parse(JSON.stringify(currencies.value))
  showRateEditor.value = true
}

const saveRates = () => {
  currencies.value = editingRates.value
  localStorage.setItem('currencies', JSON.stringify(currencies.value))
  showRateEditor.value = false
}

const resetRates = () => {
  editingRates.value = JSON.parse(JSON.stringify(defaultCurrencies))
}

const buttons = [
  ['7', '8', '9', 'C'],
  ['4', '5', '6', '⌫'],
  ['1', '2', '3', ''],
  ['0', '00', '.', '↔'],
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
      <h1 class="title">汇率换算</h1>
      <ThemeToggle />
    </header>
    
    <main class="tool-content">
      <div class="convert-area">
        <div class="currency-row">
          <select v-model="fromCurrency" class="currency-select">
            <option v-for="(c, i) in currencies" :key="c.code" :value="i">
              {{ c.symbol }} {{ c.name }} ({{ c.code }})
            </option>
          </select>
          <div class="value-display from">{{ fromValue }}</div>
        </div>
        
        <div class="exchange-info">
          <button class="swap-btn" @click="swapCurrencies">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4"/>
            </svg>
          </button>
          <span class="rate">1 {{ currencies[fromCurrency].code }} = {{ exchangeRate }} {{ currencies[toCurrency].code }}</span>
        </div>
        
        <div class="currency-row">
          <select v-model="toCurrency" class="currency-select">
            <option v-for="(c, i) in currencies" :key="c.code" :value="i">
              {{ c.symbol }} {{ c.name }} ({{ c.code }})
            </option>
          </select>
          <div class="value-display to">{{ toValue }}</div>
        </div>
      </div>
      
      <button class="edit-rate-btn" @click="openRateEditor">
        ⚙️ 编辑汇率
      </button>
      
      <div class="keypad">
        <div v-for="(row, i) in buttons" :key="i" class="row">
          <button
            v-for="btn in row"
            :key="btn"
            class="key"
            :class="{
              number: /[0-9.]/.test(btn),
              function: ['C', '⌫', '↔'].includes(btn)
            }"
            @click="
              /[0-9]/.test(btn) ? inputDigit(btn) :
              btn === '00' ? (inputDigit('0'), inputDigit('0')) :
              btn === '.' ? inputDecimal() :
              btn === 'C' ? clear() :
              btn === '⌫' ? backspace() :
              btn === '↔' ? swapCurrencies() : null
            "
          >
            {{ btn }}
          </button>
        </div>
      </div>
      
      <div class="update-hint">
        💡 汇率为参考值，点击"编辑汇率"可手动更新
      </div>
    </main>
    
    <!-- 汇率编辑弹窗 -->
    <div class="modal-overlay" v-if="showRateEditor" @click.self="showRateEditor = false">
      <div class="modal">
        <div class="modal-header">
          <h3>编辑汇率</h3>
          <button class="close-btn" @click="showRateEditor = false">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">汇率基准：1单位外币 = X 人民币</p>
          <div class="rate-list">
            <div v-for="(c, i) in editingRates" :key="c.code" class="rate-item">
              <span class="currency-name">{{ c.symbol }} {{ c.name }}</span>
              <input 
                type="number" 
                v-model.number="editingRates[i].rate" 
                step="0.0001"
                :disabled="c.code === 'CNY'"
              />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-reset" @click="resetRates">恢复默认</button>
          <button class="btn-save" @click="saveRates">保存</button>
        </div>
      </div>
    </div>
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

.convert-area {
  background: var(--bg);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.currency-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.currency-select {
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
  
  &.from {
    border: 2px solid var(--primary-color);
  }
  
  &.to {
    color: var(--primary-color);
  }
}

.exchange-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 0;
}

.swap-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover { transform: rotate(180deg); }
  svg { width: 18px; height: 18px; }
}

.rate {
  font-size: 14px;
  color: var(--text-secondary);
}

.edit-rate-btn {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px dashed var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  
  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
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
  
  &.number { background: var(--bg); color: var(--text); }
  &.function { background: var(--hover); color: var(--text-secondary); }
}

.update-hint {
  margin-top: 8px;
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

// 弹窗样式
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  
  h3 {
    font-size: 18px;
    color: var(--text);
  }
  
  .close-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: var(--bg);
    color: var(--text);
    font-size: 20px;
    cursor: pointer;
  }
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.modal-hint {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.rate-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rate-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: var(--bg);
  border-radius: 8px;
  
  .currency-name {
    font-size: 14px;
    color: var(--text);
  }
  
  input {
    width: 100px;
    padding: 8px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--card-bg);
    color: var(--text);
    text-align: right;
    font-size: 14px;
    
    &:disabled {
      opacity: 0.5;
    }
  }
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  
  button {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    cursor: pointer;
  }
  
  .btn-reset {
    background: var(--bg);
    color: var(--text-secondary);
  }
  
  .btn-save {
    background: var(--primary-color);
    color: white;
  }
}
</style>
