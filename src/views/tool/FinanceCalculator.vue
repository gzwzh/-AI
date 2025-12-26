<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()

// 三种模式：银行理财、复利理财、定投理财
const mode = ref<'bank' | 'compound' | 'regular'>('bank')

// 银行理财参数
const bankAmount = ref<number | null>(null) // 存款金额
const bankYears = ref<number | null>(null) // 存款期限（年）
const bankRate = ref(0.20) // 年利率
const bankType = ref<'current' | 'fixed'>('current') // 活期/定期

// 复利理财参数
const compoundAmount = ref<number | null>(null) // 本金
const compoundYears = ref<number | null>(null) // 投资期限
const compoundRate = ref<number | null>(null) // 年化收益率
const compoundFreq = ref<'year' | 'month' | 'day'>('year') // 复利周期

// 定投理财参数
const regularAmount = ref<number | null>(null) // 每期投入金额
const regularYears = ref<number | null>(null) // 投资期限
const regularRate = ref<number | null>(null) // 预期年化收益率
const regularFreq = ref<'month' | 'week'>('month') // 定投周期

// 显示利率表
const showRateTable = ref(false)

// 银行理财计算
const bankResult = computed(() => {
  const amount = bankAmount.value || 0
  const years = bankYears.value || 0
  const rate = bankRate.value / 100
  
  if (amount <= 0 || years <= 0) return null
  
  // 单利计算
  const interest = amount * rate * years
  const total = amount + interest
  
  return { interest, total }
})

// 复利理财计算
const compoundResult = computed(() => {
  const P = compoundAmount.value || 0
  const years = compoundYears.value || 0
  const rate = (compoundRate.value || 0) / 100
  
  if (P <= 0 || years <= 0 || rate < 0) return null
  
  // 限制计算范围，避免数字溢出
  if (years > 100 || rate > 1) return { interest: 0, total: 0, overflow: true }
  
  // 根据复利周期计算
  let n = 1 // 每年复利次数
  if (compoundFreq.value === 'month') n = 12
  else if (compoundFreq.value === 'day') n = 365
  
  // 复利公式: A = P(1 + r/n)^(nt)
  const exponent = n * years
  const base = 1 + rate / n
  
  // 检查是否会溢出
  if (exponent > 1000 || Math.pow(base, exponent) === Infinity) {
    return { interest: 0, total: 0, overflow: true }
  }
  
  const total = P * Math.pow(base, exponent)
  
  // 检查结果是否有效
  if (!isFinite(total) || total > 1e15) {
    return { interest: 0, total: 0, overflow: true }
  }
  
  const interest = total - P
  
  return { interest, total, overflow: false }
})

// 定投理财计算
const regularResult = computed(() => {
  const PMT = regularAmount.value || 0 // 每期投入
  const years = regularYears.value || 0
  const annualRate = (regularRate.value || 0) / 100
  
  if (PMT <= 0 || years <= 0) return null
  
  // 根据定投周期计算
  const periodsPerYear = regularFreq.value === 'month' ? 12 : 52
  const r = annualRate / periodsPerYear // 每期利率
  const n = years * periodsPerYear // 总期数
  
  // 定投终值公式: FV = PMT * ((1+r)^n - 1) / r * (1+r)
  let total: number
  if (r === 0) {
    total = PMT * n
  } else {
    total = PMT * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
  }
  
  const totalInvest = PMT * n
  const interest = total - totalInvest
  
  return { interest, total, totalInvest }
})

const formatMoney = (num: number) => {
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 利率表数据
const rateTableData = {
  current: { name: '活期存款', rate: '0.20%' },
  fixed: [
    { period: '3个月', rate: '1.15%' },
    { period: '6个月', rate: '1.35%' },
    { period: '1年', rate: '1.45%' },
    { period: '2年', rate: '1.65%' },
    { period: '3年', rate: '1.95%' },
    { period: '5年', rate: '2.00%' },
  ]
}

// 根据存款类型设置默认利率
const setDefaultRate = () => {
  if (bankType.value === 'current') {
    bankRate.value = 0.20
  } else {
    bankRate.value = 1.45 // 默认1年期
  }
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
      <h1 class="title">理财计算</h1>
      <button class="rate-table-btn" @click="showRateTable = true">利率表</button>
    </header>
    
    <main class="tool-content">
      <!-- 模式切换 -->
      <div class="mode-tabs">
        <button :class="{ active: mode === 'bank' }" @click="mode = 'bank'">银行理财</button>
        <button :class="{ active: mode === 'compound' }" @click="mode = 'compound'">复利理财</button>
        <button :class="{ active: mode === 'regular' }" @click="mode = 'regular'">定投理财</button>
      </div>

      <!-- 银行理财 -->
      <template v-if="mode === 'bank'">
        <div class="result-preview">
          <div class="preview-item">
            <span class="label">利息(元)</span>
            <span class="value primary">{{ bankResult ? formatMoney(bankResult.interest) : '0' }}元</span>
          </div>
          <div class="preview-item">
            <span class="label">本息（元）</span>
            <span class="value">{{ bankResult ? formatMoney(bankResult.total) : '0' }}元</span>
          </div>
        </div>

        <div class="section-title">请输入存款信息</div>

        <div class="input-section">
          <div class="input-row">
            <label>存款金额(元)</label>
            <div class="input-field wide">
              <input type="number" v-model.number="bankAmount" placeholder="请输入金额" />
            </div>
          </div>

          <div class="input-row">
            <label>存款期限</label>
            <div class="input-field">
              <input type="number" v-model.number="bankYears" placeholder="年数" />
              <span class="unit">年</span>
            </div>
          </div>

          <div class="input-row">
            <label>年利率(%)</label>
            <div class="input-field">
              <input type="number" v-model.number="bankRate" step="0.01" />
              <span class="unit">%</span>
            </div>
          </div>

          <div class="input-row">
            <label>存款类型</label>
            <div class="toggle-group">
              <button :class="{ active: bankType === 'current' }" @click="bankType = 'current'; setDefaultRate()">活期</button>
              <button :class="{ active: bankType === 'fixed' }" @click="bankType = 'fixed'; setDefaultRate()">定期</button>
            </div>
          </div>
        </div>
      </template>

      <!-- 复利理财 -->
      <template v-else-if="mode === 'compound'">
        <div class="result-preview">
          <div class="preview-item">
            <span class="label">利息收益(元)</span>
            <span class="value primary" v-if="compoundResult && !compoundResult.overflow">{{ formatMoney(compoundResult.interest) }}元</span>
            <span class="value error" v-else-if="compoundResult && compoundResult.overflow">数值过大</span>
            <span class="value primary" v-else>0元</span>
          </div>
          <div class="preview-item">
            <span class="label">本息合计（元）</span>
            <span class="value" v-if="compoundResult && !compoundResult.overflow">{{ formatMoney(compoundResult.total) }}元</span>
            <span class="value error" v-else-if="compoundResult && compoundResult.overflow">数值过大</span>
            <span class="value" v-else>0元</span>
          </div>
        </div>

        <div class="section-title">请输入投资信息</div>

        <div class="input-section">
          <div class="input-row">
            <label>投资本金(元)</label>
            <div class="input-field wide">
              <input type="number" v-model.number="compoundAmount" placeholder="请输入金额" />
            </div>
          </div>

          <div class="input-row">
            <label>投资期限</label>
            <div class="input-field">
              <input type="number" v-model.number="compoundYears" placeholder="年数" min="1" max="50" />
              <span class="unit">年</span>
            </div>
          </div>

          <div class="input-row">
            <label>年化收益率(%)</label>
            <div class="input-field">
              <input type="number" v-model.number="compoundRate" step="0.01" placeholder="0" min="0" max="100" />
              <span class="unit">%</span>
            </div>
          </div>

          <div class="input-row">
            <label>复利周期</label>
            <div class="toggle-group three">
              <button :class="{ active: compoundFreq === 'year' }" @click="compoundFreq = 'year'">按年</button>
              <button :class="{ active: compoundFreq === 'month' }" @click="compoundFreq = 'month'">按月</button>
              <button :class="{ active: compoundFreq === 'day' }" @click="compoundFreq = 'day'">按日</button>
            </div>
          </div>
        </div>

        <div class="hint-text" v-if="compoundResult && compoundResult.overflow">
          提示：投资期限或收益率过大，请调整参数
        </div>
      </template>

      <!-- 定投理财 -->
      <template v-else>
        <div class="result-preview">
          <div class="preview-item">
            <span class="label">利息收益(元)</span>
            <span class="value primary">{{ regularResult ? formatMoney(regularResult.interest) : '0' }}元</span>
          </div>
          <div class="preview-item">
            <span class="label">本息合计（元）</span>
            <span class="value">{{ regularResult ? formatMoney(regularResult.total) : '0' }}元</span>
          </div>
        </div>

        <div class="section-title">请输入定投信息</div>

        <div class="input-section">
          <div class="input-row">
            <label>每期投入(元)</label>
            <div class="input-field wide">
              <input type="number" v-model.number="regularAmount" placeholder="请输入金额" />
            </div>
          </div>

          <div class="input-row">
            <label>投资期限</label>
            <div class="input-field">
              <input type="number" v-model.number="regularYears" placeholder="年数" />
              <span class="unit">年</span>
            </div>
          </div>

          <div class="input-row">
            <label>预期年化收益(%)</label>
            <div class="input-field">
              <input type="number" v-model.number="regularRate" step="0.01" placeholder="0" />
              <span class="unit">%</span>
            </div>
          </div>

          <div class="input-row">
            <label>定投周期</label>
            <div class="toggle-group">
              <button :class="{ active: regularFreq === 'month' }" @click="regularFreq = 'month'">按月</button>
              <button :class="{ active: regularFreq === 'week' }" @click="regularFreq = 'week'">按周</button>
            </div>
          </div>
        </div>

        <div class="extra-info" v-if="regularResult">
          <div class="info-item">
            <span class="label">累计投入</span>
            <span class="value">¥{{ formatMoney(regularResult.totalInvest) }}</span>
          </div>
        </div>
      </template>
    </main>

    <!-- 利率表弹窗 -->
    <div class="modal-overlay" v-if="showRateTable" @click="showRateTable = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>银行存款利率表</h3>
          <button class="close-btn" @click="showRateTable = false">×</button>
        </div>
        <div class="modal-body">
          <div class="rate-section">
            <h4>活期存款</h4>
            <div class="rate-list">
              <div class="rate-item">
                <span>{{ rateTableData.current.name }}</span>
                <span class="rate">{{ rateTableData.current.rate }}</span>
              </div>
            </div>
          </div>
          <div class="rate-section">
            <h4>定期存款</h4>
            <div class="rate-list">
              <div class="rate-item" v-for="item in rateTableData.fixed" :key="item.period">
                <span>{{ item.period }}</span>
                <span class="rate">{{ item.rate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tool-page {
  height: 100vh;
  background: var(--bg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: var(--card-bg);
  color: var(--text);
  cursor: pointer;
  &:hover { background: var(--hover); }
  svg { width: 20px; height: 20px; }
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
}

.rate-table-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
  &:hover { background: var(--hover); }
}

.tool-content {
  flex: 1;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 20px var(--shadow);
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.mode-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 14px;
  border-bottom: 2px solid var(--border);
  flex-shrink: 0;

  button {
    flex: 1;
    padding: 12px 8px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 15px;
    cursor: pointer;
    position: relative;
    transition: all 0.2s;

    &.active {
      color: var(--primary-color);
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--primary-color);
      }
    }
  }
}

.result-preview {
  display: flex;
  justify-content: space-around;
  padding: 14px 0;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;

  .preview-item {
    text-align: center;

    .label {
      display: block;
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }

    .value {
      font-size: 20px;
      font-weight: 700;
      color: var(--text);

      &.primary {
        color: var(--primary-color);
      }

      &.error {
        color: #e74c3c;
        font-size: 14px;
      }
    }
  }
}

.hint-text {
  font-size: 13px;
  color: #e74c3c;
  text-align: center;
  padding: 10px;
  background: #fff5f5;
  border-radius: 8px;
  margin-top: 12px;
}

.section-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.input-section {
  margin-bottom: 14px;
  flex: 1;
}

.input-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);

  &:last-child {
    border-bottom: none;
  }

  label {
    font-size: 15px;
    color: var(--text);
    white-space: nowrap;
    flex-shrink: 0;
  }
}

.input-field {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  width: 160px;

  &.wide {
    width: 180px;
  }

  input {
    flex: 1;
    width: 100%;
    padding: 10px 12px;
    border: none;
    background: var(--bg);
    color: var(--text);
    font-size: 15px;
    outline: none;
    text-align: right;

    &::placeholder {
      color: var(--text-secondary);
      text-align: left;
    }
  }

  .unit {
    padding: 10px 12px;
    background: var(--bg);
    color: var(--text-secondary);
    font-size: 14px;
    border-left: 1px solid var(--border);
  }
}

.toggle-group {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;

  button {
    flex: 1;
    padding: 10px 16px;
    border: none;
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;

    &.active {
      background: #333;
      color: white;
    }

    &:not(:last-child) {
      border-right: 1px solid var(--border);
    }
  }

  &.three button {
    padding: 10px 12px;
  }
}

.extra-info {
  padding: 14px;
  background: var(--bg);
  border-radius: 10px;

  .info-item {
    display: flex;
    justify-content: space-between;
    font-size: 14px;

    .label {
      color: var(--text-secondary);
    }

    .value {
      color: var(--text);
      font-weight: 500;
    }
  }
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

.modal-content {
  background: var(--card-bg);
  border-radius: 12px;
  width: 90%;
  max-width: 360px;
  max-height: 80vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border);

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
  }

  .close-btn {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 50%;
    background: var(--bg);
    color: var(--text);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.modal-body {
  padding: 16px;
}

.rate-section {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  h4 {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 10px;
  }
}

.rate-list {
  background: var(--bg);
  border-radius: 8px;
  overflow: hidden;
}

.rate-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  font-size: 13px;
  color: var(--text);
  border-bottom: 1px solid var(--border);

  &:last-child {
    border-bottom: none;
  }

  .rate {
    font-weight: 600;
    color: var(--primary-color);
  }
}

// 深色模式适配
:root[data-theme="dark"] {
  .toggle-group button.active {
    background: #555;
  }
}
</style>
