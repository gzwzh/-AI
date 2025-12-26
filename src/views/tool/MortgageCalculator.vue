<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()

// 贷款类型：商业贷款、公积金、组合贷款
const loanType = ref<'commercial' | 'fund' | 'combined'>('commercial')

// 商业贷款参数
const commercialAmount = ref<number | null>(null) // 万元
const commercialRateType = ref<'lpr' | 'base'>('lpr') // LPR 或 基准利率
const commercialLpr = ref(3.5) // LPR利率
const commercialBasisPoints = ref(0) // 基点 (‰)
const commercialBaseRate = ref(4.9) // 基准利率

// 公积金贷款参数
const fundAmount = ref<number | null>(null) // 万元
const fundRate = ref(2.6) // 公积金利率

// 通用参数
const loanYears = ref<number | null>(null)
const paymentType = ref<'equal' | 'principal'>('equal') // 等额本息 / 等额本金

// 显示利率表弹窗
const showRateTable = ref(false)

// 商业贷款实际利率
const commercialRate = computed(() => {
  if (commercialRateType.value === 'lpr') {
    return commercialLpr.value + commercialBasisPoints.value / 10 // 基点转换为百分比
  }
  return commercialBaseRate.value
})

// 计算单笔贷款
const calculateLoan = (amount: number, rate: number, years: number) => {
  const P = amount * 10000
  const r = rate / 100 / 12
  const n = years * 12

  if (r === 0) {
    return {
      monthlyPayment: P / n,
      firstMonthPayment: P / n,
      lastMonthPayment: P / n,
      totalPayment: P,
      totalInterest: 0,
      monthlyDecrease: 0
    }
  }

  // 等额本息
  const equalMonthly = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
  const equalTotal = equalMonthly * n
  const equalInterest = equalTotal - P

  // 等额本金
  const monthlyPrincipal = P / n
  const firstMonth = monthlyPrincipal + P * r
  const lastMonth = monthlyPrincipal + monthlyPrincipal * r
  const principalInterest = (n + 1) * P * r / 2
  const principalTotal = P + principalInterest
  const monthlyDecrease = monthlyPrincipal * r

  return {
    monthlyPayment: equalMonthly,
    firstMonthPayment: firstMonth,
    lastMonthPayment: lastMonth,
    totalPayment: paymentType.value === 'equal' ? equalTotal : principalTotal,
    totalInterest: paymentType.value === 'equal' ? equalInterest : principalInterest,
    monthlyDecrease
  }
}

// 计算结果
const result = computed(() => {
  const years = loanYears.value || 0
  if (years <= 0) return null

  if (loanType.value === 'commercial') {
    const amount = commercialAmount.value || 0
    if (amount <= 0) return null
    const calc = calculateLoan(amount, commercialRate.value, years)
    return {
      type: 'single',
      ...calc,
      loanAmount: amount * 10000
    }
  }

  if (loanType.value === 'fund') {
    const amount = fundAmount.value || 0
    if (amount <= 0) return null
    const calc = calculateLoan(amount, fundRate.value, years)
    return {
      type: 'single',
      ...calc,
      loanAmount: amount * 10000
    }
  }

  // 组合贷款
  const cAmount = commercialAmount.value || 0
  const fAmount = fundAmount.value || 0
  if (cAmount <= 0 && fAmount <= 0) return null

  const commercialCalc = cAmount > 0 ? calculateLoan(cAmount, commercialRate.value, years) : null
  const fundCalc = fAmount > 0 ? calculateLoan(fAmount, fundRate.value, years) : null

  const monthlyPayment = (commercialCalc?.monthlyPayment || 0) + (fundCalc?.monthlyPayment || 0)
  const firstMonthPayment = (commercialCalc?.firstMonthPayment || 0) + (fundCalc?.firstMonthPayment || 0)
  const lastMonthPayment = (commercialCalc?.lastMonthPayment || 0) + (fundCalc?.lastMonthPayment || 0)
  const totalPayment = (commercialCalc?.totalPayment || 0) + (fundCalc?.totalPayment || 0)
  const totalInterest = (commercialCalc?.totalInterest || 0) + (fundCalc?.totalInterest || 0)

  return {
    type: 'combined',
    monthlyPayment,
    firstMonthPayment,
    lastMonthPayment,
    totalPayment,
    totalInterest,
    loanAmount: (cAmount + fAmount) * 10000,
    commercial: commercialCalc,
    fund: fundCalc,
    commercialAmount: cAmount * 10000,
    fundAmount: fAmount * 10000
  }
})

const formatMoney = (num: number) => {
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const adjustBasisPoints = (delta: number) => {
  commercialBasisPoints.value = Math.max(-100, Math.min(300, commercialBasisPoints.value + delta))
}

// 利率表数据
const rateTableData = {
  lpr: [
    { period: '1年期LPR', rate: '3.1%' },
    { period: '5年期以上LPR', rate: '3.5%' },
  ],
  fund: [
    { period: '5年以下（含5年）', rate: '2.6%' },
    { period: '5年以上', rate: '3.1%' },
  ]
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
      <h1 class="title">房贷计算</h1>
      <button class="rate-table-btn" @click="showRateTable = true">利率表</button>
    </header>
    
    <main class="tool-content">
      <!-- 贷款类型切换 -->
      <div class="loan-type-tabs">
        <button :class="{ active: loanType === 'commercial' }" @click="loanType = 'commercial'">商业贷款</button>
        <button :class="{ active: loanType === 'fund' }" @click="loanType = 'fund'">公积金</button>
        <button :class="{ active: loanType === 'combined' }" @click="loanType = 'combined'">组合贷款</button>
      </div>

      <div class="input-section">
        <!-- 公积金贷款金额（公积金和组合贷款显示） -->
        <div class="input-row" v-if="loanType === 'fund' || loanType === 'combined'">
          <label>{{ loanType === 'combined' ? '公积金贷款金额（万元）' : '贷款金额（万元）' }}</label>
          <div class="input-field">
            <input type="number" v-model.number="fundAmount" placeholder="" />
            <span class="unit">万元</span>
          </div>
        </div>

        <!-- 公积金利率（公积金和组合贷款显示） -->
        <div class="input-row" v-if="loanType === 'fund' || loanType === 'combined'">
          <label>{{ loanType === 'combined' ? '公积金贷款利率（%）' : '贷款利率（%）' }}</label>
          <div class="input-field">
            <input type="number" v-model.number="fundRate" step="0.01" />
            <span class="unit">%</span>
          </div>
        </div>

        <!-- 商业贷款金额（商业和组合贷款显示） -->
        <div class="input-row" v-if="loanType === 'commercial' || loanType === 'combined'">
          <label>{{ loanType === 'combined' ? '商业贷款金额（万元）' : '贷款金额（万元）' }}</label>
          <div class="input-field">
            <input type="number" v-model.number="commercialAmount" placeholder="" />
            <span class="unit">万元</span>
          </div>
        </div>

        <!-- 商业贷款利率方式（商业和组合贷款显示） -->
        <div class="input-row" v-if="loanType === 'commercial' || loanType === 'combined'">
          <label>商业贷款利率方式</label>
          <div class="toggle-group">
            <button :class="{ active: commercialRateType === 'lpr' }" @click="commercialRateType = 'lpr'">LPR</button>
            <button :class="{ active: commercialRateType === 'base' }" @click="commercialRateType = 'base'">基准利率</button>
          </div>
        </div>

        <!-- LPR利率输入 -->
        <div class="input-row" v-if="(loanType === 'commercial' || loanType === 'combined') && commercialRateType === 'lpr'">
          <label>商业LPR（%）</label>
          <div class="input-field">
            <input type="number" v-model.number="commercialLpr" step="0.01" />
            <span class="unit">%</span>
          </div>
        </div>

        <!-- 基点调整 -->
        <div class="input-row" v-if="(loanType === 'commercial' || loanType === 'combined') && commercialRateType === 'lpr'">
          <label>商业基点（‰）</label>
          <div class="basis-points-input">
            <button class="bp-btn" @click="adjustBasisPoints(5)">+</button>
            <button class="bp-btn" @click="adjustBasisPoints(-5)">-</button>
            <input type="number" v-model.number="commercialBasisPoints" />
            <span class="unit">‰</span>
          </div>
        </div>

        <!-- 基准利率输入 -->
        <div class="input-row" v-if="(loanType === 'commercial' || loanType === 'combined') && commercialRateType === 'base'">
          <label>{{ loanType === 'combined' ? '商业贷款利率（%）' : '贷款利率（%）' }}</label>
          <div class="input-field">
            <input type="number" v-model.number="commercialBaseRate" step="0.01" />
            <span class="unit">%</span>
          </div>
        </div>

        <!-- 贷款年限 -->
        <div class="input-row">
          <label>贷款年限（年）</label>
          <div class="input-field">
            <input type="number" v-model.number="loanYears" placeholder="" />
            <span class="unit">年</span>
          </div>
        </div>

        <!-- 还款方式 -->
        <div class="input-row">
          <label>贷款方式</label>
          <div class="toggle-group">
            <button :class="{ active: paymentType === 'equal' }" @click="paymentType = 'equal'">等额本息</button>
            <button :class="{ active: paymentType === 'principal' }" @click="paymentType = 'principal'">等额本金</button>
          </div>
        </div>
      </div>

      <!-- 计算按钮 -->
      <button class="calc-btn">计 算</button>

      <!-- 结果显示 -->
      <div class="result-section" v-if="result">
        <template v-if="paymentType === 'equal'">
          <div class="result-main">
            <div class="label">每月还款</div>
            <div class="value">¥ {{ formatMoney(result.monthlyPayment) }}</div>
          </div>
        </template>
        <template v-else>
          <div class="result-main">
            <div class="label">首月还款</div>
            <div class="value">¥ {{ formatMoney(result.firstMonthPayment) }}</div>
          </div>
          <div class="result-sub">
            末月还款：¥ {{ formatMoney(result.lastMonthPayment) }}
          </div>
        </template>

        <div class="result-details">
          <div class="detail-item">
            <span class="label">贷款总额</span>
            <span class="value">¥ {{ formatMoney(result.loanAmount) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">还款总额</span>
            <span class="value">¥ {{ formatMoney(result.totalPayment) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">支付利息</span>
            <span class="value highlight">¥ {{ formatMoney(result.totalInterest) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">还款期数</span>
            <span class="value">{{ (loanYears || 0) * 12 }} 期</span>
          </div>
        </div>

        <!-- 组合贷款明细 -->
        <div class="combined-details" v-if="result.type === 'combined'">
          <div class="combined-item" v-if="result.commercial">
            <div class="combined-title">商业贷款</div>
            <div class="combined-info">
              <span>贷款：¥{{ formatMoney(result.commercialAmount) }}</span>
              <span>月供：¥{{ formatMoney(paymentType === 'equal' ? result.commercial.monthlyPayment : result.commercial.firstMonthPayment) }}</span>
            </div>
          </div>
          <div class="combined-item" v-if="result.fund">
            <div class="combined-title">公积金贷款</div>
            <div class="combined-info">
              <span>贷款：¥{{ formatMoney(result.fundAmount) }}</span>
              <span>月供：¥{{ formatMoney(paymentType === 'equal' ? result.fund.monthlyPayment : result.fund.firstMonthPayment) }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 利率表弹窗 -->
    <div class="modal-overlay" v-if="showRateTable" @click="showRateTable = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>最新贷款利率表</h3>
          <button class="close-btn" @click="showRateTable = false">×</button>
        </div>
        <div class="modal-body">
          <div class="rate-section">
            <h4>LPR利率（2024年）</h4>
            <div class="rate-list">
              <div class="rate-item" v-for="item in rateTableData.lpr" :key="item.period">
                <span>{{ item.period }}</span>
                <span class="rate">{{ item.rate }}</span>
              </div>
            </div>
          </div>
          <div class="rate-section">
            <h4>公积金贷款利率</h4>
            <div class="rate-list">
              <div class="rate-item" v-for="item in rateTableData.fund" :key="item.period">
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

.loan-type-tabs {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 14px;
  flex-shrink: 0;

  button {
    flex: 1;
    padding: 12px;
    border: none;
    background: var(--bg);
    color: var(--text);
    font-size: 15px;
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
}

.input-section {
  margin-bottom: 14px;
  flex-shrink: 0;
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
  width: 150px;

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
}

.basis-points-input {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;

  .bp-btn {
    width: 36px;
    padding: 10px;
    border: none;
    background: #333;
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #444;
    }

    &:not(:last-of-type) {
      border-right: 1px solid var(--border);
    }
  }

  input {
    width: 60px;
    padding: 10px;
    border: none;
    border-left: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 15px;
    text-align: center;
    outline: none;
  }

  .unit {
    padding: 10px 12px;
    background: var(--bg);
    color: var(--text-secondary);
    font-size: 14px;
  }
}

.calc-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: #ff9800;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 16px;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: #f57c00;
  }

  &:active {
    transform: scale(0.98);
  }
}

.result-section {
  padding: 16px;
  background: var(--bg);
  border-radius: 10px;
  flex-shrink: 0;
}

.result-main {
  text-align: center;
  margin-bottom: 12px;

  .label {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }

  .value {
    font-size: 28px;
    font-weight: 700;
    color: var(--primary-color);
  }
}

.result-sub {
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 14px;
}

.result-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .value {
    font-size: 15px;
    font-weight: 600;
    color: var(--text);

    &.highlight {
      color: #e74c3c;
    }
  }
}

.combined-details {
  border-top: 1px solid var(--border);
  padding-top: 12px;
}

.combined-item {
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }

  .combined-title {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  .combined-info {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: var(--text);
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
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border);

  h3 {
    font-size: 18px;
    font-weight: 600;
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
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.modal-body {
  padding: 20px;
}

.rate-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }

  h4 {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 12px;
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
  padding: 12px 16px;
  font-size: 14px;
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
  .loan-type-tabs button.active,
  .toggle-group button.active {
    background: #555;
  }
  .basis-points-input .bp-btn {
    background: #555;
    &:hover { background: #666; }
  }
}
</style>
