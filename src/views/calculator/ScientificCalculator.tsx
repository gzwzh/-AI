import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { evaluate, pi, e, factorial, sin, cos, tan, log10, log } from 'mathjs'
import ThemeToggle from '@/components/ThemeToggle'
import HistorySidebar from '@/components/HistorySidebar'
import { useHistoryStore } from '@/stores/history'
import './ScientificCalculator.scss'

export default function ScientificCalculator() {
  const navigate = useNavigate()
  const addHistory = useHistoryStore((state) => state.addHistory)
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [waitingForOperand, setWaitingForOperand] = useState(true)
  const [lastInputWasOperator, setLastInputWasOperator] = useState(false)
  const [isRadians, setIsRadians] = useState(false)
  const [openParenCount, setOpenParenCount] = useState(0)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const buttons = [
    ['fx', 'DEG', 'xʸ', 'ʸ√x', 'C'],
    ['sin', '(', ')', 'n!', '⌫'],
    ['cos', '1/x', 'π', 'e', '÷'],
    ['tan', '7', '8', '9', '×'],
    ['cot', '4', '5', '6', '-'],
    ['ln', '1', '2', '3', '+'],
    ['lg', '%', '0', '.', '='],
  ]

  const getButtonClass = (btn: string) => {
    if (btn === '=') return 'equals'
    if (['÷', '×', '-', '+'].includes(btn)) return 'operator'
    if (/^[0-9]$/.test(btn) || btn === '.') return 'number'
    return 'function'
  }

  const toRadians = (deg: number) => deg * Math.PI / 180

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? digit : display + digit)
    }
    setLastInputWasOperator(false)
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
      return
    }
    if (!display.includes('.')) setDisplay(display + '.')
    setLastInputWasOperator(false)
  }

  const inputPercent = () => {
    const value = parseFloat(display)
    setDisplay(String(value / 100))
    setWaitingForOperand(true)
  }

  const clear = () => {
    setDisplay('0')
    setExpression('')
    setWaitingForOperand(true)
    setLastInputWasOperator(false)
    setOpenParenCount(0)
  }

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay('0')
      setWaitingForOperand(true)
    }
  }

  const inputConstant = (constant: string) => {
    setDisplay(constant === 'π' ? String(pi) : String(e))
    setWaitingForOperand(true)
    setLastInputWasOperator(false)
  }

  const inputParenthesis = (paren: string) => {
    let newExpr = expression
    let newOpenParenCount = openParenCount
    
    if (paren === '(') {
      if (!waitingForOperand) newExpr += display + '×'
      newExpr += '('
      newOpenParenCount++
      setWaitingForOperand(true)
    } else if (paren === ')' && openParenCount > 0) {
      if (!waitingForOperand) newExpr += display
      newExpr += ')'
      newOpenParenCount--
      setWaitingForOperand(true)
    }
    setExpression(newExpr)
    setOpenParenCount(newOpenParenCount)
    setLastInputWasOperator(false)
  }

  const applyFunction = (func: string) => {
    const value = parseFloat(display)
    let result: any
    
    try {
      switch (func) {
        case 'sin': result = isRadians ? sin(value) : sin(toRadians(value)); break
        case 'cos': result = isRadians ? cos(value) : cos(toRadians(value)); break
        case 'tan': result = isRadians ? tan(value) : tan(toRadians(value)); break
        case 'cot': 
          const tanVal = isRadians ? tan(value) : tan(toRadians(value))
          result = 1 / tanVal
          break
        case 'ln': result = log(value); break
        case 'lg': result = log10(value); break
        case '1/x': result = 1 / value; break
        case 'n!': result = factorial(Math.floor(value)); break
        default: return
      }
      
      const resultStr = String(Number(result.toFixed(10)))
      setDisplay(resultStr)
      setWaitingForOperand(true)
      setLastInputWasOperator(false)
    } catch {
      setDisplay('Error')
    }
  }

  const performOperation = (operator: string) => {
    const current = display
    
    if (operator === '=') {
      if (expression) {
        let finalExpr = expression
        if (!waitingForOperand) finalExpr += current
        let tempOpenParenCount = openParenCount
        while (tempOpenParenCount > 0) {
          finalExpr += ')'
          tempOpenParenCount--
        }
        try {
          const evalExpr = finalExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**')
          const result = evaluate(evalExpr)
          const resultStr = String(Number(result.toFixed(10)))
          
          addHistory({
            expression: finalExpr,
            result: resultStr,
            type: 'scientific'
          })
          
          setDisplay(resultStr)
          setExpression('')
          setOpenParenCount(0)
        } catch {
          setDisplay('Error')
        }
      }
      setWaitingForOperand(true)
      setLastInputWasOperator(false)
      return
    }
    
    if (operator === 'xʸ') {
      if (!waitingForOperand || !lastInputWasOperator) {
        setExpression(expression + current + '^')
      }
      setWaitingForOperand(true)
      setLastInputWasOperator(true)
      return
    }
    
    if (operator === 'ʸ√x') {
      if (!waitingForOperand) {
        setExpression(expression + current + '^(1/')
        setOpenParenCount(openParenCount + 1)
      }
      setWaitingForOperand(true)
      setLastInputWasOperator(true)
      return
    }
    
    let newExpr = expression
    if (!waitingForOperand) {
      newExpr += current + operator
    } else if (lastInputWasOperator) {
      newExpr = newExpr.slice(0, -1) + operator
    } else {
      newExpr += current + operator
    }
    
    setExpression(newExpr)
    setWaitingForOperand(true)
    setLastInputWasOperator(true)
  }

  const handleButton = (btn: string) => {
    if (/^[0-9]$/.test(btn)) inputDigit(btn)
    else if (btn === '.') inputDecimal()
    else if (btn === '%') inputPercent()
    else if (btn === 'C') clear()
    else if (btn === '⌫') backspace()
    else if (btn === 'π' || btn === 'e') inputConstant(btn)
    else if (btn === '(' || btn === ')') inputParenthesis(btn)
    else if (btn === 'DEG') setIsRadians(!isRadians)
    else if (btn === 'fx') { /* reserved */ }
    else if (['sin', 'cos', 'tan', 'cot', 'ln', 'lg', '1/x', 'n!'].includes(btn)) applyFunction(btn)
    else if (['÷', '×', '-', '+', '=', 'xʸ', 'ʸ√x'].includes(btn)) performOperation(btn)
  }

  const displayExpression = useMemo(() => expression || '', [expression])

  return (
    <div className="calculator-page scientific">
      <header className="header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="title">科学计算器</h1>
        <div className="header-actions">
          <button className="history-btn" onClick={() => setIsHistoryOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
            </svg>
          </button>
          <ThemeToggle />
        </div>
      </header>

      <HistorySidebar />
      
      <main className="calculator">
        <div className="display">
          <div className="mode-indicator">{isRadians ? 'RAD' : 'DEG'}</div>
          <div className="expression">{displayExpression}</div>
          <div className="result-container">
            <div className="result">{display}</div>
            <div className="result-actions">
              <button 
                className="action-btn" 
                onClick={() => {
                  navigator.clipboard.writeText(display)
                }} 
                title="复制结果"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
              <button 
                className="action-btn" 
                onClick={() => {
                  navigate('/tool/uppercase', { state: { amount: display } })
                }} 
                title="转大写金额"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/><path d="M12 8v4l3 3"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="keypad">
          {buttons.map((row, i) => (
            <div key={i} className="row">
              {row.map((btn) => (
                <button
                  key={btn}
                  className={`key ${getButtonClass(btn)} ${btn === 'DEG' && isRadians ? 'active' : ''}`}
                  onClick={() => handleButton(btn)}
                >
                  {btn === 'DEG' ? (isRadians ? 'RAD' : 'DEG') : btn}
                </button>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
