import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ToolHeader from '@/components/ToolHeader'
import { useHistoryStore } from '@/stores/history'
import './TaxCalculator.scss'

const taxBrackets = [
  { min: 0, max: 36000, rate: 0.03, deduction: 0 },
  { min: 36000, max: 144000, rate: 0.1, deduction: 2520 },
  { min: 144000, max: 300000, rate: 0.2, deduction: 16920 },
  { min: 300000, max: 420000, rate: 0.25, deduction: 31920 },
  { min: 420000, max: 660000, rate: 0.3, deduction: 52920 },
  { min: 660000, max: 960000, rate: 0.35, deduction: 85920 },
  { min: 960000, max: Infinity, rate: 0.45, deduction: 181920 },
]

export default function TaxCalculator() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [salary, setSalary] = useState<number | null>(null)

  useEffect(() => {
    if (location.state && location.state.salary) {
      setSalary(Number(location.state.salary))
    }
  }, [location.state])
  const [socialInsurance, setSocialInsurance] = useState<number | null>(null)
  const [specialDeduction, setSpecialDeduction] = useState<number | null>(null)
  const threshold = 5000

  const { addHistory } = useHistoryStore()
  const [lastCalculated, setLastCalculated] = useState<string>('')

  const taxResult = useMemo(() => {
    const salaryVal = salary || 0
    const insuranceVal = socialInsurance || 0
    const deductionVal = specialDeduction || 0
    if (salaryVal <= 0) return null
    const monthlyTaxableIncome = Math.max(0, salaryVal - insuranceVal - deductionVal - threshold)
    const yearlyTaxableIncome = monthlyTaxableIncome * 12
    
    let bracket = taxBrackets[0]
    for (const b of taxBrackets) {
      if (yearlyTaxableIncome > b.min && yearlyTaxableIncome <= b.max) { bracket = b; break }
      if (yearlyTaxableIncome > b.max) bracket = b
    }

    const yearlyTax = yearlyTaxableIncome * bracket.rate - bracket.deduction
    const monthlyTax = Math.max(0, yearlyTax / 12)
    const afterTax = salaryVal - insuranceVal - monthlyTax

    const result = {
      taxableIncome: monthlyTaxableIncome,
      tax: monthlyTax,
      afterTax: afterTax,
      rate: bracket.rate * 100
    }

    return result
  }, [salary, socialInsurance, specialDeduction, threshold])

  // 自动保存历史记录
  useEffect(() => {
    if (salary && salary > 0 && taxResult) {
      const currentId = `${salary}-${socialInsurance || 0}-${specialDeduction || 0}`
      if (currentId !== lastCalculated) {
        addHistory({
          type: 'tax',
          title: t('tool.tax.history.title', { salary }),
          expression: t('tool.tax.history.expression', { salary, insurance: socialInsurance || 0, deduction: specialDeduction || 0 }),
          result: t('tool.tax.history.result', { 
            afterTax: Math.round(taxResult.afterTax), 
            tax: Math.round(taxResult.tax) 
          })
        })
        setLastCalculated(currentId)
      }
    }
  }, [salary, socialInsurance, specialDeduction, taxResult, addHistory, lastCalculated, t])

  const formatMoney = (num: number) => num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="tool-page tax">
      <ToolHeader title={t('tool.tax.title')} />
      
      <main className="tool-content">
        <div className="input-section">
          <div className="input-row">
            <label>{t('tool.tax.salary_label')}</label>
            <div className="input-field">
              <input type="number" value={salary || ''} onChange={(e) => setSalary(e.target.value ? Number(e.target.value) : null)} placeholder={t('common.confirm_delete').slice(0, 3)} />
              <span className="unit">{t('common.year_unit').replace('年', '元')}</span>
            </div>
          </div>
          <div className="input-row">
            <label>{t('tool.tax.insurance_label')}</label>
            <div className="input-field">
              <input type="number" value={socialInsurance || ''} onChange={(e) => setSocialInsurance(e.target.value ? Number(e.target.value) : null)} placeholder="0" />
              <span className="unit">{t('common.year_unit').replace('年', '元')}</span>
            </div>
          </div>
          <div className="input-row">
            <label>{t('tool.tax.deduction_label')}</label>
            <div className="input-field">
              <input type="number" value={specialDeduction || ''} onChange={(e) => setSpecialDeduction(e.target.value ? Number(e.target.value) : null)} placeholder="0" />
              <span className="unit">{t('common.year_unit').replace('年', '元')}</span>
            </div>
          </div>
          <div className="input-row">
            <label>{t('tool.tax.threshold_label')}</label>
            <div className="input-field disabled">
              <input type="number" value={threshold} disabled />
              <span className="unit">{t('common.year_unit').replace('年', '元')}</span>
            </div>
          </div>
        </div>

        <div className="hint-text">{t('tool.tax.hint')}</div>
        
        {taxResult && (
          <div className="result-section">
            <div className="result-main">
              <div className="label">{t('tool.tax.after_tax_salary')}</div>
              <div className="value">¥ {formatMoney(taxResult.afterTax)}</div>
            </div>
            <div className="result-details">
              <div className="detail-item"><span className="label">{t('tool.tax.taxable_income')}</span><span className="value">¥ {formatMoney(taxResult.taxableIncome)}</span></div>
              <div className="detail-item"><span className="label">{t('tool.tax.applicable_rate')}</span><span className="value">{taxResult.rate}%</span></div>
              <div className="detail-item"><span className="label">{t('tool.tax.payable_tax')}</span><span className="value highlight">¥ {formatMoney(taxResult.tax)}</span></div>
              <div className="detail-item"><span className="label">{t('tool.tax.insurance_label').replace('（元）', '')}</span><span className="value">¥ {formatMoney(socialInsurance || 0)}</span></div>
            </div>
          </div>
        )}
          
        <div className="tax-table">
          <div className="table-title">{t('tool.tax.table_title')}</div>
          <table>
            <thead>
              <tr>
                {(t('tool.tax.table_headers', { returnObjects: true }) as any).map((header: string) => <th key={header}>{header}</th>)}
              </tr>
            </thead>
            <tbody>
              {taxBrackets.map((b, i) => (
                <tr key={i} className={taxResult && taxResult.rate === b.rate * 100 && taxResult.tax > 0 ? 'active' : ''}>
                  <td>{i + 1}</td>
                  <td>{b.max === Infinity ? `>${b.min/10000}${t('tool.tax.ten_thousand_unit')}` : `${b.min/10000}-${b.max/10000}${t('tool.tax.ten_thousand_unit')}`}</td>
                  <td>{b.rate * 100}%</td>
                  <td>{b.deduction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
