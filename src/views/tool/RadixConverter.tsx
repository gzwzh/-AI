import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'
import './RadixConverter.scss'

type InputType = 'dec' | 'bin' | 'oct' | 'hex'

export default function RadixConverter() {
  const navigate = useNavigate()
  const [decimal, setDecimal] = useState('')
  const [binary, setBinary] = useState('')
  const [octal, setOctal] = useState('')
  const [hex, setHex] = useState('')
  const [activeInput, setActiveInput] = useState<InputType>('dec')
  const [copiedType, setCopiedType] = useState<string | null>(null)

  const convert = useCallback((from: InputType, value: string) => {
    if (!value) { setDecimal(''); setBinary(''); setOctal(''); setHex(''); return }
    let num: number
    try {
      switch (from) {
        case 'dec': num = parseInt(value, 10); break
        case 'bin': num = parseInt(value, 2); break
        case 'oct': num = parseInt(value, 8); break
        case 'hex': num = parseInt(value, 16); break
        default: return
      }
      if (isNaN(num)) return
      if (from !== 'dec') setDecimal(num.toString(10))
      if (from !== 'bin') setBinary(num.toString(2))
      if (from !== 'oct') setOctal(num.toString(8))
      if (from !== 'hex') setHex(num.toString(16).toUpperCase())
    } catch { /* ignore */ }
  }, [])

  const handleInput = (type: InputType, value: string) => {
    setActiveInput(type)
    let valid = true
    switch (type) {
      case 'dec': valid = /^-?\d*$/.test(value); break
      case 'bin': valid = /^[01]*$/.test(value); break
      case 'oct': valid = /^[0-7]*$/.test(value); break
      case 'hex': valid = /^[0-9A-Fa-f]*$/.test(value); break
    }
    if (valid) {
      switch (type) {
        case 'dec': setDecimal(value); break
        case 'bin': setBinary(value); break
        case 'oct': setOctal(value); break
        case 'hex': setHex(value.toUpperCase()); break
      }
      convert(type, value)
    }
  }

  const clear = () => { setDecimal(''); setBinary(''); setOctal(''); setHex('') }

  const copyToClipboard = async (type: InputType) => {
    const value = type === 'bin' ? binary : type === 'dec' ? decimal : type === 'oct' ? octal : hex
    if (value) {
      try {
        await navigator.clipboard.writeText(value)
        setCopiedType(type)
        setTimeout(() => setCopiedType(null), 1500)
      } catch { /* ignore */ }
    }
  }

  const inputDigit = (digit: string) => {
    const current = activeInput === 'dec' ? decimal : activeInput === 'bin' ? binary : activeInput === 'oct' ? octal : hex
    handleInput(activeInput, current + digit)
  }

  const backspace = () => {
    const current = activeInput === 'dec' ? decimal : activeInput === 'bin' ? binary : activeInput === 'oct' ? octal : hex
    if (current.length > 0) handleInput(activeInput, current.slice(0, -1))
  }

  const decButtons = [['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3'], ['0', 'C', '⌫']]
  const hexButtons = [['A', 'B', 'C'], ['D', 'E', 'F']]

  return (
    <div className="tool-page radix">
      <header className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="title">进制转换</h1>
        <ThemeToggle />
      </header>
      
      <main className="tool-content">
        <div className="input-group">
          {(['dec', 'bin', 'oct', 'hex'] as const).map((type) => (
            <div key={type} className={`input-row ${activeInput === type ? 'active' : ''}`}>
              <label>{type === 'dec' ? '十进制 (DEC)' : type === 'bin' ? '二进制 (BIN)' : type === 'oct' ? '八进制 (OCT)' : '十六进制 (HEX)'}</label>
              <input
                type="text"
                value={type === 'dec' ? decimal : type === 'bin' ? binary : type === 'oct' ? octal : hex}
                onChange={(e) => handleInput(type, e.target.value)}
                onFocus={() => setActiveInput(type)}
                placeholder="0"
              />
            </div>
          ))}
        </div>

        <div className="copy-section">
          <div className="copy-title">复制结果</div>
          <div className="copy-buttons">
            {(['bin', 'dec', 'oct', 'hex'] as const).map((type) => (
              <button key={type} onClick={() => copyToClipboard(type)} className={copiedType === type ? 'copied' : ''}>
                {copiedType === type ? '已复制' : type === 'bin' ? '二进制' : type === 'dec' ? '十进制' : type === 'oct' ? '八进制' : '十六进制'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="keypad">
          {activeInput === 'hex' && (
            <div className="hex-keys">
              {hexButtons.map((row, i) => (
                <div key={i} className="row">
                  {row.map((btn) => <button key={btn} className="key hex" onClick={() => inputDigit(btn)}>{btn}</button>)}
                </div>
              ))}
            </div>
          )}
          <div className="num-keys">
            {decButtons.map((row, i) => (
              <div key={i} className="row">
                {row.map((btn) => (
                  <button
                    key={btn}
                    className={`key ${['C', '⌫'].includes(btn) ? 'function' : ''}`}
                    disabled={activeInput === 'bin' && !['0', '1', 'C', '⌫'].includes(btn)}
                    style={activeInput === 'oct' && parseInt(btn) > 7 ? { opacity: 0.3 } : {}}
                    onClick={() => btn === 'C' ? clear() : btn === '⌫' ? backspace() : inputDigit(btn)}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
