<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()

const salary = ref<number | null>(null) // 税前工资
const socialInsurance = ref<number | null>(null) // 五险一金
const specialDeduction = ref<number | null>(null) // 专项附加扣除
const threshold = 5000 // 起征点

// 2024年个税税率表
const taxBrackets = [
  { min: 0, max: 36000, rate: 0.03, deduction: 0 },
  { min: 36000, max: 144000, rate: 0.1, deduction: 2520 },
  { min: 144000, max: 300000, rate: 0.2, deduction: 16920 },
  { min: 300000, max: 420000, rate: 0.25, deduction: 31920 },
  { min: 420000, max: 660000, rate: 0.3, deduction: 52920 },
  { min: 660000, max: 960000, rate: 0.35, deduction: 85920 },
  { min: 960000, max: Infinity, rate: 0.45, deduction: 181920 },
]

const taxResult = computed(() => {
  const salaryVal = salary.value || 0
  const insuranceVal = socialInsurance.value || 0
  const deductionVal = specialDeduction.value || 0
  
  if (salaryVal <= 0) {
    return null
  }
  
  // 月应纳税所得额
  const monthlyTaxableIncome = salaryVal - insuranceVal - deductionVal - threshold
  
  if (monthlyTaxableIncome <= 0) {
    return {
      taxableIncome: 0,
      tax: 0,
      afterTax: salaryVal - insuranceVal,
      rate: 0
    }
  }
  
  // 年应纳税所得额
  const yearlyTaxableIncome = monthlyTaxableIncome * 12
  
  // 查找适用税率
  let bracket = taxBrackets[0]
  for (const b of taxBrackets) {
    if (yearlyTaxableIncome > b.min && yearlyTaxableIncome <= b.max) {
      bracket = b
      break
    }
    if (yearlyTaxableIncome > b.max) {
      bracket = b
    }
  }
  
  // 年度应纳税额
  const yearlyTax = yearlyTaxableIncome * bracket.rate - bracket.deduction
  // 月度应纳税额
  const monthlyTax = yearlyTax / 12
  
  return {
    taxableIncome: monthlyTaxableIncome,
    tax: Math.max(0, monthlyTax),
    afterTax: salaryVal - insuranceVal - Math.max(0, monthlyTax),
    rate: bracket.rate * 100
  }
})

const formatMoney = (num: number) => {
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
      <h1 class="title">个税计算</h1>
      <ThemeToggle />
    </header>
    
    <main class="tool-content">
      <div class="input-section">
        <div class="input-row">
          <label>税前月薪（元）</label>
          <div class="input-field">
            <input type="number" v-model.number="salary" placeholder="请输入" />
            <span class="unit">元</span>
          </div>
        </div>
        
        <div class="input-row">
          <label>五险一金（元）</label>
          <div class="input-field">
            <input type="number" v-model.number="socialInsurance" placeholder="0" />
            <span class="unit">元</span>
          </div>
        </div>
        
        <div class="input-row">
          <label>专项附加扣除（元）</label>
          <div class="input-field">
            <input type="number" v-model.number="specialDeduction" placeholder="0" />
            <span class="unit">元</span>
          </div>
        </div>
        
        <div class="input-row">
          <label>起征点（元）</label>
          <div class="input-field disabled">
            <input type="number" :value="threshold" disabled />
            <span class="unit">元</span>
          </div>
        </div>
      </div>

      <div class="hint-text">专项附加扣除包括：子女教育、继续教育、住房贷款利息、住房租金、赡养老人等</div>
      
      <div class="result-section" v-if="taxResult">
        <div class="result-main">
          <div class="label">税后月薪</div>
          <div class="value">¥ {{ formatMoney(taxResult.afterTax) }}</div>
        </div>
        
        <div class="result-details">
          <div class="detail-item">
            <span class="label">应纳税所得额</span>
            <span class="value">¥ {{ formatMoney(taxResult.taxableIncome) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">适用税率</span>
            <span class="value">{{ taxResult.rate }}%</span>
          </div>
          <div class="detail-item">
            <span class="label">应缴个税</span>
            <span class="value highlight">¥ {{ formatMoney(taxResult.tax) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">五险一金</span>
            <span class="value">¥ {{ formatMoney(socialInsurance || 0) }}</span>
          </div>
        </div>
      </div>
        
      <div class="tax-table">
        <div class="table-title">个税税率表（年度）</div>
        <table>
          <thead>
            <tr>
              <th>级数</th>
              <th>应纳税所得额</th>
              <th>税率</th>
              <th>速算扣除</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(b, i) in taxBrackets" :key="i" :class="{ active: taxResult && taxResult.rate === b.rate * 100 && taxResult.tax > 0 }">
              <td>{{ i + 1 }}</td>
              <td>{{ b.max === Infinity ? `>${b.min/10000}万` : `${b.min/10000}-${b.max/10000}万` }}</td>
              <td>{{ b.rate * 100 }}%</td>
              <td>{{ b.deduction }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
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

.input-section {
  margin-bottom: 12px;
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
  width: 160px;

  &.disabled {
    opacity: 0.6;
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
    }

    &:disabled {
      cursor: not-allowed;
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

.hint-text {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 14px;
  padding: 0 4px;
  opacity: 0.8;
}

.result-section {
  padding: 16px;
  background: var(--bg);
  border-radius: 10px;
  margin-bottom: 14px;
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

.result-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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

.tax-table {
  flex: 1;
  overflow: auto;
  
  .table-title {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 10px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    
    th, td {
      padding: 10px 6px;
      text-align: center;
      border-bottom: 1px solid var(--border);
    }
    
    th {
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 12px;
    }
    
    td {
      color: var(--text);
    }
    
    tr.active {
      background: var(--primary-color);
      
      td {
        color: white;
      }
    }
  }
}
</style>
