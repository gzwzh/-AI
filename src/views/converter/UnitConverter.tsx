import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'
import { unitConfigs, convertTemperature } from '@/config/units'
import './UnitConverter.scss'

export default function UnitConverter() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const config = useMemo(() => type ? unitConfigs[type] : null, [type])
  
  const [fromUnit, setFromUnit] = useState(0)
  const [toUnit, setToUnit] = useState(1)
  const [fromValue, setFromValue] = useState('1')
  const [toValue, setToValue] = useState('')

  const formatNumber = (num: number): string => {
    if (Math.abs(num) < 0.000001 || Math.abs(num) > 999999999) {
      return num.toExponential(6)
    }
    const str = num.toPrecision(10)
    return parseFloat(str).toString()
  }

  const convert = () => {
    const value = parseFloat(fromValue) || 0
    const units = config?.units
    if (!units) return
    
    const from = units[fromUnit]
    const to = units[toUnit]
    
    if (type === 'temperature') {
      const result = convertTemperature(value, from.symbol, to.symbol)
      setToValue(formatNumber(result))
    } else {
      const baseValue = value * from.toBase
      const result = baseValue / to.toBase
      setToValue(formatNumber(result))
    }
  }

  useEffect(() => { convert() }, [fromUnit, toUnit, fromValue, config])

  const swapUnits = () => {
    const temp = fromUnit
    setFromUnit(toUnit)
    setToUnit(temp)
    setFromValue(toValue)
  }

  const inputDigit = (digit: string) => {
    if (fromValue === '0' && digit !== '.') setFromValue(digit)
    else setFromValue(fromValue + digit)
  }

  const inputDecimal = () => {
    if (!fromValue.includes('.')) setFromValue(fromValue + '.')
  }

  const backspace = () => {
    if (fromValue.length > 1) setFromValue(fromValue.slice(0, -1))
    else setFromValue('0')
  }

  const clear = () => { setFromValue('0'); setToValue('0') }

  const toggleSign = () => {
    if (fromValue.startsWith('-')) setFromValue(fromValue.slice(1))
    else if (fromValue !== '0') setFromValue('-' + fromValue)
  }

  const buttons = [['7', '8', '9', 'C'], ['4', '5', '6', '⌫'], ['1', '2', '3', '±'], ['0', '.', '', '↔']]

  if (!config) return null

  return (
    <div className="converter-page">
      <header className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="title">{config.name}转换</h1>
        <ThemeToggle />
      </header>
      
      <main className="converter">
        <div className="convert-area">
          <div className="unit-row">
            <select value={fromUnit} onChange={(e) => setFromUnit(Number(e.target.value))} className="unit-select">
              {config.units.map((unit, i) => (
                <option key={i} value={i}>{unit.name} ({unit.symbol})</option>
              ))}
            </select>
            <div className="value-display from">{fromValue}</div>
          </div>
          
          <button className="swap-btn" onClick={swapUnits}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4"/>
            </svg>
          </button>
          
          <div className="unit-row">
            <select value={toUnit} onChange={(e) => setToUnit(Number(e.target.value))} className="unit-select">
              {config.units.map((unit, i) => (
                <option key={i} value={i}>{unit.name} ({unit.symbol})</option>
              ))}
            </select>
            <div className="value-display to">{toValue}</div>
          </div>
        </div>
        
        <div className="keypad">
          {buttons.map((row, i) => (
            <div key={i} className="row">
              {row.map((btn) => (
                <button
                  key={btn}
                  className={`key ${/[0-9.]/.test(btn) ? 'number' : 'function'}`}
                  onClick={() => {
                    if (/[0-9]/.test(btn)) inputDigit(btn)
                    else if (btn === '.') inputDecimal()
                    else if (btn === 'C') clear()
                    else if (btn === '⌫') backspace()
                    else if (btn === '±') toggleSign()
                    else if (btn === '↔') swapUnits()
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
