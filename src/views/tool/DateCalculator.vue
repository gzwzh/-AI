<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { Solar, Lunar } from 'lunar-javascript'

const router = useRouter()

const mode = ref<'diff' | 'add' | 'convert'>('diff')

// 日期差计算
const date1 = ref(new Date().toISOString().split('T')[0])
const date2 = ref(new Date().toISOString().split('T')[0])

// 日期加减
const baseDate = ref(new Date().toISOString().split('T')[0])
const years = ref(0)
const months = ref(0)
const days = ref(0)

// 日期转换
const convertMode = ref<'solar2lunar' | 'lunar2solar'>('solar2lunar')
const solarDate = ref(new Date().toISOString().split('T')[0])
const lunarYear = ref(new Date().getFullYear())
const lunarMonth = ref(new Date().getMonth() + 1)
const lunarDay = ref(new Date().getDate())
const isLeapMonth = ref(false)

// 计算不包含周末的工作日天数
const getWorkdays = (startDate: Date, endDate: Date) => {
  let count = 0
  const current = new Date(startDate)
  const end = new Date(endDate)
  
  // 确保 start <= end
  if (current > end) {
    [current.setTime(end.getTime()), end.setTime(startDate.getTime())]
  }
  
  while (current <= end) {
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  return count
}

const dateDiff = computed(() => {
  const d1 = new Date(date1.value)
  const d2 = new Date(date2.value)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  const diffYears = Math.floor(diffDays / 365)
  const diffMonths = Math.floor((diffDays % 365) / 30)
  const remainDays = diffDays % 30
  
  const workdays = getWorkdays(d1, d2)
  
  return {
    totalDays: diffDays,
    years: diffYears,
    months: diffMonths,
    days: remainDays,
    weeks: Math.floor(diffDays / 7),
    hours: diffDays * 24,
    minutes: diffDays * 24 * 60,
    workdays: workdays
  }
})

const resultDate = computed(() => {
  const base = new Date(baseDate.value)
  base.setFullYear(base.getFullYear() + years.value)
  base.setMonth(base.getMonth() + months.value)
  base.setDate(base.getDate() + days.value)
  return base
})

// 阳历转阴历
const solarToLunar = computed(() => {
  try {
    const [y, m, d] = solarDate.value.split('-').map(Number)
    const solar = Solar.fromYmd(y, m, d)
    const lunar = solar.getLunar()
    return {
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay(),
      yearInGanZhi: lunar.getYearInGanZhi(),
      monthInChinese: lunar.getMonthInChinese(),
      dayInChinese: lunar.getDayInChinese(),
      yearShengXiao: lunar.getYearShengXiao(),
      isLeap: lunar.getMonth() < 0,
      festivals: lunar.getFestivals(),
      jieQi: lunar.getJieQi()
    }
  } catch {
    return null
  }
})

// 阴历转阳历
const lunarToSolar = computed(() => {
  try {
    const month = isLeapMonth.value ? -lunarMonth.value : lunarMonth.value
    const lunar = Lunar.fromYmd(lunarYear.value, month, lunarDay.value)
    const solar = lunar.getSolar()
    return {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      dateStr: `${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日`,
      weekday: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][solar.getWeek()]
    }
  } catch {
    return null
  }
})

const formatDate = (date: Date) => {
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return {
    date: date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
    weekday: weekDays[date.getDay()]
  }
}

const setToday = (target: 'date1' | 'date2' | 'base' | 'solar') => {
  const today = new Date().toISOString().split('T')[0]
  if (target === 'date1') date1.value = today
  else if (target === 'date2') date2.value = today
  else if (target === 'base') baseDate.value = today
  else solarDate.value = today
}

const setTodayLunar = () => {
  const today = new Date()
  const solar = Solar.fromDate(today)
  const lunar = solar.getLunar()
  lunarYear.value = lunar.getYear()
  lunarMonth.value = Math.abs(lunar.getMonth())
  lunarDay.value = lunar.getDay()
  isLeapMonth.value = lunar.getMonth() < 0
}

// 农历月份选项
const lunarMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const lunarDays = Array.from({ length: 30 }, (_, i) => i + 1)
</script>

<template>
  <div class="tool-page">
    <header class="header">
      <button class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="title">日期计算</h1>
      <ThemeToggle />
    </header>
    
    <main class="tool-content">
      <div class="mode-tabs">
        <button :class="{ active: mode === 'diff' }" @click="mode = 'diff'">日期间隔</button>
        <button :class="{ active: mode === 'add' }" @click="mode = 'add'">日期加减</button>
        <button :class="{ active: mode === 'convert' }" @click="mode = 'convert'">阴阳互转</button>
      </div>
      
      <!-- 日期差计算 -->
      <div v-if="mode === 'diff'" class="calc-area">
        <div class="input-row">
          <label>开始日期</label>
          <div class="date-field">
            <input type="date" v-model="date1" />
            <button class="today-btn" @click="setToday('date1')">今天</button>
          </div>
        </div>
        
        <div class="input-row">
          <label>结束日期</label>
          <div class="date-field">
            <input type="date" v-model="date2" />
            <button class="today-btn" @click="setToday('date2')">今天</button>
          </div>
        </div>
        
        <div class="result-area">
          <div class="result-main">
            <span class="number">{{ dateDiff.totalDays }}</span>
            <span class="unit">天</span>
          </div>
          <div class="result-grid">
            <div class="grid-item">
              <span class="value">{{ dateDiff.years }}</span>
              <span class="label">年</span>
            </div>
            <div class="grid-item">
              <span class="value">{{ dateDiff.months }}</span>
              <span class="label">月</span>
            </div>
            <div class="grid-item">
              <span class="value">{{ dateDiff.days }}</span>
              <span class="label">天</span>
            </div>
            <div class="grid-item">
              <span class="value">{{ dateDiff.weeks }}</span>
              <span class="label">周</span>
            </div>
            <div class="grid-item">
              <span class="value">{{ dateDiff.hours.toLocaleString() }}</span>
              <span class="label">小时</span>
            </div>
            <div class="grid-item">
              <span class="value">{{ dateDiff.minutes.toLocaleString() }}</span>
              <span class="label">分钟</span>
            </div>
          </div>
          <div class="workdays-info">
            <span class="icon">💼</span>
            <span>工作日（不含周末）：<strong>{{ dateDiff.workdays }}</strong> 天</span>
          </div>
        </div>
      </div>
      
      <!-- 日期加减 -->
      <div v-else-if="mode === 'add'" class="calc-area">
        <div class="input-row">
          <label>基准日期</label>
          <div class="date-field">
            <input type="date" v-model="baseDate" />
            <button class="today-btn" @click="setToday('base')">今天</button>
          </div>
        </div>
        
        <div class="adjust-inputs">
          <div class="adjust-item">
            <label>年</label>
            <div class="number-input">
              <button @click="years--">-</button>
              <input type="number" v-model.number="years" />
              <button @click="years++">+</button>
            </div>
          </div>
          <div class="adjust-item">
            <label>月</label>
            <div class="number-input">
              <button @click="months--">-</button>
              <input type="number" v-model.number="months" />
              <button @click="months++">+</button>
            </div>
          </div>
          <div class="adjust-item">
            <label>天</label>
            <div class="number-input">
              <button @click="days--">-</button>
              <input type="number" v-model.number="days" />
              <button @click="days++">+</button>
            </div>
          </div>
        </div>
        
        <div class="result-area">
          <div class="result-date">
            <div class="date">{{ formatDate(resultDate).date }}</div>
            <div class="weekday">{{ formatDate(resultDate).weekday }}</div>
          </div>
        </div>
      </div>

      <!-- 阴阳历互转 -->
      <div v-else class="calc-area">
        <div class="convert-tabs">
          <button :class="{ active: convertMode === 'solar2lunar' }" @click="convertMode = 'solar2lunar'">阳历→阴历</button>
          <button :class="{ active: convertMode === 'lunar2solar' }" @click="convertMode = 'lunar2solar'">阴历→阳历</button>
        </div>

        <!-- 阳历转阴历 -->
        <template v-if="convertMode === 'solar2lunar'">
          <div class="input-row">
            <label>阳历日期</label>
            <div class="date-field">
              <input type="date" v-model="solarDate" />
              <button class="today-btn" @click="setToday('solar')">今天</button>
            </div>
          </div>

          <div class="result-area" v-if="solarToLunar">
            <div class="lunar-result">
              <div class="lunar-main">
                <span class="ganzhi">{{ solarToLunar.yearInGanZhi }}年</span>
                <span class="shengxiao">【{{ solarToLunar.yearShengXiao }}】</span>
              </div>
              <div class="lunar-date">
                {{ solarToLunar.isLeap ? '闰' : '' }}{{ solarToLunar.monthInChinese }}月{{ solarToLunar.dayInChinese }}
              </div>
              <div class="lunar-extra" v-if="solarToLunar.jieQi">
                <span class="tag jieqi">{{ solarToLunar.jieQi }}</span>
              </div>
              <div class="lunar-extra" v-if="solarToLunar.festivals.length">
                <span class="tag festival" v-for="f in solarToLunar.festivals" :key="f">{{ f }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- 阴历转阳历 -->
        <template v-else>
          <div class="input-row">
            <label>农历年</label>
            <div class="input-field">
              <input type="number" v-model.number="lunarYear" min="1900" max="2100" />
              <span class="unit">年</span>
            </div>
          </div>
          <div class="input-row">
            <label>农历月</label>
            <div class="select-field">
              <select v-model.number="lunarMonth">
                <option v-for="m in lunarMonths" :key="m" :value="m">{{ m }}月</option>
              </select>
              <label class="leap-check">
                <input type="checkbox" v-model="isLeapMonth" />
                <span>闰月</span>
              </label>
            </div>
          </div>
          <div class="input-row">
            <label>农历日</label>
            <div class="input-field">
              <select v-model.number="lunarDay">
                <option v-for="d in lunarDays" :key="d" :value="d">{{ d }}</option>
              </select>
              <button class="today-btn small" @click="setTodayLunar">今天</button>
            </div>
          </div>

          <div class="result-area" v-if="lunarToSolar">
            <div class="solar-result">
              <div class="solar-date">{{ lunarToSolar.dateStr }}</div>
              <div class="solar-weekday">{{ lunarToSolar.weekday }}</div>
            </div>
          </div>
          <div class="result-area error" v-else>
            <div class="error-msg">日期无效，请检查输入</div>
          </div>
        </template>
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

.mode-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  flex-shrink: 0;
  
  button {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 8px;
    background: var(--bg);
    color: var(--text-secondary);
    font-size: 15px;
    cursor: pointer;
    transition: all 0.2s;
    
    &.active {
      background: var(--primary-color);
      color: white;
    }
  }
}

.calc-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.input-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);

  &:last-of-type {
    border-bottom: none;
  }

  label {
    font-size: 15px;
    color: var(--text);
    white-space: nowrap;
    flex-shrink: 0;
  }
}

.date-field {
  display: flex;
  gap: 8px;
  align-items: center;

  input[type="date"] {
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    color: var(--text);
    font-size: 15px;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
}

.today-btn {
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: white;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  
  &:hover { opacity: 0.9; }
  &.small { padding: 8px 12px; font-size: 13px; }
}

.input-field {
  display: flex;
  align-items: center;
  gap: 8px;

  input, select {
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    color: var(--text);
    font-size: 15px;
    width: 100px;
    text-align: center;

    &:focus { outline: none; border-color: var(--primary-color); }
  }

  .unit {
    font-size: 14px;
    color: var(--text-secondary);
  }
}

.select-field {
  display: flex;
  align-items: center;
  gap: 10px;

  select {
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    color: var(--text);
    font-size: 15px;
  }
}

.leap-check {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
  }
}

.result-area {
  padding: 16px;
  background: var(--bg);
  border-radius: 10px;
  text-align: center;
  margin-top: 10px;

  &.error {
    background: #fff5f5;
  }
}

.result-main {
  margin-bottom: 14px;
  
  .number {
    font-size: 40px;
    font-weight: 700;
    color: var(--primary-color);
  }
  
  .unit {
    font-size: 18px;
    color: var(--text-secondary);
    margin-left: 6px;
  }
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 14px;
  
  .grid-item {
    display: flex;
    flex-direction: column;
    padding: 10px;
    background: var(--card-bg);
    border-radius: 8px;
    
    .value {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
    }
    
    .label {
      font-size: 13px;
      color: var(--text-secondary);
    }
  }
}

.workdays-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  background: #e8f5e9;
  border-radius: 8px;
  font-size: 14px;
  color: #2e7d32;

  .icon { font-size: 16px; }
  strong { font-weight: 600; }
}

.adjust-inputs {
  display: flex;
  gap: 12px;
  padding: 12px 0;
}

.adjust-item {
  flex: 1;
  
  label {
    display: block;
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 8px;
    text-align: center;
  }
}

.number-input {
  display: flex;
  align-items: center;
  background: var(--bg);
  border-radius: 8px;
  overflow: hidden;
  
  button {
    width: 36px;
    height: 44px;
    border: none;
    background: var(--hover);
    color: var(--text);
    font-size: 18px;
    cursor: pointer;
    
    &:hover {
      background: var(--primary-color);
      color: white;
    }
  }
  
  input {
    flex: 1;
    width: 100%;
    padding: 10px 4px;
    border: none;
    background: transparent;
    color: var(--text);
    font-size: 16px;
    text-align: center;
    
    &:focus { outline: none; }
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button { -webkit-appearance: none; }
  }
}

.result-date {
  .date {
    font-size: 24px;
    font-weight: 600;
    color: var(--primary-color);
    margin-bottom: 6px;
  }
  
  .weekday {
    font-size: 15px;
    color: var(--text-secondary);
  }
}

.convert-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;

  button {
    flex: 1;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
    cursor: pointer;

    &.active {
      background: #333;
      color: white;
      border-color: #333;
    }
  }
}

.lunar-result {
  .lunar-main {
    margin-bottom: 10px;
    
    .ganzhi {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
    }
    
    .shengxiao {
      font-size: 16px;
      color: #e74c3c;
      margin-left: 8px;
    }
  }

  .lunar-date {
    font-size: 28px;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 12px;
  }

  .lunar-extra {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 10px;

    .tag {
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 13px;

      &.jieqi {
        background: #e3f2fd;
        color: #1565c0;
      }

      &.festival {
        background: #fce4ec;
        color: #c2185b;
      }
    }
  }
}

.solar-result {
  .solar-date {
    font-size: 24px;
    font-weight: 600;
    color: var(--primary-color);
    margin-bottom: 6px;
  }

  .solar-weekday {
    font-size: 15px;
    color: var(--text-secondary);
  }
}

.error-msg {
  color: #e74c3c;
  font-size: 15px;
}

:root[data-theme="dark"] {
  .workdays-info {
    background: #1e4620;
    color: #81c784;
  }

  .convert-tabs button.active {
    background: #555;
    border-color: #555;
  }

  .lunar-result .lunar-extra .tag {
    &.jieqi { background: #1e3a5f; color: #64b5f6; }
    &.festival { background: #4a2c3a; color: #f48fb1; }
  }
}
</style>
