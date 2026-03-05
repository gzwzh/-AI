import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { evaluate } from 'mathjs'
import ToolHeader from '@/components/ToolHeader'
import HistorySidebar from '@/components/HistorySidebar'
import { useHistoryStore } from '@/stores/history'
import './BasicCalculator.scss'

export default function BasicCalculator() {
  const navigate = useNavigate()
  const addHistory = useHistoryStore((state) => state.addHistory)
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [waitingForOperand, setWaitingForOperand] = useState(true)
  const [lastInputWasOperator, setLastInputWasOperator] = useState(false)
  const [openParenCount, setOpenParenCount] = useState(0)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const buttons = [
    ['C', '()', '⌫', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['%', '0', '.', '='],
  ]

  const getButtonClass = (btn: string) => {
    if (btn === '=') return 'equals'
    if (['÷', '×', '-', '+'].includes(btn)) return 'operator'
    if (['C', '()', '⌫', '%'].includes(btn)) return 'function'
    return 'number'
  }

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
    if (!display.includes('.')) {
      setDisplay(display + '.')
    }
    setLastInputWasOperator(false)
  }

  const inputPercent = () => {
    const value = parseFloat(display)
    const percentValue = value / 100
    setDisplay(String(percentValue))
    setWaitingForOperand(false)
    setLastInputWasOperator(false)
  }

  const clear = () => {
    setDisplay('0')
    setExpression('')
    setWaitingForOperand(true)
    setLastInputWasOperator(false)
    setOpenParenCount(0)
  }

  const backspace = () => {
    if (waitingForOperand && expression) {
      const lastChar = expression.slice(-1)
      let newExpr = expression.slice(0, -1)
      let newOpenParenCount = openParenCount
      
      if (['÷', '×', '-', '+'].includes(lastChar)) {
        setLastInputWasOperator(false)
        const match = newExpr.match(/[\d.]+$/)
        if (match) {
          setDisplay(match[0])
          newExpr = newExpr.slice(0, -match[0].length)
          setWaitingForOperand(false)
        }
      } else if (lastChar === '(') {
        newOpenParenCount--
      } else if (lastChar === ')') {
        newOpenParenCount++
      }
      setExpression(newExpr)
      setOpenParenCount(newOpenParenCount)
      return
    }
    
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay('0')
      setWaitingForOperand(true)
    }
  }

  const toggleParenthesis = () => {
    let newExpr = expression
    let newOpenParenCount = openParenCount
    
    if (lastInputWasOperator || expression === '' || expression.endsWith('(')) {
      if (!waitingForOperand) {
        newExpr += display + '×'
      }
      newExpr += '('
      newOpenParenCount++
      setWaitingForOperand(true)
    } else if (openParenCount > 0) {
      if (!waitingForOperand) {
        newExpr += display
      }
      newExpr += ')'
      newOpenParenCount--
      setWaitingForOperand(true)
    }
    setExpression(newExpr)
    setOpenParenCount(newOpenParenCount)
    setLastInputWasOperator(false)
  }

  const performOperation = (operator: string) => {
    const current = display
    
    if (operator === '=') {
      let finalExpr = expression
      if (!waitingForOperand || !expression) {
        if (!expression && waitingForOperand) return
        finalExpr += current
      }
      
      if (finalExpr) {
        let tempOpenParenCount = openParenCount
        while (tempOpenParenCount > 0) {
          finalExpr += ')'
          tempOpenParenCount--
        }
        try {
          const evalExpr = finalExpr.replace(/×/g, '*').replace(/÷/g, '/')
          const result = evaluate(evalExpr)
          const resultStr = String(Number(result.toFixed(12)))
          
          addHistory({
            type: 'basic',
            expression: finalExpr,
            result: resultStr
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
    if (/[0-9]/.test(btn)) inputDigit(btn)
    else if (btn === '.') inputDecimal()
    else if (btn === '%') inputPercent()
    else if (btn === 'C') clear()
    else if (btn === '⌫') backspace()
    else if (btn === '()') toggleParenthesis()
    else if (['÷', '×', '-', '+', '='].includes(btn)) performOperation(btn)
  }

  const displayExpression = useMemo(() => expression || '', [expression])

  return (
    <div className="calculator-page">
      <ToolHeader 
        title="基础计算器" 
        extraActions={
          <button className="history-btn" onClick={() => setIsHistoryOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
            </svg>
          </button>
        }
      />

      <HistorySidebar />
      
      <main className="calculator">
        <div className="display">
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
                  navigate('/tool/uppercase', { state: { amount: display, from: 'calculator' } })
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
                  className={`key ${getButtonClass(btn)}`}
                  onClick={() => handleButton(btn)}
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
