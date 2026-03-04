import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'
import './UppercaseMoney.scss'

export default function UppercaseMoney() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('0')

  const digitMap = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const unitMap = ['', '拾', '佰', '仟']
  const bigUnitMap = ['', '万', '亿', '兆']

  const toUppercase = (num: number): string => {
    if (num === 0) return '零元整'
    const isNegative = num < 0
    num = Math.abs(num)
    const [intPart, decPart] = num.toFixed(2).split('.')
    const jiao = parseInt(decPart[0])
    const fen = parseInt(decPart[1])
    let result = ''
    
    if (parseInt(intPart) > 0) {
      const intStr = intPart
      const len = intStr.length
      let zeroFlag = false
      for (let i = 0; i < len; i++) {
        const digit = parseInt(intStr[i])
        const pos = len - i - 1
        const unitPos = pos % 4
        const bigUnitPos = Math.floor(pos / 4)
        if (digit === 0) {
          zeroFlag = true
          if (unitPos === 0 && bigUnitPos > 0) result += bigUnitMap[bigUnitPos]
        } else {
          if (zeroFlag) { result += '零'; zeroFlag = false }
          result += digitMap[digit] + unitMap[unitPos]
          if (unitPos === 0 && bigUnitPos > 0) result += bigUnitMap[bigUnitPos]
        }
      }
      result += '元'
    }
    
    if (jiao === 0 && fen === 0) {
      result += '整'
    } else {
      if (jiao > 0) result += digitMap[jiao] + '角'
      else if (parseInt(intPart) > 0) result += '零'
      if (fen > 0) result += digitMap[fen] + '分'
    }
    return (isNegative ? '负' : '') + result
  }

  const uppercase = useMemo(() => toUppercase(parseFloat(amount) || 0), [amount])

  const inputDigit = (digit: string) => {
    if (amount === '0' && digit !== '.') setAmount(digit)
    else {
      if (amount.includes('.')) {
        const [, dec] = amount.split('.')
        if (dec && dec.length >= 2) return
      }
      setAmount(amount + digit)
    }
  }

  const inputDecimal = () => { if (!amount.includes('.')) setAmount(amount + '.') }
  const backspace = () => { setAmount(amount.length > 1 ? amount.slice(0, -1) : '0') }
  const clear = () => { setAmount('0') }

  const copyResult = async () => {
    try { await navigator.clipboard.writeText(uppercase) } catch { /* ignore */ }
  }

  const buttons = [['7', '8', '9', 'C'], ['4', '5', '6', '⌫'], ['1', '2', '3', ''], ['0', '00', '.', '']]

  return (
    <div className="tool-page uppercase">
      <header className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="title">大写金额</h1>
        <ThemeToggle />
      </header>
      
      <main className="tool-content">
        <div className="display-area">
          <div className="amount-display">
            <span className="currency">¥</span>
            <span className="value">{amount}</span>
          </div>
          <div className="uppercase-display" onClick={copyResult}>
            <div className="label">大写金额 (点击复制)</div>
            <div className="value">{uppercase}</div>
          </div>
        </div>
        
        <div className="keypad">
          {buttons.map((row, i) => (
            <div key={i} className="row">
              {row.map((btn) => (
                <button
                  key={btn}
                  className={`key ${/[0-9.]/.test(btn) ? 'number' : ['C', '⌫'].includes(btn) ? 'function' : ''}`}
                  onClick={() => {
                    if (/[0-9]/.test(btn)) inputDigit(btn)
                    else if (btn === '00') { inputDigit('0'); inputDigit('0') }
                    else if (btn === '.') inputDecimal()
                    else if (btn === 'C') clear()
                    else if (btn === '⌫') backspace()
                  }}
                >
                  {btn}
                </button>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
