import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'
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
  const navigate = useNavigate()
  const [salary, setSalary] = useState<number | null>(null)
  const [socialInsurance, setSocialInsurance] = useState<number | null>(null)
  const [specialDeduction, setSpecialDeduction] = useState<number | null>(null)
  const threshold = 5000

  const taxResult = useMemo(() => {
    const salaryVal = salary || 0
    const insuranceVal = socialInsurance || 0
    const deductionVal = specialDeduction || 0
    if (salaryVal <= 0) return null
    const monthlyTaxableIncome = salaryVal - insuranceVal - deductionVal - threshold
    if (monthlyTaxableIncome <= 0) return { taxableIncome: 0, tax: 0, afterTax: salaryVal - insuranceVal, rate: 0 }
    const yearlyTaxableIncome = monthlyTaxableIncome * 12
    let bracket = taxBrackets[0]
    for (const b of taxBrackets) {
      if (yearlyTaxableIncome > b.min && yearlyTaxableIncome <= b.max) { bracket = b; break }
      if (yearlyTaxableIncome > b.max) bracket = b
    }
    const yearlyTax = yearlyTaxableIncome * bracket.rate - bracket.deduction
    const monthlyTax = yearlyTax / 12
    return { taxableIncome: monthlyTaxableIncome, tax: Math.max(0, monthlyTax), afterTax: salaryVal - insuranceVal - Math.max(0, monthlyTax), rate: bracket.rate * 100 }
  }, [salary, socialInsurance, specialDeduction])

  const formatMoney = (num: number) => num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="tool-page tax">
      <header className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="title">个税计算</h1>
        <ThemeToggle />
      </header>
      
      <main className="tool-content">
        <div className="input-section">
          <div className="input-row">
            <label>税前月薪（元）</label>
            <div className="input-field">
              <input type="number" value={salary || ''} onChange={(e) => setSalary(e.target.value ? Number(e.target.value) : null)} placeholder="请输入" />
              <span className="unit">元</span>
            </div>
          </div>
          <div className="input-row">
            <label>五险一金（元）</label>
            <div className="input-field">
              <input type="number" value={socialInsurance || ''} onChange={(e) => setSocialInsurance(e.target.value ? Number(e.target.value) : null)} placeholder="0" />
              <span className="unit">元</span>
            </div>
          </div>
          <div className="input-row">
            <label>专项附加扣除（元）</label>
            <div className="input-field">
              <input type="number" value={specialDeduction || ''} onChange={(e) => setSpecialDeduction(e.target.value ? Number(e.target.value) : null)} placeholder="0" />
              <span className="unit">元</span>
            </div>
          </div>
          <div className="input-row">
            <label>起征点（元）</label>
            <div className="input-field disabled">
              <input type="number" value={threshold} disabled />
              <span className="unit">元</span>
            </div>
          </div>
        </div>

        <div className="hint-text">专项附加扣除包括：子女教育、继续教育、住房贷款利息、住房租金、赡养老人等</div>
        
        {taxResult && (
          <div className="result-section">
            <div className="result-main">
              <div className="label">税后月薪</div>
              <div className="value">¥ {formatMoney(taxResult.afterTax)}</div>
            </div>
            <div className="result-details">
              <div className="detail-item"><span className="label">应纳税所得额</span><span className="value">¥ {formatMoney(taxResult.taxableIncome)}</span></div>
              <div className="detail-item"><span className="label">适用税率</span><span className="value">{taxResult.rate}%</span></div>
              <div className="detail-item"><span className="label">应缴个税</span><span className="value highlight">¥ {formatMoney(taxResult.tax)}</span></div>
              <div className="detail-item"><span className="label">五险一金</span><span className="value">¥ {formatMoney(socialInsurance || 0)}</span></div>
            </div>
          </div>
        )}
          
        <div className="tax-table">
          <div className="table-title">个税税率表（年度）</div>
          <table>
            <thead>
              <tr><th>级数</th><th>应纳税所得额</th><th>税率</th><th>速算扣除</th></tr>
            </thead>
            <tbody>
              {taxBrackets.map((b, i) => (
                <tr key={i} className={taxResult && taxResult.rate === b.rate * 100 && taxResult.tax > 0 ? 'active' : ''}>
                  <td>{i + 1}</td>
                  <td>{b.max === Infinity ? `>${b.min/10000}万` : `${b.min/10000}-${b.max/10000}万`}</td>
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
