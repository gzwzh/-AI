<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()

const decimal = ref('')
const binary = ref('')
const octal = ref('')
const hex = ref('')
const activeInput = ref<'dec' | 'bin' | 'oct' | 'hex'>('dec')

const convert = (from: string, value: string) => {
  if (!value) {
    decimal.value = ''
    binary.value = ''
    octal.value = ''
    hex.value = ''
    return
  }
  
  let num: number
  try {
    switch (from) {
      case 'dec': num = parseInt(value, 10); break
      case 'bin': num = parseInt(value, 2); break
      case 'oct': num = parseInt(value, 8); break
      case 'hex': num = parseInt(value, 16); break
      default: return
    }
    
    if (isNaN(num)) return
    
    if (from !== 'dec') decimal.value = num.toString(10)
    if (from !== 'bin') binary.value = num.toString(2)
    if (from !== 'oct') octal.value = num.toString(8)
    if (from !== 'hex') hex.value = num.toString(16).toUpperCase()
  } catch {
    // 忽略转换错误
  }
}

const handleInput = (type: 'dec' | 'bin' | 'oct' | 'hex', value: string) => {
  activeInput.value = type
  
  // 验证输入
  let valid = true
  switch (type) {
    case 'dec': valid = /^-?\d*$/.test(value); break
    case 'bin': valid = /^[01]*$/.test(value); break
    case 'oct': valid = /^[0-7]*$/.test(value); break
    case 'hex': valid = /^[0-9A-Fa-f]*$/.test(value); break
  }
  
  if (valid) {
    switch (type) {
      case 'dec': decimal.value = value; break
      case 'bin': binary.value = value; break
      case 'oct': octal.value = value; break
      case 'hex': hex.value = value.toUpperCase(); break
    }
    convert(type, value)
  }
}

const clear = () => {
  decimal.value = ''
  binary.value = ''
  octal.value = ''
  hex.value = ''
}

// 复制到剪贴板
const copiedType = ref<string | null>(null)
const copyToClipboard = async (type: 'bin' | 'dec' | 'oct' | 'hex') => {
  let value = ''
  switch (type) {
    case 'bin': value = binary.value; break
    case 'dec': value = decimal.value; break
    case 'oct': value = octal.value; break
    case 'hex': value = hex.value; break
  }
  if (value) {
    try {
      await navigator.clipboard.writeText(value)
      copiedType.value = type
      setTimeout(() => { copiedType.value = null }, 1500)
    } catch {
      // 复制失败
    }
  }
}

const inputDigit = (digit: string) => {
  const type = activeInput.value
  let current = ''
  switch (type) {
    case 'dec': current = decimal.value; break
    case 'bin': current = binary.value; break
    case 'oct': current = octal.value; break
    case 'hex': current = hex.value; break
  }
  handleInput(type, current + digit)
}

const backspace = () => {
  const type = activeInput.value
  let current = ''
  switch (type) {
    case 'dec': current = decimal.value; break
    case 'bin': current = binary.value; break
    case 'oct': current = octal.value; break
    case 'hex': current = hex.value; break
  }
  if (current.length > 0) {
    handleInput(type, current.slice(0, -1))
  }
}

const decButtons = [['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3'], ['0', 'C', '⌫']]
const hexButtons = [['A', 'B', 'C'], ['D', 'E', 'F']]
</script>

<template>
  <div class="tool-page">
    <header class="header">
      <button class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="title">进制转换</h1>
      <ThemeToggle />
    </header>
    
    <main class="tool-content">
      <div class="input-group">
        <div class="input-row" :class="{ active: activeInput === 'dec' }">
          <label>十进制 (DEC)</label>
          <input 
            type="text" 
            :value="decimal"
            @input="handleInput('dec', ($event.target as HTMLInputElement).value)"
            @focus="activeInput = 'dec'"
            placeholder="0"
          />
        </div>
        
        <div class="input-row" :class="{ active: activeInput === 'bin' }">
          <label>二进制 (BIN)</label>
          <input 
            type="text" 
            :value="binary"
            @input="handleInput('bin', ($event.target as HTMLInputElement).value)"
            @focus="activeInput = 'bin'"
            placeholder="0"
          />
        </div>
        
        <div class="input-row" :class="{ active: activeInput === 'oct' }">
          <label>八进制 (OCT)</label>
          <input 
            type="text" 
            :value="octal"
            @input="handleInput('oct', ($event.target as HTMLInputElement).value)"
            @focus="activeInput = 'oct'"
            placeholder="0"
          />
        </div>
        
        <div class="input-row" :class="{ active: activeInput === 'hex' }">
          <label>十六进制 (HEX)</label>
          <input 
            type="text" 
            :value="hex"
            @input="handleInput('hex', ($event.target as HTMLInputElement).value)"
            @focus="activeInput = 'hex'"
            placeholder="0"
          />
        </div>
      </div>

      <!-- 复制结果 -->
      <div class="copy-section">
        <div class="copy-title">复制结果</div>
        <div class="copy-buttons">
          <button @click="copyToClipboard('bin')" :class="{ copied: copiedType === 'bin' }">
            {{ copiedType === 'bin' ? '已复制' : '二进制' }}
          </button>
          <button @click="copyToClipboard('dec')" :class="{ copied: copiedType === 'dec' }">
            {{ copiedType === 'dec' ? '已复制' : '十进制' }}
          </button>
          <button @click="copyToClipboard('oct')" :class="{ copied: copiedType === 'oct' }">
            {{ copiedType === 'oct' ? '已复制' : '八进制' }}
          </button>
          <button @click="copyToClipboard('hex')" :class="{ copied: copiedType === 'hex' }">
            {{ copiedType === 'hex' ? '已复制' : '十六进制' }}
          </button>
        </div>
      </div>
      
      <div class="keypad">
        <div class="hex-keys" v-if="activeInput === 'hex'">
          <div v-for="(row, i) in hexButtons" :key="i" class="row">
            <button v-for="btn in row" :key="btn" class="key hex" @click="inputDigit(btn)">
              {{ btn }}
            </button>
          </div>
        </div>
        <div class="num-keys">
          <div v-for="(row, i) in decButtons" :key="i" class="row">
            <button 
              v-for="btn in row" 
              :key="btn" 
              class="key"
              :class="{ function: ['C', '⌫'].includes(btn) }"
              :disabled="activeInput === 'bin' && !['0', '1', 'C', '⌫'].includes(btn)"
              :style="activeInput === 'oct' && parseInt(btn) > 7 ? { opacity: 0.3 } : {}"
              @click="btn === 'C' ? clear() : btn === '⌫' ? backspace() : inputDigit(btn)"
            >
              {{ btn }}
            </button>
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

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.copy-section {
  margin-bottom: 10px;
  flex-shrink: 0;
  
  .copy-title {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }
  
  .copy-buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    
    button {
      padding: 10px 6px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--bg);
      color: var(--text);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        background: var(--hover);
      }
      
      &:active {
        transform: scale(0.95);
      }
      
      &.copied {
        background: #4caf50;
        color: white;
        border-color: #4caf50;
      }
    }
  }
}

.input-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: var(--bg);
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.2s;
  
  &.active {
    border-color: var(--primary-color);
  }
  
  label {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  input {
    border: none;
    background: transparent;
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
    font-family: 'Consolas', monospace;
    
    &:focus {
      outline: none;
    }
    
    &::placeholder {
      color: var(--text-secondary);
      opacity: 0.5;
    }
  }
}

.keypad {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.hex-keys {
  margin-bottom: 6px;
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
  font-weight: 600;
  cursor: pointer;
  background: var(--bg);
  color: var(--text);
  transition: all 0.15s;
  
  &:hover:not(:disabled) { transform: scale(1.03); }
  &:active:not(:disabled) { transform: scale(0.97); }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
  
  &.hex {
    background: var(--primary-color);
    color: white;
  }
  
  &.function {
    background: var(--hover);
    color: var(--text-secondary);
  }
}
</style>
