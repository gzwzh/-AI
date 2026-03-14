import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ToolHeader from '@/components/ToolHeader'
import './FinanceCalculator.scss'

export default function FinanceCalculator() {
  const { t } = useTranslation()
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
    
    // 避免过大的幂运算导致 Infinity
    if (n > 1200) return { interest: 0, total: 0, totalInvest: 0, overflow: true }
    
    const powerResult = Math.pow(1 + r, n)
    if (!isFinite(powerResult)) return { interest: 0, total: 0, totalInvest: 0, overflow: true }
    
    const total = r === 0 ? PMT * n : PMT * ((powerResult - 1) / r) * (1 + r)
    const totalInvest = PMT * n
    
    if (!isFinite(total) || total > 1e15) return { interest: 0, total: 0, totalInvest: 0, overflow: true }
    
    return { interest: total - totalInvest, total, totalInvest, overflow: false }
  }, [regularAmount, regularYears, regularRate, regularFreq])

  const formatMoney = (num: number) => num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="tool-page finance">
      <ToolHeader title={t('tool.finance.title')} />
      
      <main className="tool-content">
        <div className="mode-tabs">
          <button className={mode === 'bank' ? 'active' : ''} onClick={() => setMode('bank')}>{t('tool.finance.bank_mode')}</button>
          <button className={mode === 'compound' ? 'active' : ''} onClick={() => setMode('compound')}>{t('tool.finance.compound_mode')}</button>
          <button className={mode === 'regular' ? 'active' : ''} onClick={() => setMode('regular')}>{t('tool.finance.regular_mode')}</button>
        </div>

        {mode === 'bank' && (
          <>
            <div className="result-preview">
              <div className="preview-item">
                <span className="label">{t('tool.finance.interest_yuan')}</span>
                <span className="value primary">{bankResult ? formatMoney(bankResult.interest) : '0'}{t('tool.uppercase.yuan')}</span>
              </div>
              <div className="preview-item">
                <span className="label">{t('tool.finance.total_yuan')}</span>
                <span className="value">{bankResult ? formatMoney(bankResult.total) : '0'}{t('tool.uppercase.yuan')}</span>
              </div>
            </div>
            <div className="section-title">{t('tool.finance.bank_info')}</div>
            <div className="input-section">
              <div className="input-row">
                <label>{t('tool.finance.bank_amount')}</label>
                <div className="input-field wide">
                  <input type="number" value={bankAmount || ''} onChange={(e) => setBankAmount(e.target.value ? Number(e.target.value) : null)} placeholder={t('tool.discount.price_placeholder')} />
                </div>
              </div>
              <div className="input-row">
                <label>{t('tool.finance.bank_years')}</label>
                <div className="input-field">
                  <input type="number" value={bankYears || ''} onChange={(e) => setBankYears(e.target.value ? Number(e.target.value) : null)} placeholder={t('common.year')} />
                  <span className="unit">{t('common.year_unit')}</span>
                </div>
              </div>
              <div className="input-row">
                <label>{t('tool.finance.rate_percent')}</label>
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
                <span className="label">{t('tool.finance.interest_profit')}</span>
                {compoundResult && !compoundResult.overflow ? (
                  <span className="value primary">{formatMoney(compoundResult.interest)}{t('tool.uppercase.yuan')}</span>
                ) : compoundResult?.overflow ? (
                  <span className="value error">{t('tool.finance.overflow_error')}</span>
                ) : (
                  <span className="value primary">0{t('tool.uppercase.yuan')}</span>
                )}
              </div>
              <div className="preview-item">
                <span className="label">{t('tool.finance.total_sum')}</span>
                {compoundResult && !compoundResult.overflow ? (
                  <span className="value">{formatMoney(compoundResult.total)}{t('tool.uppercase.yuan')}</span>
                ) : compoundResult?.overflow ? (
                  <span className="value error">{t('tool.finance.overflow_error')}</span>
                ) : (
                  <span className="value">0{t('tool.uppercase.yuan')}</span>
                )}
              </div>
            </div>
            <div className="section-title">{t('tool.finance.compound_info')}</div>
            <div className="input-section">
              <div className="input-row">
                <label>{t('tool.finance.initial_principal')}</label>
                <div className="input-field wide">
                  <input type="number" value={compoundAmount || ''} onChange={(e) => setCompoundAmount(e.target.value ? Number(e.target.value) : null)} placeholder={t('tool.discount.price_placeholder')} />
                </div>
              </div>
              <div className="input-row">
                <label>{t('tool.finance.invest_years')}</label>
                <div className="input-field">
                  <input type="number" value={compoundYears || ''} onChange={(e) => setCompoundYears(e.target.value ? Number(e.target.value) : null)} placeholder={t('common.year')} min="1" max="50" />
                  <span className="unit">{t('common.year_unit')}</span>
                </div>
              </div>
              <div className="input-row">
                <label>{t('tool.finance.return_rate')}</label>
                <div className="input-field">
                  <input type="number" value={compoundRate || ''} onChange={(e) => setCompoundRate(e.target.value ? Number(e.target.value) : null)} step="0.01" placeholder="0" min="0" max="100" />
                  <span className="unit">%</span>
                </div>
              </div>
              <div className="input-row">
                <label>{t('tool.finance.compound_freq')}</label>
                <div className="toggle-group three">
                  <button className={compoundFreq === 'year' ? 'active' : ''} onClick={() => setCompoundFreq('year')}>{t('tool.finance.freq.year')}</button>
                  <button className={compoundFreq === 'month' ? 'active' : ''} onClick={() => setCompoundFreq('month')}>{t('tool.finance.freq.month')}</button>
                  <button className={compoundFreq === 'day' ? 'active' : ''} onClick={() => setCompoundFreq('day')}>{t('tool.finance.freq.day')}</button>
                </div>
              </div>
            </div>
          </>
        )}

        {mode === 'regular' && (
          <>
            <div className="result-preview">
              <div className="preview-item">
                <span className="label">{t('tool.finance.interest_profit')}</span>
                {regularResult && !regularResult.overflow ? (
                  <span className="value primary">{formatMoney(regularResult.interest)}{t('tool.uppercase.yuan')}</span>
                ) : regularResult?.overflow ? (
                  <span className="value error">{t('tool.finance.overflow_error')}</span>
                ) : (
                  <span className="value primary">0{t('tool.uppercase.yuan')}</span>
                )}
              </div>
              <div className="preview-item">
                <span className="label">{t('tool.finance.total_sum')}</span>
                {regularResult && !regularResult.overflow ? (
                  <span className="value">{formatMoney(regularResult.total)}{t('tool.uppercase.yuan')}</span>
                ) : regularResult?.overflow ? (
                  <span className="value error">{t('tool.finance.overflow_error')}</span>
                ) : (
                  <span className="value">0{t('tool.uppercase.yuan')}</span>
                )}
              </div>
            </div>
            <div className="section-title">{t('tool.finance.regular_info')}</div>
            <div className="input-section">
              <div className="input-row">
                <label>{t('tool.finance.regular_amount')}</label>
                <div className="input-field wide">
                  <input type="number" value={regularAmount || ''} onChange={(e) => setRegularAmount(e.target.value ? Number(e.target.value) : null)} placeholder={t('tool.discount.price_placeholder')} />
                </div>
              </div>
              <div className="input-row">
                <label>{t('tool.finance.regular_years')}</label>
                <div className="input-field">
                  <input type="number" value={regularYears || ''} onChange={(e) => setRegularYears(e.target.value ? Number(e.target.value) : null)} placeholder={t('common.year')} />
                  <span className="unit">{t('common.year_unit')}</span>
                </div>
              </div>
              <div className="input-row">
                <label>{t('tool.finance.regular_rate')}</label>
                <div className="input-field">
                  <input type="number" value={regularRate || ''} onChange={(e) => setRegularRate(e.target.value ? Number(e.target.value) : null)} step="0.01" placeholder="0" />
                  <span className="unit">%</span>
                </div>
              </div>
              <div className="input-row">
                <label>{t('tool.finance.regular_freq')}</label>
                <div className="toggle-group">
                  <button className={regularFreq === 'month' ? 'active' : ''} onClick={() => setRegularFreq('month')}>{t('tool.finance.freq.month')}</button>
                  <button className={regularFreq === 'week' ? 'active' : ''} onClick={() => setRegularFreq('week')}>{t('tool.finance.freq.week')}</button>
                </div>
              </div>
            </div>
            {regularResult && (
              <div className="extra-info">
                <div className="info-item">
                  <span className="label">{t('tool.finance.total_invest')}</span>
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
