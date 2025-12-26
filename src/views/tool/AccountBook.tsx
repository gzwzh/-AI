import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'
import './AccountBook.scss'

interface Record {
  id: number
  type: 'expense' | 'income'
  category: string
  amount: number
  note: string
  date: string
}

const expenseCategories = [
  { name: '消费', icon: '💳' }, { name: '餐饮', icon: '🍜' }, { name: '购物', icon: '🛍️' },
  { name: '住房', icon: '🏠' }, { name: '交通', icon: '🚗' }, { name: '通讯', icon: '📱' },
  { name: '娱乐', icon: '🎮' }, { name: '医疗', icon: '💊' }, { name: '教育', icon: '📚' }, { name: '其他', icon: '📝' },
]
const incomeCategories = [
  { name: '工资', icon: '💰' }, { name: '奖金', icon: '🎁' }, { name: '投资', icon: '📈' },
  { name: '兼职', icon: '💼' }, { name: '红包', icon: '🧧' }, { name: '其他', icon: '📝' },
]

function AccountBook() {
  const navigate = useNavigate()
  const [records, setRecords] = useState<Record[]>([])
  const [showAddPage, setShowAddPage] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7))
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')
  const [selectedCategory, setSelectedCategory] = useState('消费')
  const [amount, setAmount] = useState('0')
  const [note, setNote] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  useEffect(() => {
    const data = localStorage.getItem('accountBook')
    if (data) setRecords(JSON.parse(data))
  }, [])

  const saveToStorage = (newRecords: Record[]) => localStorage.setItem('accountBook', JSON.stringify(newRecords))

  const currentCategories = activeTab === 'expense' ? expenseCategories : incomeCategories

  const monthlyStats = useMemo(() => {
    const monthRecords = records.filter(r => r.date.startsWith(currentMonth))
    const expense = monthRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
    const income = monthRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
    return { expense, income }
  }, [records, currentMonth])

  const groupedRecords = useMemo(() => {
    const monthRecords = records.filter(r => r.date.startsWith(currentMonth)).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
    const groups: { date: string; records: Record[]; dayExpense: number; dayIncome: number }[] = []
    monthRecords.forEach(record => {
      const existing = groups.find(g => g.date === record.date)
      if (existing) {
        existing.records.push(record)
        if (record.type === 'expense') existing.dayExpense += record.amount
        else existing.dayIncome += record.amount
      } else {
        groups.push({ date: record.date, records: [record], dayExpense: record.type === 'expense' ? record.amount : 0, dayIncome: record.type === 'income' ? record.amount : 0 })
      }
    })
    return groups
  }, [records, currentMonth])

  const reportData = useMemo(() => {
    const monthRecords = records.filter(r => r.date.startsWith(currentMonth))
    const expenseByCategory: { [key: string]: number } = {}
    const incomeByCategory: { [key: string]: number } = {}
    monthRecords.forEach(r => {
      if (r.type === 'expense') expenseByCategory[r.category] = (expenseByCategory[r.category] || 0) + r.amount
      else incomeByCategory[r.category] = (incomeByCategory[r.category] || 0) + r.amount
    })
    return { expenseByCategory, incomeByCategory }
  }, [records, currentMonth])

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
    const date = new Date(currentMonth + '-01')
    date.setMonth(date.getMonth() - 1)
    setCurrentMonth(date.toISOString().slice(0, 7))
  }

  const nextMonth = () => {
    const date = new Date(currentMonth + '-01')
    date.setMonth(date.getMonth() + 1)
    setCurrentMonth(date.toISOString().slice(0, 7))
  }

  const openAddPage = () => {
    setAmount('0'); setNote(''); setSelectedDate(new Date().toISOString().slice(0, 10))
    setActiveTab('expense'); setSelectedCategory(expenseCategories[0].name); setShowAddPage(true)
  }

  const switchTab = (tab: 'expense' | 'income') => {
    setActiveTab(tab)
    setSelectedCategory(tab === 'expense' ? expenseCategories[0].name : incomeCategories[0].name)
  }

  const inputDigit = (digit: string) => {
    if (amount === '0') setAmount(digit)
    else if (amount.includes('.') && amount.split('.')[1].length >= 2) return
    else setAmount(amount + digit)
  }
  const inputDecimal = () => { if (!amount.includes('.')) setAmount(amount + '.') }
  const backspace = () => setAmount(amount.length > 1 ? amount.slice(0, -1) : '0')
  const clearAmount = () => setAmount('0')

  const saveRecord = () => {
    const amountNum = parseFloat(amount)
    if (amountNum <= 0 || isNaN(amountNum)) return
    const newRecords = [...records, { id: Date.now(), type: activeTab, category: selectedCategory, amount: amountNum, note, date: selectedDate }]
    setRecords(newRecords); saveToStorage(newRecords); setShowAddPage(false)
  }

  const deleteRecord = (id: number) => { setDeleteTargetId(id); setShowDeleteConfirm(true) }
  const confirmDelete = () => {
    if (deleteTargetId) { const newRecords = records.filter(r => r.id !== deleteTargetId); setRecords(newRecords); saveToStorage(newRecords) }
    setShowDeleteConfirm(false); setDeleteTargetId(null)
  }
  const cancelDelete = () => { setShowDeleteConfirm(false); setDeleteTargetId(null) }

  const getCategoryIcon = (category: string, type: string) => {
    const cats = type === 'expense' ? expenseCategories : incomeCategories
    return cats.find(c => c.name === category)?.icon || '💰'
  }

  return (
    <div className="account-page">
      {!showAddPage ? (
        <div className="list-page">
          <header className="header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <h1 className="title">记账本</h1>
            <ThemeToggle />
          </header>
          <main className="main">
            <div className="stats-card">
              <div className="month-nav">
                <button onClick={prevMonth}>‹</button>
                <span>{formatMonth(currentMonth)}</span>
                <button onClick={nextMonth}>›</button>
              </div>
              <div className="stats-row">
                <div className="stat-item"><div className="stat-label">本月支出(元)</div><div className="stat-value expense">-{monthlyStats.expense.toFixed(2)}</div></div>
                <div className="stat-item"><div className="stat-label">本月收入(元)</div><div className="stat-value income">+{monthlyStats.income.toFixed(2)}</div></div>
              </div>
              <button className="report-btn" onClick={() => setShowReportModal(true)}>📊 月度报表</button>
            </div>
            {groupedRecords.length > 0 ? (
              <div className="records-list">
                {groupedRecords.map(group => (
                  <div key={group.date} className="date-group">
                    <div className="date-header">
                      <span>{formatDateHeader(group.date)}</span>
                      <span className="day-stats">支出:{group.dayExpense.toFixed(2)} 收入:{group.dayIncome.toFixed(2)}</span>
                    </div>
                    {group.records.map(record => (
                      <div key={record.id} className="record-item">
                        <div className="record-left">
                          <div className="record-icon">{getCategoryIcon(record.category, record.type)}</div>
                          <div className="record-info">
                            <span className="record-category">{record.category}</span>
                            {record.note && <span className="record-note">{record.note}</span>}
                          </div>
                        </div>
                        <div className="record-right">
                          <span className={`record-amount ${record.type}`}>{record.type === 'expense' ? '-' : '+'}{record.amount.toFixed(2)}</span>
                          <button className="delete-item-btn" onClick={() => deleteRecord(record.id)}>🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state"><div className="empty-icon">📋</div><p>暂无账单记录</p><p className="empty-hint">点击右下角按钮开始记账</p></div>
            )}
            <button className="add-btn" onClick={openAddPage}>+</button>
          </main>
        </div>
      ) : (
        <div className="add-page">
          <header className="add-header">
            <button className="back-btn-light" onClick={() => setShowAddPage(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <h1>记一笔</h1>
            <div style={{width: 40}}></div>
          </header>
          <div className="type-tabs">
            <button className={activeTab === 'expense' ? 'active' : ''} onClick={() => switchTab('expense')}>支出</button>
            <button className={activeTab === 'income' ? 'active' : ''} onClick={() => switchTab('income')}>收入</button>
          </div>
          <div className="amount-section">
            <div className="current-cat"><span className="cat-badge">{getCategoryIcon(selectedCategory, activeTab)}</span><span>{selectedCategory}</span></div>
            <div className="amount-display">¥ {amount}</div>
          </div>
          <div className="category-grid">
            {currentCategories.map(cat => (
              <div key={cat.name} className={`cat-item ${selectedCategory === cat.name ? 'active' : ''}`} onClick={() => setSelectedCategory(cat.name)}>
                <span className="cat-icon">{cat.icon}</span><span className="cat-name">{cat.name}</span>
              </div>
            ))}
          </div>
          <div className="input-bar">
            <div className="note-field"><span>📝</span><input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="添加备注..." /></div>
            <div className="date-field" onClick={() => setShowDatePicker(!showDatePicker)}><span>📅</span><span>{selectedDate}</span></div>
          </div>
          {showDatePicker && <input type="date" value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setShowDatePicker(false) }} className="date-picker" />}
          <div className="numpad">
            <button onClick={() => inputDigit('7')}>7</button><button onClick={() => inputDigit('8')}>8</button><button onClick={() => inputDigit('9')}>9</button><button className="func" onClick={backspace}>⌫</button>
            <button onClick={() => inputDigit('4')}>4</button><button onClick={() => inputDigit('5')}>5</button><button onClick={() => inputDigit('6')}>6</button><button className="confirm" onClick={saveRecord}>确认</button>
            <button onClick={() => inputDigit('1')}>1</button><button onClick={() => inputDigit('2')}>2</button><button onClick={() => inputDigit('3')}>3</button><button onClick={clearAmount}>C</button>
            <button onClick={() => inputDigit('0')}>0</button><button onClick={inputDecimal}>.</button>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{formatMonth(currentMonth)} 报表</h3><button onClick={() => setShowReportModal(false)}>×</button></div>
            <div className="modal-body">
              <div className="report-summary">
                <div><span>总支出</span><span className="expense">-{monthlyStats.expense.toFixed(2)}</span></div>
                <div><span>总收入</span><span className="income">+{monthlyStats.income.toFixed(2)}</span></div>
                <div><span>结余</span><span className={monthlyStats.income - monthlyStats.expense >= 0 ? 'income' : 'expense'}>{(monthlyStats.income - monthlyStats.expense).toFixed(2)}</span></div>
              </div>
              {Object.keys(reportData.expenseByCategory).length > 0 && (
                <div className="report-detail"><h4>支出明细</h4>{Object.entries(reportData.expenseByCategory).map(([cat, amt]) => (<div key={cat} className="detail-row"><span>{cat}</span><span className="expense">-{amt.toFixed(2)}</span></div>))}</div>
              )}
              {Object.keys(reportData.incomeByCategory).length > 0 && (
                <div className="report-detail"><h4>收入明细</h4>{Object.entries(reportData.incomeByCategory).map(([cat, amt]) => (<div key={cat} className="detail-row"><span>{cat}</span><span className="income">+{amt.toFixed(2)}</span></div>))}</div>
              )}
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="confirm-overlay" onClick={cancelDelete}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">🗑️</div><h3>确认删除</h3><p>确定要删除这条账单记录吗？删除后无法恢复。</p>
            <div className="confirm-actions"><button className="cancel-btn" onClick={cancelDelete}>取消</button><button className="delete-confirm-btn" onClick={confirmDelete}>删除</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountBook
