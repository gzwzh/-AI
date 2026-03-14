import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ToolHeader from '@/components/ToolHeader'
import './FractionCalculator.scss'

interface MixedFraction {
  whole: number
  numerator: number
  denominator: number
}

type ActiveInput = 'w1' | 'n1' | 'd1' | 'w2' | 'n2' | 'd2'

export default function FractionCalculator() {
  const navigate = useNavigate()
  const [fraction1, setFraction1] = useState<MixedFraction>({ whole: 0, numerator: 0, denominator: 1 })
  const [fraction2, setFraction2] = useState<MixedFraction>({ whole: 0, numerator: 0, denominator: 1 })
  const [result, setResult] = useState<MixedFraction>({ whole: 0, numerator: 0, denominator: 1 })
  const [operator, setOperator] = useState<'+' | '-' | '×' | '÷'>('+')
  const [activeInput, setActiveInput] = useState<ActiveInput>('n1')
  const [hasCalculated, setHasCalculated] = useState(false)
  const [error, setError] = useState('')

  const gcd = (a: number, b: number): number => {
    a = Math.abs(a)
    b = Math.abs(b)
    while (b) { const t = b; b = a % b; a = t }
    return a
  }

  const toImproper = (f: MixedFraction) => {
    const sign = f.whole < 0 ? -1 : 1
    const absWhole = Math.abs(f.whole)
    const num = sign * (absWhole * f.denominator + f.numerator)
    return { num, den: f.denominator }
  }

  const toMixed = (num: number, den: number): MixedFraction => {
    if (den === 0) return { whole: 0, numerator: 0, denominator: 1 }
    const g = gcd(num, den)
    num = num / g
    den = den / g
    if (den < 0) { num = -num; den = -den }
    const sign = num < 0 ? -1 : 1
    num = Math.abs(num)
    const whole = sign * Math.floor(num / den)
    const remainder = num % den
    return { whole, numerator: remainder, denominator: den }
  }

  const calculate = () => {
    setError('')
    if (fraction1.denominator === 0 || fraction2.denominator === 0) {
      setError('分母不能为0')
      setHasCalculated(false)
      return
    }

    const f1 = toImproper(fraction1)
    const f2 = toImproper(fraction2)

    let resNum = 0, resDen = 1
    switch (operator) {
      case '+': resNum = f1.num * f2.den + f2.num * f1.den; resDen = f1.den * f2.den; break
      case '-': resNum = f1.num * f2.den - f2.num * f1.den; resDen = f1.den * f2.den; break
      case '×': resNum = f1.num * f2.num; resDen = f1.den * f2.den; break
      case '÷':
        if (f2.num === 0) { 
          setError('除数不能为0')
          setHasCalculated(false)
          return 
        }
        resNum = f1.num * f2.den; resDen = f1.den * f2.num; break
    }
    setResult(toMixed(resNum, resDen))
    setHasCalculated(true)
  }

  const toDecimal = useMemo(() => {
    const f = toImproper(result)
    if (f.den === 0) return '0'
    return (f.num / f.den).toFixed(6).replace(/\.?0+$/, '')
  }, [result])

  const inputDigit = (digit: string) => {
    const isFirst = activeInput.endsWith('1')
    const fraction = isFirst ? fraction1 : fraction2
    const setFraction = isFirst ? setFraction1 : setFraction2
    const field = activeInput.startsWith('w') ? 'whole' : activeInput.startsWith('n') ? 'numerator' : 'denominator'
    const current = Math.abs(fraction[field])
    const newValue = current * 10 + parseInt(digit)
    if (newValue <= 9999) {
      const sign = fraction[field] < 0 ? -1 : 1
      setFraction({ ...fraction, [field]: newValue * (field === 'whole' ? sign : 1) })
    }
    setHasCalculated(false)
    setError('')
  }

  const toggleSign = () => {
    const isFirst = activeInput.endsWith('1')
    const fraction = isFirst ? fraction1 : fraction2
    const setFraction = isFirst ? setFraction1 : setFraction2
    setFraction({ ...fraction, whole: -fraction.whole })
    setHasCalculated(false)
    setError('')
  }

  const backspace = () => {
    const isFirst = activeInput.endsWith('1')
    const fraction = isFirst ? fraction1 : fraction2
    const setFraction = isFirst ? setFraction1 : setFraction2
    const field = activeInput.startsWith('w') ? 'whole' : activeInput.startsWith('n') ? 'numerator' : 'denominator'
    const sign = fraction[field] < 0 ? -1 : 1
    const newValue = Math.floor(Math.abs(fraction[field]) / 10)
    setFraction({ ...fraction, [field]: newValue * (field === 'whole' ? sign : 1) })
    setHasCalculated(false)
    setError('')
  }

  const clear = () => {
    setFraction1({ whole: 0, numerator: 0, denominator: 1 })
    setFraction2({ whole: 0, numerator: 0, denominator: 1 })
    setResult({ whole: 0, numerator: 0, denominator: 1 })
    setHasCalculated(false)
    setActiveInput('n1')
    setError('')
  }

  const buttons = [['7', '8', '9', 'C'], ['4', '5', '6', '⌫'], ['1', '2', '3', '±'], ['0', 'empty1', 'empty2', '=']]

  return (
    <div className="calculator-page fraction">
      <ToolHeader title="分数计算器" />
      
      <main className="calculator">
        <div className="fraction-area">
          <div className="mixed-fraction">
            <div className={`whole-part ${activeInput === 'w1' ? 'active' : ''}`} onClick={() => setActiveInput('w1')}>
              {fraction1.whole || ''}
            </div>
            <div className="fraction-part">
              <div className={`numerator ${activeInput === 'n1' ? 'active' : ''}`} onClick={() => setActiveInput('n1')}>
                {fraction1.numerator}
              </div>
              <div className="fraction-line"></div>
              <div className={`denominator ${activeInput === 'd1' ? 'active' : ''}`} onClick={() => setActiveInput('d1')}>
                {fraction1.denominator}
              </div>
            </div>
          </div>
          
          <div className="operator-group">
            {(['+', '-', '×', '÷'] as const).map((op) => (
              <button key={op} className={operator === op ? 'active' : ''} onClick={() => { setOperator(op); setHasCalculated(false) }}>
                {op}
              </button>
            ))}
          </div>
          
          <div className="mixed-fraction">
            <div className={`whole-part ${activeInput === 'w2' ? 'active' : ''}`} onClick={() => setActiveInput('w2')}>
              {fraction2.whole || ''}
            </div>
            <div className="fraction-part">
              <div className={`numerator ${activeInput === 'n2' ? 'active' : ''}`} onClick={() => setActiveInput('n2')}>
                {fraction2.numerator}
              </div>
              <div className="fraction-line"></div>
              <div className={`denominator ${activeInput === 'd2' ? 'active' : ''}`} onClick={() => setActiveInput('d2')}>
                {fraction2.denominator}
              </div>
            </div>
          </div>
        </div>
        
        {error && <div className="error-message" style={{color: '#ff4d4f', textAlign: 'center', marginBottom: '16px', fontSize: '14px'}}>{error}</div>}

        {hasCalculated && (
          <div className="result-area">
            <span className="equals">=</span>
            <div className="mixed-fraction result">
              {result.whole !== 0 && <div className="whole-part">{result.whole}</div>}
              {(result.numerator !== 0 || result.whole === 0) && (
                <div className="fraction-part">
                  <div className="numerator">{result.numerator}</div>
                  <div className="fraction-line"></div>
                  <div className="denominator">{result.denominator}</div>
                </div>
              )}
            </div>
            <span className="decimal">≈ {toDecimal}</span>
          </div>
        )}

        <div className="keypad">
          {buttons.map((row, i) => (
            <div key={i} className="row">
              {row.map((btn, j) => (
                <button
                  key={btn || `empty-${i}-${j}`}
                  className={`key ${/[0-9]/.test(btn) ? 'number' : ['C', '⌫', '±'].includes(btn) ? 'function' : btn === '=' ? 'equals' : ''}`}
                  onClick={() => {
                    if (/[0-9]/.test(btn)) inputDigit(btn)
                    else if (btn === 'C') clear()
                    else if (btn === '⌫') backspace()
                    else if (btn === '±') toggleSign()
                    else if (btn === '=') calculate()
                  }}
                >
                  {btn.startsWith('empty') ? '' : btn}
                </button>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
