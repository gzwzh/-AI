import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ToolHeader from '@/components/ToolHeader'
import './DiscountCalculator.scss'

export default function DiscountCalculator() {
  const { t } = useTranslation()
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
      <ToolHeader title={t('tool.discount.title')} />

      <main className="tool-content">
        <div className="input-section">
          <div className="input-group">
            <label>{t('tool.discount.original_price')}</label>
            <div className="flat-input-wrapper">
              <input 
                type="number" 
                value={originalPrice || ''} 
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                placeholder={t('tool.discount.price_placeholder')}
              />
              <span className="unit">元</span>
            </div>
          </div>

          <div className="input-group">
            <div className="label-with-toggle">
              <label>{t('tool.discount.discount_label')}</label>
              <div className="type-toggle">
                <button 
                  className={discountType === 'percent' ? 'active' : ''} 
                  onClick={() => setDiscountType('percent')}
                >
                  {t('tool.discount.percent')}
                </button>
                <button 
                  className={discountType === 'amount' ? 'active' : ''} 
                  onClick={() => setDiscountType('amount')}
                >
                  {t('tool.discount.flat_amount')}
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
                    min="0" 
                    max="100" 
                    value={discountRate} 
                    onChange={(e) => setDiscountRate(Number(e.target.value))}
                  />
                  <span className="rate-display">{discountRate}% OFF</span>
                </div>
              </>
            ) : (
              <div className="flat-input-wrapper">
                <input 
                  type="number" 
                  value={discountAmountInput || ''} 
                  onChange={(e) => setDiscountAmountInput(Number(e.target.value))}
                  placeholder={t('tool.discount.price_placeholder')}
                />
                <span className="unit">元</span>
              </div>
            )}
          </div>

          <div className="input-group">
            <label>{t('tool.discount.tip_label')}</label>
            <div className="quick-options">
              {[0, 10, 15, 18, 20].map(rate => (
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
                min="0" 
                max="50" 
                value={tipRate} 
                onChange={(e) => setTipRate(Number(e.target.value))}
              />
              <span className="rate-display">{tipRate}% TIP</span>
            </div>
          </div>

          <div className="input-group">
            <label>{t('tool.discount.split_label')}</label>
            <div className="split-input">
              <button onClick={() => setSplitCount(Math.max(1, splitCount - 1))}>-</button>
              <input 
                type="number" 
                value={splitCount} 
                onChange={(e) => setSplitCount(Math.max(1, Number(e.target.value)))}
              />
              <button onClick={() => setSplitCount(splitCount + 1)}>+</button>
              <span className="unit">{t('tool.discount.person_unit')}</span>
            </div>
          </div>
        </div>

        <div className="result-card">
          <h3>{t('tool.discount.result_title')}</h3>
          <div className="result-grid">
            <div className="result-item">
              <span className="label">{t('tool.discount.saved_amount')}</span>
              <span className="value expense">-¥ {calculation.discountAmount}</span>
            </div>
            <div className="result-item">
              <span className="label">{t('tool.discount.discounted_price')}</span>
              <span className="value">¥ {calculation.discountedPrice}</span>
            </div>
            <div className="result-item">
              <span className="label">{t('tool.discount.tip_amount')}</span>
              <span className="value">¥ {calculation.tipAmount}</span>
            </div>
            <div className="divider"></div>
            <div className="result-item total">
              <span className="label">{t('tool.discount.total_price')}</span>
              <span className="value">¥ {calculation.totalPrice}</span>
            </div>
            {splitCount > 1 && (
              <div className="result-item per-person">
                <span className="label">{t('tool.discount.per_person')}</span>
                <span className="value highlight">¥ {calculation.perPerson}</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
