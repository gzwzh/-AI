import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ToolHeader from '@/components/ToolHeader'
import './AccountBook.scss'

interface Record {
  id: number
  type: 'expense' | 'income'
  category: string
  amount: number
  note: string
  date: string
}

function AccountBook() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [records, setRecords] = useState<Record[]>([])
  
  const expenseCategories = useMemo(() => [
    { name: t('tool.account.categories.expense.消费'), icon: '💳', key: '消费' },
    { name: t('tool.account.categories.expense.餐饮'), icon: '🍜', key: '餐饮' },
    { name: t('tool.account.categories.expense.购物'), icon: '🛍️', key: '购物' },
    { name: t('tool.account.categories.expense.住房'), icon: '🏠', key: '住房' },
    { name: t('tool.account.categories.expense.交通'), icon: '🚗', key: '交通' },
    { name: t('tool.account.categories.expense.通讯'), icon: '📱', key: '通讯' },
    { name: t('tool.account.categories.expense.娱乐'), icon: '🎮', key: '娱乐' },
    { name: t('tool.account.categories.expense.医疗'), icon: '💊', key: '医疗' },
    { name: t('tool.account.categories.expense.教育'), icon: '📚', key: '教育' },
    { name: t('tool.account.categories.expense.其他'), icon: '📝', key: '其他' },
  ], [t])

  const incomeCategories = useMemo(() => [
    { name: t('tool.account.categories.income.工资'), icon: '💰', key: '工资' },
    { name: t('tool.account.categories.income.奖金'), icon: '🎁', key: '奖金' },
    { name: t('tool.account.categories.income.投资'), icon: '📈', key: '投资' },
    { name: t('tool.account.categories.income.兼职'), icon: '💼', key: '兼职' },
    { name: t('tool.account.categories.income.红包'), icon: '🧧', key: '红包' },
    { name: t('tool.account.categories.income.其他'), icon: '📝', key: '其他' },
  ], [t])
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
    const weekDays = t('tool.account.weekdays', { returnObjects: true }) as string[]
    const today = new Date().toISOString().slice(0, 10)
    return `${date.getMonth() + 1}${t('common.month_unit')}${date.getDate()}${t('common.day_unit')} ${weekDays[date.getDay()]}${dateStr === today ? ` ${t('common.today')}` : ''}`
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    return `${year}${t('common.year')}${parseInt(month)}${t('common.month_unit')}`
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
    <div className="tool-page account">
      {!showAddPage ? (
        <div className="list-page">
          <ToolHeader title={t('tool.account.title')} />
          <main className="tool-content">
            <div className="stats-card">
              <div className="month-nav">
                <button onClick={prevMonth}>‹</button>
                <span>{formatMonth(currentMonth)}</span>
                <button onClick={nextMonth}>›</button>
              </div>
              <div className="stats-row">
                <div className="stat-item"><div className="stat-label">{t('tool.account.monthly_expense')}(元)</div><div className="stat-value expense">-{monthlyStats.expense.toFixed(2)}</div></div>
                <div className="stat-item"><div className="stat-label">{t('tool.account.monthly_income')}(元)</div><div className="stat-value income">+{monthlyStats.income.toFixed(2)}</div></div>
              </div>
              <button className="report-btn" onClick={() => setShowReportModal(true)}>📊 {t('tool.account.report')}</button>
            </div>
            {groupedRecords.length > 0 ? (
              <div className="records-list">
                {groupedRecords.map(group => (
                  <div key={group.date} className="date-group">
                    <div className="date-header">
                      <span>{formatDateHeader(group.date)}</span>
                      <span className="day-stats">{t('tool.account.expense')}:{group.dayExpense.toFixed(2)} {t('tool.account.income')}:{group.dayIncome.toFixed(2)}</span>
                    </div>
                    {group.records.map(record => (
                      <div key={record.id} className="record-item">
                        <div className="record-left">
                          <div className="record-icon">{getCategoryIcon(record.category, record.type)}</div>
                          <div className="record-info">
                            <span className="record-category">{t(`tool.account.categories.${record.type}.${record.category}`, { defaultValue: record.category })}</span>
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
              <div className="empty-state"><div className="empty-icon">📋</div><p>{t('tool.account.no_records')}</p></div>
            )}
            <button className="add-btn" onClick={openAddPage}>+</button>
          </main>
        </div>
      ) : (
        <div className="add-page">
          <ToolHeader title={t('tool.account.add_record')} onBack={() => setShowAddPage(false)} />
          <main className="tool-content">
            <div className="type-tabs">
            <button className={activeTab === 'expense' ? 'active' : ''} onClick={() => switchTab('expense')}>{t('tool.account.expense')}</button>
            <button className={activeTab === 'income' ? 'active' : ''} onClick={() => switchTab('income')}>{t('tool.account.income')}</button>
          </div>
          <div className="amount-section">
            <div className="current-cat"><span className="cat-badge">{getCategoryIcon(selectedCategory, activeTab)}</span><span>{t(`tool.account.categories.${activeTab}.${selectedCategory}`, { defaultValue: selectedCategory })}</span></div>
            <div className="amount-display">¥ {amount}</div>
          </div>
          <div className="category-grid">
            {currentCategories.map(cat => (
              <div key={cat.key} className={`cat-item ${selectedCategory === cat.key ? 'active' : ''}`} onClick={() => setSelectedCategory(cat.key)}>
                <span className="cat-icon">{cat.icon}</span><span className="cat-name">{cat.name}</span>
              </div>
            ))}
          </div>
          <div className="input-bar">
            <div className="note-field"><span>📝</span><input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder={t('tool.account.note_placeholder')} /></div>
            <div className="date-field" onClick={() => setShowDatePicker(!showDatePicker)}><span>📅</span><span>{selectedDate}</span></div>
          </div>
          {showDatePicker && <input type="date" value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setShowDatePicker(false) }} className="date-picker" />}
          <div className="numpad">
            <button onClick={() => inputDigit('7')}>7</button><button onClick={() => inputDigit('8')}>8</button><button onClick={() => inputDigit('9')}>9</button><button className="func" onClick={backspace}>⌫</button>
            <button onClick={() => inputDigit('4')}>4</button><button onClick={() => inputDigit('5')}>5</button><button onClick={() => inputDigit('6')}>6</button><button className="confirm" onClick={saveRecord}>{t('common.confirm')}</button>
            <button onClick={() => inputDigit('1')}>1</button><button onClick={() => inputDigit('2')}>2</button><button onClick={() => inputDigit('3')}>3</button><button onClick={clearAmount}>C</button>
            <button onClick={() => inputDigit('0')}>0</button><button onClick={inputDecimal}>.</button>
          </div>
          </main>
        </div>
      )}

      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{formatMonth(currentMonth)} {t('tool.account.report_title')}</h3><button onClick={() => setShowReportModal(false)}>×</button></div>
            <div className="modal-body">
              <div className="report-summary">
                <div><span>{t('tool.account.total_expense')}</span><span className="expense">-{monthlyStats.expense.toFixed(2)}</span></div>
                <div><span>{t('tool.account.total_income')}</span><span className="income">+{monthlyStats.income.toFixed(2)}</span></div>
                <div><span>{t('tool.account.balance')}</span><span className={monthlyStats.income - monthlyStats.expense >= 0 ? 'income' : 'expense'}>{(monthlyStats.income - monthlyStats.expense).toFixed(2)}</span></div>
              </div>
              {Object.keys(reportData.expenseByCategory).length > 0 && (
                <div className="report-detail"><h4>{t('tool.account.expense_detail')}</h4>{Object.entries(reportData.expenseByCategory).map(([cat, amt]) => (<div key={cat} className="detail-row"><span>{t(`tool.account.categories.expense.${cat}`, { defaultValue: cat })}</span><span className="expense">-{amt.toFixed(2)}</span></div>))}</div>
              )}
              {Object.keys(reportData.incomeByCategory).length > 0 && (
                <div className="report-detail"><h4>{t('tool.account.income_detail')}</h4>{Object.entries(reportData.incomeByCategory).map(([cat, amt]) => (<div key={cat} className="detail-row"><span>{t(`tool.account.categories.income.${cat}`, { defaultValue: cat })}</span><span className="income">+{amt.toFixed(2)}</span></div>))}</div>
              )}
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="confirm-overlay" onClick={cancelDelete}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">🗑️</div><h3>{t('common.confirm_delete')}</h3><p>{t('tool.account.delete_confirm_text')}</p>
            <div className="confirm-actions"><button className="cancel-btn" onClick={cancelDelete}>{t('common.cancel')}</button><button className="delete-confirm-btn" onClick={confirmDelete}>{t('common.delete')}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountBook
