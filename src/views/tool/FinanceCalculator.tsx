import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'
import './FinanceCalculator.scss'

export default function FinanceCalculator() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'bank' | 'compound' | 'regular'>('bank')
  const [bankAmount, setBankAmount] = useState<number | null>(null)
  const [bankYears, setBankYears] = useState<number | null>(null)
  const [bankRate, setBankRate] = useState(0.20)
  const [compoundAmount, setCompoundAmount] = useState<number | null>(null)
  const [compoundYears, setCompoundYears] = useState<number | null>(null)
  const [compoundRate, setCompoundRate] = useState<number | null>(null)
  const [compoundFreq, setCompoundFreq] = useState<'year' | 'month' | 'day'>('year')
  const [regularAmount, setRegularAmount] = useState<number | null>(null)
  const [regularYears, setRegularYears] = useState<number | null>(null)
  const [regularRate, setRegularRate] = useState<number | null>(null)
  const [regularFreq, setRegularFreq] = useState<'month' | 'week'>('month')

  const bankResult = useMemo(() => {
    const amount = bankAmount || 0
    const years = bankYears || 0
    const rate = bankRate / 100
    if (amount <= 0 || years <= 0) return null
    const interest = amount * rate * years
    return { interest, total: amount + interest }
  }, [bankAmount, bankYears, bankRate])

  const compoundResult = useMemo(() => {
    const P = compoundAmount || 0
    const years = compoundYears || 0
    const rate = (compoundRate || 0) / 100
    if (P <= 0 || years <= 0 || rate < 0) return null
    if (years > 100 || rate > 1) return { interest: 0, total: 0, overflow: true }
    let n = compoundFreq === 'month' ? 12 : compoundFreq === 'day' ? 365 : 1
    const exponent = n * years
    const base = 1 + rate / n
    if (exponent > 1000 || Math.pow(base, exponent) === Infinity) return { interest: 0, total: 0, overflow: true }
    const total = P * Math.pow(base, exponent)
    if (!isFinite(total) || total > 1e15) return { interest: 0, total: 0, overflow: true }
    return { interest: total - P, total, overflow: false }
  }, [compoundAmount, compoundYears, compoundRate, compoundFreq])

  const regularResult = useMemo(() => {
    const PMT = regularAmount || 0
    const years = regularYears || 0
    const annualRate = (regularRate || 0) / 100
    if (PMT <= 0 || years <= 0) return null
    const periodsPerYear = regularFreq === 'month' ? 12 : 52
    const r = annualRate / periodsPerYear
    const n = years * periodsPerYear
    const total = r === 0 ? PMT * n : PMT * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
    const totalInvest = PMT * n
    return { interest: total - totalInvest, total, totalInvest }
  }, [regularAmount, regularYears, regularRate, regularFreq])

  const formatMoney = (num: number) => num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="tool-page finance">
      <header className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="title">理财计算</h1>
        <ThemeToggle />
      </header>
      
      <main className="tool-content">
        <div className="mode-tabs">
          <button className={mode === 'bank' ? 'active' : ''} onClick={() => setMode('bank')}>银行理财</button>
          <button className={mode === 'compound' ? 'active' : ''} onClick={() => setMode('compound')}>复利理财</button>
          <button className={mode === 'regular' ? 'active' : ''} onClick={() => setMode('regular')}>定投理财</button>
        </div>

        {mode === 'bank' && (
          <>
            <div className="result-preview">
              <div className="preview-item">
                <span className="label">利息(元)</span>
                <span className="value primary">{bankResult ? formatMoney(bankResult.interest) : '0'}元</span>
              </div>
              <div className="preview-item">
                <span className="label">本息（元）</span>
                <span className="value">{bankResult ? formatMoney(bankResult.total) : '0'}元</span>
              </div>
            </div>
            <div className="section-title">请输入存款信息</div>
            <div className="input-section">
              <div className="input-row">
                <label>存款金额(元)</label>
                <div className="input-field wide">
                  <input type="number" value={bankAmount || ''} onChange={(e) => setBankAmount(e.target.value ? Number(e.target.value) : null)} placeholder="请输入金额" />
                </div>
              </div>
              <div className="input-row">
                <label>存款期限</label>
                <div className="input-field">
                  <input type="number" value={bankYears || ''} onChange={(e) => setBankYears(e.target.value ? Number(e.target.value) : null)} placeholder="年数" />
                  <span className="unit">年</span>
                </div>
              </div>
              <div className="input-row">
                <label>年利率(%)</label>
                <div className="input-field">
                  <input type="number" value={bankRate} onChange={(e) => setBankRate(Number(e.target.value))} step="0.01" />
                  <span className="unit">%</span>
                </div>
              </div>
            </div>
          </>
        )}

        {mode === 'compound' && (
          <>
            <div className="result-preview">
              <div className="preview-item">
                <span className="label">利息收益(元)</span>
                {compoundResult && !compoundResult.overflow ? (
                  <span className="value primary">{formatMoney(compoundResult.interest)}元</span>
                ) : compoundResult?.overflow ? (
                  <span className="value error">数值过大</span>
                ) : (
                  <span className="value primary">0元</span>
                )}
              </div>
              <div className="preview-item">
                <span className="label">本息合计（元）</span>
                {compoundResult && !compoundResult.overflow ? (
                  <span className="value">{formatMoney(compoundResult.total)}元</span>
                ) : compoundResult?.overflow ? (
                  <span className="value error">数值过大</span>
                ) : (
                  <span className="value">0元</span>
                )}
              </div>
            </div>
            <div className="section-title">请输入投资信息</div>
            <div className="input-section">
              <div className="input-row">
                <label>投资本金(元)</label>
                <div className="input-field wide">
                  <input type="number" value={compoundAmount || ''} onChange={(e) => setCompoundAmount(e.target.value ? Number(e.target.value) : null)} placeholder="请输入金额" />
                </div>
              </div>
              <div className="input-row">
                <label>投资期限</label>
                <div className="input-field">
                  <input type="number" value={compoundYears || ''} onChange={(e) => setCompoundYears(e.target.value ? Number(e.target.value) : null)} placeholder="年数" min="1" max="50" />
                  <span className="unit">年</span>
                </div>
              </div>
              <div className="input-row">
                <label>年化收益率(%)</label>
                <div className="input-field">
                  <input type="number" value={compoundRate || ''} onChange={(e) => setCompoundRate(e.target.value ? Number(e.target.value) : null)} step="0.01" placeholder="0" min="0" max="100" />
                  <span className="unit">%</span>
                </div>
              </div>
              <div className="input-row">
                <label>复利周期</label>
                <div className="toggle-group three">
                  <button className={compoundFreq === 'year' ? 'active' : ''} onClick={() => setCompoundFreq('year')}>按年</button>
                  <button className={compoundFreq === 'month' ? 'active' : ''} onClick={() => setCompoundFreq('month')}>按月</button>
                  <button className={compoundFreq === 'day' ? 'active' : ''} onClick={() => setCompoundFreq('day')}>按日</button>
                </div>
              </div>
            </div>
          </>
        )}

        {mode === 'regular' && (
          <>
            <div className="result-preview">
              <div className="preview-item">
                <span className="label">利息收益(元)</span>
                <span className="value primary">{regularResult ? formatMoney(regularResult.interest) : '0'}元</span>
              </div>
              <div className="preview-item">
                <span className="label">本息合计（元）</span>
                <span className="value">{regularResult ? formatMoney(regularResult.total) : '0'}元</span>
              </div>
            </div>
            <div className="section-title">请输入定投信息</div>
            <div className="input-section">
              <div className="input-row">
                <label>每期投入(元)</label>
                <div className="input-field wide">
                  <input type="number" value={regularAmount || ''} onChange={(e) => setRegularAmount(e.target.value ? Number(e.target.value) : null)} placeholder="请输入金额" />
                </div>
              </div>
              <div className="input-row">
                <label>投资期限</label>
                <div className="input-field">
                  <input type="number" value={regularYears || ''} onChange={(e) => setRegularYears(e.target.value ? Number(e.target.value) : null)} placeholder="年数" />
                  <span className="unit">年</span>
                </div>
              </div>
              <div className="input-row">
                <label>预期年化收益(%)</label>
                <div className="input-field">
                  <input type="number" value={regularRate || ''} onChange={(e) => setRegularRate(e.target.value ? Number(e.target.value) : null)} step="0.01" placeholder="0" />
                  <span className="unit">%</span>
                </div>
              </div>
              <div className="input-row">
                <label>定投周期</label>
                <div className="toggle-group">
                  <button className={regularFreq === 'month' ? 'active' : ''} onClick={() => setRegularFreq('month')}>按月</button>
                  <button className={regularFreq === 'week' ? 'active' : ''} onClick={() => setRegularFreq('week')}>按周</button>
                </div>
              </div>
            </div>
            {regularResult && (
              <div className="extra-info">
                <div className="info-item">
                  <span className="label">累计投入</span>
                  <span className="value">¥{formatMoney(regularResult.totalInvest)}</span>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
