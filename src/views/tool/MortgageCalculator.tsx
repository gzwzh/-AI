import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import ToolHeader from '@/components/ToolHeader'
import './MortgageCalculator.scss'

type ScheduleItem = {
  month: number
  payment: number
  principal: number
  interest: number
  remaining: number
}

export default function MortgageCalculator() {
  const [loanType, setLoanType] = useState<'commercial' | 'fund' | 'combined'>('commercial')
  const [commercialAmount, setCommercialAmount] = useState<number | null>(null)
  const [commercialRateType, setCommercialRateType] = useState<'lpr' | 'base'>('lpr')
  const [commercialLpr, setCommercialLpr] = useState(3.5)
  const [commercialBasisPoints, setCommercialBasisPoints] = useState(0)
  const [commercialBaseRate, setCommercialBaseRate] = useState(4.9)
  const [fundAmount, setFundAmount] = useState<number | null>(null)
  const [fundRate, setFundRate] = useState(2.6)
  const [loanYears, setLoanYears] = useState<number | null>(30)
  const [paymentType, setPaymentType] = useState<'equal' | 'principal'>('equal')
  const [showSchedule, setShowSchedule] = useState(false)

  const commercialRate = useMemo(() => {
    if (commercialRateType === 'lpr') return commercialLpr + commercialBasisPoints / 10
    return commercialBaseRate
  }, [commercialRateType, commercialLpr, commercialBasisPoints, commercialBaseRate])

  const calculateLoan = (amount: number, rate: number, years: number) => {
    const P = amount * 10000
    const r = rate / 100 / 12
    const n = years * 12
    if (r === 0) {
      return {
        monthlyPayment: P / n,
        firstMonthPayment: P / n,
        lastMonthPayment: P / n,
        totalPayment: P,
        totalInterest: 0,
        schedule: Array.from({ length: n }, (_, i) => ({
          month: i + 1,
          payment: P / n,
          principal: P / n,
          interest: 0,
          remaining: P - (i + 1) * (P / n)
        }))
      }
    }

    // 等额本息
    const equalMonthly = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
    const equalTotal = equalMonthly * n
    const equalInterest = equalTotal - P
    const equalSchedule = []
    let remainingEqual = P
    for (let i = 1; i <= n; i++) {
      const interest = remainingEqual * r
      const principal = equalMonthly - interest
      remainingEqual -= principal
      equalSchedule.push({
        month: i,
        payment: equalMonthly,
        principal,
        interest,
        remaining: Math.max(0, remainingEqual)
      })
    }

    // 等额本金
    const monthlyPrincipal = P / n
    const principalSchedule = []
    let remainingPrincipal = P
    let totalPrincipalInterest = 0
    for (let i = 1; i <= n; i++) {
      const interest = remainingPrincipal * r
      const payment = monthlyPrincipal + interest
      totalPrincipalInterest += interest
      remainingPrincipal -= monthlyPrincipal
      principalSchedule.push({
        month: i,
        payment,
        principal: monthlyPrincipal,
        interest,
        remaining: Math.max(0, remainingPrincipal)
      })
    }

    const firstMonth = monthlyPrincipal + P * r
    const lastMonth = monthlyPrincipal + monthlyPrincipal * r

    return {
      monthlyPayment: equalMonthly,
      firstMonthPayment: firstMonth,
      lastMonthPayment: lastMonth,
      totalPayment: paymentType === 'equal' ? equalTotal : P + totalPrincipalInterest,
      totalInterest: paymentType === 'equal' ? equalInterest : totalPrincipalInterest,
      schedule: paymentType === 'equal' ? equalSchedule : principalSchedule
    }
  }

  const result = useMemo(() => {
    const years = loanYears || 0
    if (years <= 0) return null
    if (loanType === 'commercial') {
      const amount = commercialAmount || 0
      if (amount <= 0) return null
      const calc = calculateLoan(amount, commercialRate, years)
      return { type: 'single', ...calc, loanAmount: amount * 10000 }
    }
    if (loanType === 'fund') {
      const amount = fundAmount || 0
      if (amount <= 0) return null
      const calc = calculateLoan(amount, fundRate, years)
      return { type: 'single', ...calc, loanAmount: amount * 10000 }
    }
    const cAmount = commercialAmount || 0
    const fAmount = fundAmount || 0
    if (cAmount <= 0 && fAmount <= 0) return null
    const commercialCalc = cAmount > 0 ? calculateLoan(cAmount, commercialRate, years) : null
    const fundCalc = fAmount > 0 ? calculateLoan(fAmount, fundRate, years) : null
    
    // 合并还款明细
    const n = years * 12
    const combinedSchedule = []
    for (let i = 0; i < n; i++) {
      const cMonth = commercialCalc?.schedule[i]
      const fMonth = fundCalc?.schedule[i]
      combinedSchedule.push({
        month: i + 1,
        payment: (cMonth?.payment || 0) + (fMonth?.payment || 0),
        principal: (cMonth?.principal || 0) + (fMonth?.principal || 0),
        interest: (cMonth?.interest || 0) + (fMonth?.interest || 0),
        remaining: (cMonth?.remaining || 0) + (fMonth?.remaining || 0)
      })
    }

    return {
      type: 'combined',
      monthlyPayment: (commercialCalc?.monthlyPayment || 0) + (fundCalc?.monthlyPayment || 0),
      firstMonthPayment: (commercialCalc?.firstMonthPayment || 0) + (fundCalc?.firstMonthPayment || 0),
      lastMonthPayment: (commercialCalc?.lastMonthPayment || 0) + (fundCalc?.lastMonthPayment || 0),
      totalPayment: (commercialCalc?.totalPayment || 0) + (fundCalc?.totalPayment || 0),
      totalInterest: (commercialCalc?.totalInterest || 0) + (fundCalc?.totalInterest || 0),
      loanAmount: (cAmount + fAmount) * 10000,
      commercial: commercialCalc,
      fund: fundCalc,
      commercialAmount: cAmount * 10000,
      fundAmount: fAmount * 10000,
      schedule: combinedSchedule
    }
  }, [loanType, commercialAmount, fundAmount, commercialRate, fundRate, loanYears, paymentType])

  const formatMoney = (num: number) => num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const pieData = useMemo(() => {
    if (!result) return []
    return [
      { name: '贷款本金', value: result.loanAmount, color: '#3498db' },
      { name: '支付利息', value: result.totalInterest, color: '#e74c3c' }
    ]
  }, [result])

  return (
    <div className="tool-page mortgage">
      <ToolHeader title="房贷计算" />
      
      <main className="tool-content">
        <div className="loan-type-tabs">
          <button className={loanType === 'commercial' ? 'active' : ''} onClick={() => setLoanType('commercial')}>商业贷款</button>
          <button className={loanType === 'fund' ? 'active' : ''} onClick={() => setLoanType('fund')}>公积金</button>
          <button className={loanType === 'combined' ? 'active' : ''} onClick={() => setLoanType('combined')}>组合贷款</button>
        </div>

        <div className="input-section">
          {(loanType === 'fund' || loanType === 'combined') && (
            <>
              <div className="input-row">
                <label>{loanType === 'combined' ? '公积金贷款金额' : '贷款金额'}</label>
                <div className="input-field">
                  <input type="number" value={fundAmount || ''} onChange={(e) => setFundAmount(e.target.value ? Number(e.target.value) : null)} placeholder="" />
                  <span className="unit">万元</span>
                </div>
              </div>
              <div className="input-row">
                <label>{loanType === 'combined' ? '公积金贷款利率' : '贷款利率'}</label>
                <div className="input-field">
                  <input type="number" value={fundRate} onChange={(e) => setFundRate(Number(e.target.value))} step="0.01" />
                  <span className="unit">%</span>
                </div>
              </div>
            </>
          )}

          {(loanType === 'commercial' || loanType === 'combined') && (
            <>
              <div className="input-row">
                <label>{loanType === 'combined' ? '商业贷款金额' : '贷款金额'}</label>
                <div className="input-field">
                  <input type="number" value={commercialAmount || ''} onChange={(e) => setCommercialAmount(e.target.value ? Number(e.target.value) : null)} placeholder="" />
                  <span className="unit">万元</span>
                </div>
              </div>
              <div className="input-row">
                <label>商业贷款利率方式</label>
                <div className="toggle-group">
                  <button className={commercialRateType === 'lpr' ? 'active' : ''} onClick={() => setCommercialRateType('lpr')}>LPR</button>
                  <button className={commercialRateType === 'base' ? 'active' : ''} onClick={() => setCommercialRateType('base')}>基准利率</button>
                </div>
              </div>
              {commercialRateType === 'lpr' ? (
                <>
                  <div className="input-row">
                    <label>商业LPR</label>
                    <div className="input-field">
                      <input type="number" value={commercialLpr} onChange={(e) => setCommercialLpr(Number(e.target.value))} step="0.01" />
                      <span className="unit">%</span>
                    </div>
                  </div>
                  <div className="input-row">
                    <label>商业基点</label>
                    <div className="basis-points-input">
                      <button onClick={() => setCommercialBasisPoints(Math.min(300, commercialBasisPoints + 5))}>+</button>
                      <button onClick={() => setCommercialBasisPoints(Math.max(-100, commercialBasisPoints - 5))}>-</button>
                      <input type="number" value={commercialBasisPoints} onChange={(e) => setCommercialBasisPoints(Number(e.target.value))} />
                      <span className="unit">‰</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="input-row">
                  <label>{loanType === 'combined' ? '商业贷款利率' : '贷款利率'}</label>
                  <div className="input-field">
                    <input type="number" value={commercialBaseRate} onChange={(e) => setCommercialBaseRate(Number(e.target.value))} step="0.01" />
                    <span className="unit">%</span>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="input-row">
            <label>贷款年限</label>
            <div className="input-field">
              <input type="number" value={loanYears || ''} onChange={(e) => setLoanYears(e.target.value ? Number(e.target.value) : null)} placeholder="" />
              <span className="unit">年</span>
            </div>
          </div>

          <div className="input-row">
            <label>贷款方式</label>
            <div className="toggle-group">
              <button className={paymentType === 'equal' ? 'active' : ''} onClick={() => setPaymentType('equal')}>等额本息</button>
              <button className={paymentType === 'principal' ? 'active' : ''} onClick={() => setPaymentType('principal')}>等额本金</button>
            </div>
          </div>
        </div>

        {result && (
          <div className="result-container">
            <div className="result-section">
              <div className="result-header">
                <div className="payment-summary">
                  {paymentType === 'equal' ? (
                    <div className="result-main">
                      <div className="label">每月还款</div>
                      <div className="value">¥ {formatMoney(result.monthlyPayment)}</div>
                    </div>
                  ) : (
                    <>
                      <div className="result-main">
                        <div className="label">首月还款</div>
                        <div className="value">¥ {formatMoney(result.firstMonthPayment)}</div>
                      </div>
                      <div className="result-sub">末月还款：¥ {formatMoney(result.lastMonthPayment)}</div>
                    </>
                  )}
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Pie
                        data={pieData}
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                        cx="50%"
                        cy="45%"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number | undefined) => `¥${formatMoney(value ?? 0)}`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100 }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        align="center" 
                        layout="horizontal" 
                        iconSize={10}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="result-details">
                <div className="detail-item">
                  <span className="label">贷款总额</span>
                  <span className="value">¥ {formatMoney(result.loanAmount)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">还款总额</span>
                  <span className="value">¥ {formatMoney(result.totalPayment)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">支付利息</span>
                  <span className="value highlight">¥ {formatMoney(result.totalInterest)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">还款期数</span>
                  <span className="value">{(loanYears || 0) * 12} 期</span>
                </div>
              </div>
            </div>

            <div className="schedule-section">
              <button className="toggle-schedule" onClick={() => setShowSchedule(!showSchedule)}>
                {showSchedule ? '隐藏还款明细' : '查看还款明细'}
                <svg className={showSchedule ? 'open' : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              
              {showSchedule && (
                <div className="schedule-table-wrapper">
                  <table className="schedule-table">
                    <thead>
                      <tr>
                        <th>期数</th>
                        <th>月供</th>
                        <th>本金</th>
                        <th>利息</th>
                        <th>剩余</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(result.schedule as ScheduleItem[]).map((item) => (
                        <tr key={item.month}>
                          <td>{item.month}</td>
                          <td>¥{formatMoney(item.payment)}</td>
                          <td>¥{formatMoney(item.principal)}</td>
                          <td>¥{formatMoney(item.interest)}</td>
                          <td>¥{formatMoney(item.remaining)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
