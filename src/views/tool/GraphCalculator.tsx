import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { evaluate } from 'mathjs'
import ToolHeader from '@/components/ToolHeader'
import './GraphCalculator.scss'

export default function GraphCalculator() {
  const navigate = useNavigate()
  const location = useLocation()
  const [expression, setExpression] = useState('x^2')
  const [range, setRange] = useState({ min: -10, max: 10 })

  useEffect(() => {
    if (location.state && location.state.expression) {
      setExpression(location.state.expression)
    }
  }, [location.state])

  const data = useMemo(() => {
    const points = []
    const step = (range.max - range.min) / 100
    
    for (let x = range.min; x <= range.max; x += step) {
      try {
        const y = evaluate(expression, { x })
        if (typeof y === 'number' && isFinite(y)) {
          points.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) })
        }
      } catch (e) {
        // Skip invalid points
      }
    }
    return points
  }, [expression, range])

  return (
    <div className="tool-page graph">
      <ToolHeader title="函数绘图" />

      <main className="tool-content">
        <div className="input-panel">
          <div className="expression-input">
            <span className="prefix">y = </span>
            <input 
              type="text" 
              value={expression} 
              onChange={e => setExpression(e.target.value)}
              placeholder="输入函数, 如 x^2, sin(x)..."
            />
          </div>
          <div className="range-inputs">
            <div className="range-item">
              <label>X 最小值</label>
              <input type="number" value={range.min} onChange={e => setRange({...range, min: Number(e.target.value)})} />
            </div>
            <div className="range-item">
              <label>X 最大值</label>
              <input type="number" value={range.max} onChange={e => setRange({...range, max: Number(e.target.value)})} />
            </div>
          </div>
        </div>

        <div className="graph-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="x" stroke="var(--text-secondary)" fontSize={12} tickCount={10} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--primary-color)' }}
              />
              <Line 
                type="monotone" 
                dataKey="y" 
                stroke="var(--primary-color)" 
                strokeWidth={3} 
                dot={false}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  )
}
