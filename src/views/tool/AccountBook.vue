<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()

interface Record {
  id: number
  type: 'expense' | 'income'
  category: string
  amount: number
  note: string
  date: string
}

const records = ref<Record[]>([])
const showAddPage = ref(false)
const showReportModal = ref(false)
const currentMonth = ref(new Date().toISOString().slice(0, 7))

// 记账表单
const activeTab = ref<'expense' | 'income'>('expense')
const selectedCategory = ref('消费')
const amount = ref('0')
const note = ref('')
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const showDatePicker = ref(false)
const showDeleteConfirm = ref(false)
const deleteTargetId = ref<number | null>(null)

const expenseCategories = [
  { name: '消费', icon: '💳' },
  { name: '餐饮', icon: '🍜' },
  { name: '购物', icon: '🛍️' },
  { name: '住房', icon: '🏠' },
  { name: '交通', icon: '🚗' },
  { name: '通讯', icon: '📱' },
  { name: '娱乐', icon: '🎮' },
  { name: '医疗', icon: '💊' },
  { name: '教育', icon: '📚' },
  { name: '其他', icon: '📝' },
]

const incomeCategories = [
  { name: '工资', icon: '💰' },
  { name: '奖金', icon: '🎁' },
  { name: '投资', icon: '📈' },
  { name: '兼职', icon: '💼' },
  { name: '红包', icon: '🧧' },
  { name: '其他', icon: '📝' },
]

const currentCategories = computed(() => 
  activeTab.value === 'expense' ? expenseCategories : incomeCategories
)

const monthlyStats = computed(() => {
  const monthRecords = records.value.filter(r => r.date.startsWith(currentMonth.value))
  const expense = monthRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
  const income = monthRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
  return { expense, income }
})

const groupedRecords = computed(() => {
  const monthRecords = records.value
    .filter(r => r.date.startsWith(currentMonth.value))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
  
  const groups: { date: string; records: Record[]; dayExpense: number; dayIncome: number }[] = []
  monthRecords.forEach(record => {
    const existing = groups.find(g => g.date === record.date)
    if (existing) {
      existing.records.push(record)
      if (record.type === 'expense') existing.dayExpense += record.amount
      else existing.dayIncome += record.amount
    } else {
      groups.push({ 
        date: record.date, 
        records: [record],
        dayExpense: record.type === 'expense' ? record.amount : 0,
        dayIncome: record.type === 'income' ? record.amount : 0
      })
    }
  })
  return groups
})

const reportData = computed(() => {
  const monthRecords = records.value.filter(r => r.date.startsWith(currentMonth.value))
  const expenseByCategory: { [key: string]: number } = {}
  const incomeByCategory: { [key: string]: number } = {}
  monthRecords.forEach(r => {
    if (r.type === 'expense') expenseByCategory[r.category] = (expenseByCategory[r.category] || 0) + r.amount
    else incomeByCategory[r.category] = (incomeByCategory[r.category] || 0) + r.amount
  })
  return { expenseByCategory, incomeByCategory }
})

const formatDateHeader = (dateStr: string) => {
  const date = new Date(dateStr)
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const today = new Date().toISOString().slice(0, 10)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekDays[date.getDay()]}${dateStr === today ? ' 今天' : ''}`
}

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split('-')
  return `${year}年${parseInt(month)}月`
}

const prevMonth = () => {
  const date = new Date(currentMonth.value + '-01')
  date.setMonth(date.getMonth() - 1)
  currentMonth.value = date.toISOString().slice(0, 7)
}

const nextMonth = () => {
  const date = new Date(currentMonth.value + '-01')
  date.setMonth(date.getMonth() + 1)
  currentMonth.value = date.toISOString().slice(0, 7)
}

const openAddPage = () => {
  amount.value = '0'
  note.value = ''
  selectedDate.value = new Date().toISOString().slice(0, 10)
  activeTab.value = 'expense'
  selectedCategory.value = expenseCategories[0].name
  showAddPage.value = true
}

const switchTab = (tab: 'expense' | 'income') => {
  activeTab.value = tab
  selectedCategory.value = currentCategories.value[0]?.name || ''
}

const inputDigit = (digit: string) => {
  if (amount.value === '0') amount.value = digit
  else if (amount.value.includes('.') && amount.value.split('.')[1].length >= 2) return
  else amount.value += digit
}

const inputDecimal = () => {
  if (!amount.value.includes('.')) amount.value += '.'
}

const backspace = () => {
  amount.value = amount.value.length > 1 ? amount.value.slice(0, -1) : '0'
}

const clearAmount = () => { amount.value = '0' }

const saveRecord = () => {
  const amountNum = parseFloat(amount.value)
  if (amountNum <= 0 || isNaN(amountNum)) return
  records.value.push({
    id: Date.now(),
    type: activeTab.value,
    category: selectedCategory.value,
    amount: amountNum,
    note: note.value,
    date: selectedDate.value
  })
  saveToStorage()
  showAddPage.value = false
}

const deleteRecord = (id: number) => {
  deleteTargetId.value = id
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (deleteTargetId.value) {
    records.value = records.value.filter(r => r.id !== deleteTargetId.value)
    saveToStorage()
  }
  showDeleteConfirm.value = false
  deleteTargetId.value = null
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  deleteTargetId.value = null
}

const saveToStorage = () => localStorage.setItem('accountBook', JSON.stringify(records.value))
const loadFromStorage = () => {
  const data = localStorage.getItem('accountBook')
  if (data) records.value = JSON.parse(data)
}

const getCategoryIcon = (category: string, type: string) => {
  const cats = type === 'expense' ? expenseCategories : incomeCategories
  return cats.find(c => c.name === category)?.icon || '💰'
}

onMounted(() => loadFromStorage())
</script>

<template>
  <div class="account-page">
    <!-- 主页面：账单列表 -->
    <div class="list-page" v-if="!showAddPage">
      <header class="header">
        <button class="back-btn" @click="router.back()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="title">记账本</h1>
        <ThemeToggle />
      </header>

      <main class="main">
        <div class="stats-card">
          <div class="month-nav">
            <button @click="prevMonth">‹</button>
            <span>{{ formatMonth(currentMonth) }}</span>
            <button @click="nextMonth">›</button>
          </div>
          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-label">本月支出(元)</div>
              <div class="stat-value expense">-{{ monthlyStats.expense.toFixed(2) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">本月收入(元)</div>
              <div class="stat-value income">+{{ monthlyStats.income.toFixed(2) }}</div>
            </div>
          </div>
          <button class="report-btn" @click="showReportModal = true">📊 月度报表</button>
        </div>

        <div class="records-list" v-if="groupedRecords.length > 0">
          <div v-for="group in groupedRecords" :key="group.date" class="date-group">
            <div class="date-header">
              <span>{{ formatDateHeader(group.date) }}</span>
              <span class="day-stats">支出:{{ group.dayExpense.toFixed(2) }} 收入:{{ group.dayIncome.toFixed(2) }}</span>
            </div>
            <div v-for="record in group.records" :key="record.id" class="record-item">
              <div class="record-left">
                <div class="record-icon">{{ getCategoryIcon(record.category, record.type) }}</div>
                <div class="record-info">
                  <span class="record-category">{{ record.category }}</span>
                  <span class="record-note" v-if="record.note">{{ record.note }}</span>
                </div>
              </div>
              <div class="record-right">
                <span :class="['record-amount', record.type]">{{ record.type === 'expense' ? '-' : '+' }}{{ record.amount.toFixed(2) }}</span>
                <button class="delete-item-btn" @click.stop="deleteRecord(record.id)" title="删除">🗑️</button>
              </div>
            </div>
          </div>
        </div>

        <div class="empty-state" v-else>
          <div class="empty-icon">📋</div>
          <p>暂无账单记录</p>
          <p class="empty-hint">点击右下角按钮开始记账</p>
        </div>

        <button class="add-btn" @click="openAddPage">+</button>
      </main>
    </div>

    <!-- 记账页面 -->
    <div class="add-page" v-else>
      <header class="add-header">
        <button class="back-btn-light" @click="showAddPage = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1>记一笔</h1>
        <div style="width:40px"></div>
      </header>

      <div class="type-tabs">
        <button :class="{ active: activeTab === 'expense' }" @click="switchTab('expense')">支出</button>
        <button :class="{ active: activeTab === 'income' }" @click="switchTab('income')">收入</button>
      </div>

      <div class="amount-section">
        <div class="current-cat">
          <span class="cat-badge">{{ getCategoryIcon(selectedCategory, activeTab) }}</span>
          <span>{{ selectedCategory }}</span>
        </div>
        <div class="amount-display">¥ {{ amount }}</div>
      </div>

      <div class="category-grid">
        <div v-for="cat in currentCategories" :key="cat.name" 
          :class="['cat-item', { active: selectedCategory === cat.name }]"
          @click="selectedCategory = cat.name">
          <span class="cat-icon">{{ cat.icon }}</span>
          <span class="cat-name">{{ cat.name }}</span>
        </div>
      </div>

      <div class="input-bar">
        <div class="note-field">
          <span>📝</span>
          <input type="text" v-model="note" placeholder="添加备注...">
        </div>
        <div class="date-field" @click="showDatePicker = !showDatePicker">
          <span>📅</span>
          <span>{{ selectedDate }}</span>
        </div>
      </div>
      <input v-if="showDatePicker" type="date" v-model="selectedDate" class="date-picker" @change="showDatePicker = false">

      <div class="numpad">
        <button @click="inputDigit('7')">7</button>
        <button @click="inputDigit('8')">8</button>
        <button @click="inputDigit('9')">9</button>
        <button class="func" @click="backspace">⌫</button>
        <button @click="inputDigit('4')">4</button>
        <button @click="inputDigit('5')">5</button>
        <button @click="inputDigit('6')">6</button>
        <button class="confirm" @click="saveRecord">确认</button>
        <button @click="inputDigit('1')">1</button>
        <button @click="inputDigit('2')">2</button>
        <button @click="inputDigit('3')">3</button>
        <button @click="clearAmount">C</button>
        <button @click="inputDigit('0')">0</button>
        <button @click="inputDecimal">.</button>
      </div>
    </div>

    <!-- 月度报表弹窗 -->
    <div class="modal-overlay" v-if="showReportModal" @click.self="showReportModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ formatMonth(currentMonth) }} 报表</h3>
          <button @click="showReportModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="report-summary">
            <div><span>总支出</span><span class="expense">-{{ monthlyStats.expense.toFixed(2) }}</span></div>
            <div><span>总收入</span><span class="income">+{{ monthlyStats.income.toFixed(2) }}</span></div>
            <div><span>结余</span><span :class="monthlyStats.income - monthlyStats.expense >= 0 ? 'income' : 'expense'">{{ (monthlyStats.income - monthlyStats.expense).toFixed(2) }}</span></div>
          </div>
          <div class="report-detail" v-if="Object.keys(reportData.expenseByCategory).length">
            <h4>支出明细</h4>
            <div v-for="(amt, cat) in reportData.expenseByCategory" :key="cat" class="detail-row">
              <span>{{ cat }}</span><span class="expense">-{{ amt.toFixed(2) }}</span>
            </div>
          </div>
          <div class="report-detail" v-if="Object.keys(reportData.incomeByCategory).length">
            <h4>收入明细</h4>
            <div v-for="(amt, cat) in reportData.incomeByCategory" :key="cat" class="detail-row">
              <span>{{ cat }}</span><span class="income">+{{ amt.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div class="confirm-overlay" v-if="showDeleteConfirm" @click.self="cancelDelete">
      <div class="confirm-modal">
        <div class="confirm-icon">🗑️</div>
        <h3>确认删除</h3>
        <p>确定要删除这条账单记录吗？删除后无法恢复。</p>
        <div class="confirm-actions">
          <button class="cancel-btn" @click="cancelDelete">取消</button>
          <button class="delete-confirm-btn" @click="confirmDelete">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.account-page { height: 100vh; background: var(--bg); display: flex; flex-direction: column; overflow: hidden; }
.list-page { height: 100%; display: flex; flex-direction: column; overflow: hidden; }

.header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.back-btn {
  width: 36px; height: 36px; border: none; border-radius: 50%;
  background: var(--card-bg); color: var(--text); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  svg { width: 18px; height: 18px; }
  &:hover { background: var(--hover); }
}
.title { font-size: 20px; font-weight: 600; color: var(--text); }

.main { flex: 1; max-width: 500px; margin: 0 auto; padding: 12px; width: 100%; overflow: auto; position: relative; }

.stats-card {
  background: var(--card-bg); border-radius: 12px; padding: 14px;
  margin-bottom: 12px; box-shadow: 0 4px 16px var(--shadow);
}
.month-nav {
  display: flex; justify-content: center; align-items: center; gap: 16px; margin-bottom: 10px;
  button { width: 28px; height: 28px; border: none; border-radius: 50%; background: var(--bg); color: var(--text); font-size: 16px; cursor: pointer; }
  span { font-size: 14px; font-weight: 500; color: var(--text); }
}
.stats-row { display: flex; justify-content: space-around; margin-bottom: 10px; }
.stat-item { text-align: center; }
.stat-label { font-size: 13px; color: var(--text-secondary); margin-bottom: 4px; }
.stat-value { font-size: 20px; font-weight: 700; &.expense { color: #e74c3c; } &.income { color: #27ae60; } }
.report-btn {
  width: 100%; padding: 12px; border: none; border-radius: 8px;
  background: var(--primary-color); color: white; font-size: 15px; cursor: pointer;
  &:hover { opacity: 0.9; }
}

.records-list { background: var(--card-bg); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px var(--shadow); }
.date-group:not(:last-child) { border-bottom: 1px solid var(--border); }
.date-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; background: var(--bg); font-size: 12px; color: var(--text-secondary);
}
.day-stats { font-size: 11px; }
.record-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; transition: background 0.2s;
  &:hover { background: var(--hover); }
}
.record-left { display: flex; align-items: center; gap: 10px; flex: 1; }
.record-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--bg); display: flex; align-items: center; justify-content: center; font-size: 18px; }
.record-info { display: flex; flex-direction: column; gap: 2px; }
.record-category { font-size: 15px; color: var(--text); }
.record-note { font-size: 13px; color: var(--text-secondary); }
.record-right { display: flex; align-items: center; gap: 8px; }
.record-amount { font-size: 17px; font-weight: 600; &.expense { color: #e74c3c; } &.income { color: #27ae60; } }
.delete-item-btn {
  background: none; border: none; font-size: 14px; cursor: pointer;
  opacity: 0.3; transition: all 0.2s; padding: 6px;
  border-radius: 6px;
  &:hover { opacity: 1; background: rgba(231, 76, 60, 0.1); }
}

.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
.empty-icon { font-size: 56px; margin-bottom: 12px; opacity: 0.6; }
.empty-hint { font-size: 12px; margin-top: 6px; opacity: 0.7; }

.add-btn {
  position: fixed; bottom: 24px; right: 24px; width: 52px; height: 52px;
  border: none; border-radius: 50%; background: var(--primary-color); color: white;
  font-size: 28px; cursor: pointer; box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover { transform: scale(1.1); box-shadow: 0 8px 25px rgba(74, 144, 226, 0.5); }
}

/* 记账页面 */
.add-page { height: 100%; background: var(--bg); display: flex; flex-direction: column; overflow: hidden; }
.add-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; background: var(--card-bg); flex-shrink: 0;
  h1 { font-size: 16px; color: var(--text); }
}
.back-btn-light {
  width: 36px; height: 36px; border: none; border-radius: 50%;
  background: transparent; color: var(--text); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  svg { width: 18px; height: 18px; }
}

.type-tabs {
  display: flex; justify-content: center; gap: 24px; padding: 12px; background: var(--card-bg); flex-shrink: 0;
  button {
    background: none; border: none; font-size: 14px; color: var(--text-secondary);
    padding: 6px 16px; cursor: pointer; position: relative; transition: color 0.2s;
    &.active {
      color: var(--primary-color); font-weight: 600;
      &::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 24px; height: 2px; background: var(--primary-color); border-radius: 2px; }
    }
  }
}

.amount-section {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px; margin: 10px 12px; background: var(--card-bg); border-radius: 12px; flex-shrink: 0;
}
.current-cat { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text); }
.cat-badge { width: 32px; height: 32px; border-radius: 8px; background: var(--primary-color); display: flex; align-items: center; justify-content: center; font-size: 16px; }
.amount-display { font-size: 28px; font-weight: 700; color: var(--text); }

.category-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;
  padding: 0 12px 10px; max-width: 500px; margin: 0 auto; flex-shrink: 0;
}
.cat-item {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 8px 4px; border-radius: 10px; cursor: pointer; transition: all 0.2s;
  &:hover { background: var(--hover); }
  &.active {
    background: var(--primary-color);
    .cat-icon { background: white; }
    .cat-name { color: white; }
  }
}
.cat-icon {
  width: 40px; height: 40px; border-radius: 12px; background: var(--card-bg);
  display: flex; align-items: center; justify-content: center; font-size: 20px;
  box-shadow: 0 2px 8px var(--shadow);
}
.cat-name { font-size: 11px; color: var(--text-secondary); }

.input-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; background: var(--card-bg); margin: 0 12px; border-radius: 10px; flex-shrink: 0;
}
.note-field {
  display: flex; align-items: center; gap: 6px; flex: 1;
  input { flex: 1; background: none; border: none; color: var(--text); font-size: 13px; outline: none; }
  input::placeholder { color: var(--text-secondary); }
}
.date-field { display: flex; align-items: center; gap: 4px; color: var(--text-secondary); font-size: 12px; cursor: pointer; }
.date-picker { margin: 6px 12px; padding: 8px; border: 1px solid var(--border); border-radius: 8px; background: var(--card-bg); color: var(--text); flex-shrink: 0; }

.numpad {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
  background: var(--border); margin-top: auto; flex-shrink: 0;
  button {
    background: var(--card-bg); border: none; padding: 16px; font-size: 22px;
    color: var(--text); cursor: pointer; transition: background 0.1s;
    &:hover { background: var(--hover); }
    &:active { background: var(--bg); }
    &.func { font-size: 20px; color: var(--text-secondary); }
    &.confirm { background: var(--primary-color); color: white; grid-row: span 2; font-size: 18px; font-weight: 600; }
  }
}

/* 弹窗 */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal {
  background: var(--card-bg); border-radius: 20px; width: 90%; max-width: 400px;
  max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px; border-bottom: 1px solid var(--border);
  h3 { font-size: 18px; color: var(--text); }
  button { width: 32px; height: 32px; border: none; border-radius: 50%; background: var(--bg); color: var(--text-secondary); font-size: 20px; cursor: pointer; }
}
.modal-body { padding: 20px; }
.report-summary {
  background: var(--bg); border-radius: 14px; padding: 16px; margin-bottom: 20px;
  div { display: flex; justify-content: space-between; padding: 10px 0; &:not(:last-child) { border-bottom: 1px solid var(--border); } }
  span:first-child { color: var(--text-secondary); }
  .expense { color: #e74c3c; font-weight: 600; }
  .income { color: #27ae60; font-weight: 600; }
}
.report-detail {
  margin-bottom: 16px;
  h4 { font-size: 14px; color: var(--text-secondary); margin-bottom: 10px; padding-left: 4px; }
}
.detail-row {
  display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border);
  span:first-child { color: var(--text); }
  .expense { color: #e74c3c; } .income { color: #27ae60; }
}

/* 删除确认弹窗 */
.confirm-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); display: flex; align-items: center;
  justify-content: center; z-index: 1000;
}
.confirm-modal {
  background: var(--card-bg); border-radius: 20px; padding: 30px;
  width: 90%; max-width: 320px; text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.confirm-icon { font-size: 48px; margin-bottom: 16px; }
.confirm-modal h3 { font-size: 20px; color: var(--text); margin-bottom: 10px; }
.confirm-modal p { font-size: 15px; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.5; }
.confirm-actions { display: flex; gap: 12px; }
.cancel-btn {
  flex: 1; padding: 14px; border: 1px solid var(--border); border-radius: 10px;
  background: var(--bg); color: var(--text); font-size: 16px; cursor: pointer;
  &:hover { background: var(--hover); }
}
.delete-confirm-btn {
  flex: 1; padding: 14px; border: none; border-radius: 10px;
  background: #e74c3c; color: white; font-size: 16px; cursor: pointer;
  &:hover { background: #c0392b; }
}
</style>
