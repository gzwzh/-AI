import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
          title: `月薪 ¥${salary} 个税估算`,
          expression: `税前 ${salary} - 五险一金 ${socialInsurance || 0} - 专项 ${specialDeduction || 0}`,
          result: `税后 ¥${Math.round(taxResult.afterTax)} (个税 ¥${Math.round(taxResult.tax)})`
        })
        setLastCalculated(currentId)
      }
    }
  }, [salary, socialInsurance, specialDeduction, taxResult, addHistory, lastCalculated])

  const formatMoney = (num: number) => num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="tool-page tax">
      <ToolHeader title="个税计算" />
      
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
