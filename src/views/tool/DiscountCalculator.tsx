import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ToolHeader from '@/components/ToolHeader'
import './DiscountCalculator.scss'

export default function DiscountCalculator() {
  const navigate = useNavigate()
  const location = useLocation()
  const [originalPrice, setOriginalPrice] = useState<number>(0)
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent')
  const [discountRate, setDiscountRate] = useState<number>(10) // 10% off
  const [discountAmountInput, setDiscountAmountInput] = useState<number>(0) // flat discount
  const [tipRate, setTipRate] = useState<number>(0) // 0% tip
  const [splitCount, setSplitCount] = useState<number>(1)

  useEffect(() => {
    if (location.state) {
      const { price, discount, tip, discountType: type } = location.state
      if (price !== undefined) setOriginalPrice(Number(price))
      if (discount !== undefined) {
        if (type === 'amount') setDiscountAmountInput(Number(discount))
        else setDiscountRate(Number(discount))
      }
      if (tip !== undefined) setTipRate(Number(tip))
      if (type !== undefined) setDiscountType(type)
    }
  }, [location.state])

  const calculation = useMemo(() => {
    const discountAmount = discountType === 'percent' 
      ? originalPrice * (discountRate / 100)
      : Math.min(discountAmountInput, originalPrice)
    
    const discountedPrice = originalPrice - discountAmount
    const tipAmount = discountedPrice * (tipRate / 100)
    const totalPrice = discountedPrice + tipAmount
    const perPerson = totalPrice / splitCount

    return {
      discountAmount: discountAmount.toFixed(2),
      discountedPrice: discountedPrice.toFixed(2),
      tipAmount: tipAmount.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      perPerson: perPerson.toFixed(2)
    }
  }, [originalPrice, discountType, discountRate, discountAmountInput, tipRate, splitCount])

  return (
    <div className="tool-page discount">
      <ToolHeader title="折扣与小费" />

      <main className="tool-content">
        <div className="input-section">
          <div className="input-group">
            <label>原价</label>
            <div className="flat-input-wrapper">
              <input 
                type="number" 
                value={originalPrice || ''} 
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                placeholder="请输入金额"
              />
              <span className="unit">元</span>
            </div>
          </div>

          <div className="input-group">
            <div className="label-with-toggle">
              <label>折扣</label>
              <div className="type-toggle">
                <button 
                  className={discountType === 'percent' ? 'active' : ''} 
                  onClick={() => setDiscountType('percent')}
                >
                  百分比
                </button>
                <button 
                  className={discountType === 'amount' ? 'active' : ''} 
                  onClick={() => setDiscountType('amount')}
                >
                  直减金额
                </button>
              </div>
            </div>
            {discountType === 'percent' ? (
              <>
                <div className="quick-options">
                  {[5, 10, 20, 50, 75].map(rate => (
                    <button 
                      key={rate} 
                      className={`quick-btn ${discountRate === rate ? 'active' : ''}`}
                      onClick={() => setDiscountRate(rate)}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
                <div className="slider-container">
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={discountRate} 
                    onChange={(e) => setDiscountRate(Number(e.target.value))}
                  />
                  <span className="value-label">{discountRate}% OFF</span>
                </div>
              </>
            ) : (
              <div className="flat-input-wrapper">
                <input 
                  type="number" 
                  value={discountAmountInput || ''} 
                  onChange={(e) => setDiscountAmountInput(Number(e.target.value))}
                  placeholder="请输入直减金额"
                />
                <span className="unit">元</span>
              </div>
            )}
          </div>

          <div className="input-group">
            <label>小费 (%)</label>
            <div className="quick-options">
              {[10, 15, 18, 20, 25].map(rate => (
                <button 
                  key={rate} 
                  className={`quick-btn ${tipRate === rate ? 'active' : ''}`}
                  onClick={() => setTipRate(rate)}
                >
                  {rate}%
                </button>
              ))}
            </div>
            <div className="slider-container">
              <input 
                type="range" 
                min="0" max="30" 
                value={tipRate} 
                onChange={(e) => setTipRate(Number(e.target.value))}
              />
              <span className="value-label">{tipRate}% TIP</span>
            </div>
          </div>

          <div className="input-group">
            <label>分摊人数</label>
            <div className="stepper">
              <button onClick={() => setSplitCount(Math.max(1, splitCount - 1))}>-</button>
              <span className="count">{splitCount} 人</span>
              <button onClick={() => setSplitCount(splitCount + 1)}>+</button>
            </div>
          </div>
        </div>

        <div className="result-panel">
          <div className="result-item">
            <span>折扣省下</span>
            <span className="value">¥ {calculation.discountAmount}</span>
          </div>
          <div className="result-item">
            <span>折后价格</span>
            <span className="value">¥ {calculation.discountedPrice}</span>
          </div>
          <div className="result-item">
            <span>小费金额</span>
            <span className="value">¥ {calculation.tipAmount}</span>
          </div>
          <div className="divider"></div>
          <div className="result-total">
            <div className="total-label">总计支付</div>
            <div className="total-value">¥ {calculation.totalPrice}</div>
          </div>
          {splitCount > 1 && (
            <div className="per-person">
              每人应付: ¥ {calculation.perPerson}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
