import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ToolHeader from '@/components/ToolHeader'
import './CurrencyConverter.scss'

interface Currency {
  code: string
  name: string
  symbol: string
  rate: number
}

const defaultCurrencies: Currency[] = [
  { code: 'CNY', name: '人民币', symbol: '¥', rate: 1 },
  { code: 'USD', name: '美元', symbol: '$', rate: 7.24 },
  { code: 'EUR', name: '欧元', symbol: '€', rate: 7.86 },
  { code: 'GBP', name: '英镑', symbol: '£', rate: 9.18 },
  { code: 'JPY', name: '日元', symbol: '¥', rate: 0.048 },
  { code: 'KRW', name: '韩元', symbol: '₩', rate: 0.0052 },
  { code: 'HKD', name: '港币', symbol: 'HK$', rate: 0.93 },
  { code: 'TWD', name: '新台币', symbol: 'NT$', rate: 0.22 },
  { code: 'SGD', name: '新加坡元', symbol: 'S$', rate: 5.38 },
  { code: 'AUD', name: '澳元', symbol: 'A$', rate: 4.72 },
  { code: 'CAD', name: '加元', symbol: 'C$', rate: 5.28 },
  { code: 'CHF', name: '瑞士法郎', symbol: 'Fr', rate: 8.12 },
]

export default function CurrencyConverter() {
  const navigate = useNavigate()
  const location = useLocation()
  const [currencies] = useState<Currency[]>(() => {
    const saved = localStorage.getItem('currencies')
    if (saved) try { return JSON.parse(saved) } catch { return [...defaultCurrencies] }
    return [...defaultCurrencies]
  })
  const [fromCurrency, setFromCurrency] = useState(0)
  const [toCurrency, setToCurrency] = useState(1)
  const [fromValue, setFromValue] = useState('100')

  useEffect(() => {
    if (location.state) {
      const { from, to, amount } = location.state
      if (from) {
        const fromIndex = currencies.findIndex(c => c.code === from)
        if (fromIndex !== -1) setFromCurrency(fromIndex)
      }
      if (to) {
        const toIndex = currencies.findIndex(c => c.code === to)
        if (toIndex !== -1) setToCurrency(toIndex)
      }
      if (amount !== undefined) {
        setFromValue(String(amount))
      }
    }
  }, [location.state, currencies])

  const toValue = useMemo(() => {
    const amount = parseFloat(fromValue) || 0
    const from = currencies[fromCurrency]
    const to = currencies[toCurrency]
    const cnyAmount = amount * from.rate
    const result = cnyAmount / to.rate
    return result.toFixed(4).replace(/\.?0+$/, '')
  }, [fromValue, fromCurrency, toCurrency, currencies])

  const exchangeRate = useMemo(() => {
    const from = currencies[fromCurrency]
    const to = currencies[toCurrency]
    return (from.rate / to.rate).toFixed(6)
  }, [fromCurrency, toCurrency, currencies])

  const swapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
  }

  const inputDigit = (digit: string) => {
    if (fromValue === '0' && digit !== '.') setFromValue(digit)
    else setFromValue(fromValue + digit)
  }

  const inputDecimal = () => { if (!fromValue.includes('.')) setFromValue(fromValue + '.') }
  const backspace = () => { setFromValue(fromValue.length > 1 ? fromValue.slice(0, -1) : '0') }
  const clear = () => { setFromValue('0') }

  const buttons = [['7', '8', '9', 'C'], ['4', '5', '6', '⌫'], ['1', '2', '3', '↔'], ['0', '00', '.', 'empty']]

  return (
    <div className="tool-page currency">
      <ToolHeader title="汇率换算" />
      
      <main className="tool-content">
        <div className="convert-area">
          <div className="currency-row">
            <select value={fromCurrency} onChange={(e) => setFromCurrency(Number(e.target.value))} className="currency-select">
              {currencies.map((c, i) => <option key={c.code} value={i}>{c.symbol} {c.name} ({c.code})</option>)}
            </select>
            <div className="value-display from">{fromValue}</div>
          </div>
          
          <div className="exchange-info">
            <button className="swap-btn" onClick={swapCurrencies}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4"/>
              </svg>
            </button>
            <span className="rate">1 {currencies[fromCurrency].code} = {exchangeRate} {currencies[toCurrency].code}</span>
          </div>
          
          <div className="currency-row">
            <select value={toCurrency} onChange={(e) => setToCurrency(Number(e.target.value))} className="currency-select">
              {currencies.map((c, i) => <option key={c.code} value={i}>{c.symbol} {c.name} ({c.code})</option>)}
            </select>
            <div className="value-display to">{toValue}</div>
          </div>
        </div>
        
        <div className="keypad">
          {buttons.map((row, i) => (
            <div key={i} className="row">
              {row.map((btn, j) => (
                <button
                  key={btn || `empty-${i}-${j}`}
                  className={`key ${/[0-9.]/.test(btn) ? 'number' : 'function'}`}
                  onClick={() => {
                    if (/[0-9]/.test(btn)) inputDigit(btn)
                    else if (btn === '00') { inputDigit('0'); inputDigit('0') }
                    else if (btn === '.') inputDecimal()
                    else if (btn === 'C') clear()
                    else if (btn === '⌫') backspace()
                    else if (btn === '↔') swapCurrencies()
                  }}
                >
                  {btn === 'empty' ? '' : btn}
                </button>
              ))}
            </div>
          ))}
        </div>
        
        <div className="update-hint">💡 汇率为参考值</div>
      </main>
    </div>
  )
}
