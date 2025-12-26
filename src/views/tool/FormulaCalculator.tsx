import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'
import './FormulaCalculator.scss'

interface Formula {
  id: string
  name: string
  category: string
  formula: string
  description: string
  variables: { name: string; label: string; default: number }[]
  calculate: (vars: Record<string, number>) => number
  unit: string
}

const formulas: Formula[] = [
  { id: 'circle_area', name: '圆面积', category: '几何', formula: 'S = πr²', description: '已知半径求圆的面积',
    variables: [{ name: 'r', label: '半径', default: 1 }], calculate: (v) => Math.PI * v.r * v.r, unit: '' },
  { id: 'circle_perimeter', name: '圆周长', category: '几何', formula: 'C = 2πr', description: '已知半径求圆的周长',
    variables: [{ name: 'r', label: '半径', default: 1 }], calculate: (v) => 2 * Math.PI * v.r, unit: '' },
  { id: 'sphere_volume', name: '球体积', category: '几何', formula: 'V = 4/3πr³', description: '已知半径求球的体积',
    variables: [{ name: 'r', label: '半径', default: 1 }], calculate: (v) => (4 / 3) * Math.PI * Math.pow(v.r, 3), unit: '' },
  { id: 'triangle_area', name: '三角形面积', category: '几何', formula: 'S = ½ah', description: '已知底和高求三角形面积',
    variables: [{ name: 'a', label: '底边', default: 1 }, { name: 'h', label: '高', default: 1 }], calculate: (v) => 0.5 * v.a * v.h, unit: '' },
  { id: 'trapezoid_area', name: '梯形面积', category: '几何', formula: 'S = ½(a+b)h', description: '已知上底、下底和高求梯形面积',
    variables: [{ name: 'a', label: '上底', default: 1 }, { name: 'b', label: '下底', default: 2 }, { name: 'h', label: '高', default: 1 }],
    calculate: (v) => 0.5 * (v.a + v.b) * v.h, unit: '' },
  { id: 'cylinder_volume', name: '圆柱体积', category: '几何', formula: 'V = πr²h', description: '已知底面半径和高求圆柱体积',
    variables: [{ name: 'r', label: '底面半径', default: 1 }, { name: 'h', label: '高', default: 1 }], calculate: (v) => Math.PI * v.r * v.r * v.h, unit: '' },
  { id: 'cone_volume', name: '圆锥体积', category: '几何', formula: 'V = ⅓πr²h', description: '已知底面半径和高求圆锥体积',
    variables: [{ name: 'r', label: '底面半径', default: 1 }, { name: 'h', label: '高', default: 1 }], calculate: (v) => (1 / 3) * Math.PI * v.r * v.r * v.h, unit: '' },
  { id: 'speed', name: '速度公式', category: '物理', formula: 'v = s/t', description: '已知路程和时间求速度',
    variables: [{ name: 's', label: '路程', default: 100 }, { name: 't', label: '时间', default: 10 }], calculate: (v) => v.s / v.t, unit: '' },
  { id: 'acceleration', name: '加速度公式', category: '物理', formula: 'a = (v-v₀)/t', description: '已知初速度、末速度和时间求加速度',
    variables: [{ name: 'v0', label: '初速度', default: 0 }, { name: 'v', label: '末速度', default: 10 }, { name: 't', label: '时间', default: 5 }],
    calculate: (v) => (v.v - v.v0) / v.t, unit: 'm/s²' },
  { id: 'force', name: '牛顿第二定律', category: '物理', formula: 'F = ma', description: '已知质量和加速度求力',
    variables: [{ name: 'm', label: '质量(kg)', default: 1 }, { name: 'a', label: '加速度(m/s²)', default: 10 }], calculate: (v) => v.m * v.a, unit: 'N' },
  { id: 'kinetic_energy', name: '动能公式', category: '物理', formula: 'Ek = ½mv²', description: '已知质量和速度求动能',
    variables: [{ name: 'm', label: '质量(kg)', default: 1 }, { name: 'v', label: '速度(m/s)', default: 10 }], calculate: (v) => 0.5 * v.m * v.v * v.v, unit: 'J' },
  { id: 'potential_energy', name: '重力势能', category: '物理', formula: 'Ep = mgh', description: '已知质量、重力加速度和高度求势能',
    variables: [{ name: 'm', label: '质量(kg)', default: 1 }, { name: 'g', label: '重力加速度', default: 9.8 }, { name: 'h', label: '高度(m)', default: 10 }],
    calculate: (v) => v.m * v.g * v.h, unit: 'J' },
  { id: 'ohm_law', name: '欧姆定律', category: '物理', formula: 'I = U/R', description: '已知电压和电阻求电流',
    variables: [{ name: 'U', label: '电压(V)', default: 220 }, { name: 'R', label: '电阻(Ω)', default: 100 }], calculate: (v) => v.U / v.R, unit: 'A' },
  { id: 'power_electric', name: '电功率', category: '物理', formula: 'P = UI', description: '已知电压和电流求功率',
    variables: [{ name: 'U', label: '电压(V)', default: 220 }, { name: 'I', label: '电流(A)', default: 1 }], calculate: (v) => v.U * v.I, unit: 'W' },
  { id: 'pythagorean', name: '勾股定理', category: '数学', formula: 'c = √(a²+b²)', description: '已知两直角边求斜边',
    variables: [{ name: 'a', label: '直角边a', default: 3 }, { name: 'b', label: '直角边b', default: 4 }], calculate: (v) => Math.sqrt(v.a * v.a + v.b * v.b), unit: '' },
  { id: 'quadratic', name: '一元二次方程求根', category: '数学', formula: 'x = (-b±√Δ)/2a', description: 'ax²+bx+c=0 的判别式',
    variables: [{ name: 'a', label: 'a', default: 1 }, { name: 'b', label: 'b', default: -5 }, { name: 'c', label: 'c', default: 6 }],
    calculate: (v) => v.b * v.b - 4 * v.a * v.c, unit: '(Δ值)' },
  { id: 'compound_interest', name: '复利公式', category: '金融', formula: 'A = P(1+r)ⁿ', description: '已知本金、利率和期数求本息和',
    variables: [{ name: 'P', label: '本金', default: 10000 }, { name: 'r', label: '利率(%)', default: 5 }, { name: 'n', label: '期数(年)', default: 10 }],
    calculate: (v) => v.P * Math.pow(1 + v.r / 100, v.n), unit: '元' },
  { id: 'bmi', name: 'BMI指数', category: '健康', formula: 'BMI = 体重/身高²', description: '已知体重(kg)和身高(m)求BMI',
    variables: [{ name: 'weight', label: '体重(kg)', default: 65 }, { name: 'height', label: '身高(m)', default: 1.7 }],
    calculate: (v) => v.weight / (v.height * v.height), unit: '' },
]

const categories = [...new Set(formulas.map(f => f.category))]

function FormulaCalculator() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null)
  const [variables, setVariables] = useState<Record<string, number>>({})

  const filteredFormulas = useMemo(() => {
    if (selectedCategory === '全部') return formulas
    return formulas.filter(f => f.category === selectedCategory)
  }, [selectedCategory])

  const selectFormula = (formula: Formula) => {
    setSelectedFormula(formula)
    const vars: Record<string, number> = {}
    formula.variables.forEach(v => { vars[v.name] = v.default })
    setVariables(vars)
  }

  const result = useMemo(() => {
    if (!selectedFormula) return null
    try { return selectedFormula.calculate(variables) } catch { return null }
  }, [selectedFormula, variables])

  const formatResult = (num: number) => {
    if (Math.abs(num) < 0.000001 || Math.abs(num) > 999999999) return num.toExponential(6)
    return parseFloat(num.toPrecision(10)).toString()
  }

  const updateVariable = (name: string, value: string) => {
    setVariables({ ...variables, [name]: parseFloat(value) || 0 })
  }

  return (
    <div className="tool-page">
      <header className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="title">万能公式</h1>
        <ThemeToggle />
      </header>
      <main className="tool-content">
        <div className="category-tabs">
          <button className={selectedCategory === '全部' ? 'active' : ''} onClick={() => setSelectedCategory('全部')}>全部</button>
          {categories.map(cat => (
            <button key={cat} className={selectedCategory === cat ? 'active' : ''} onClick={() => setSelectedCategory(cat)}>{cat}</button>
          ))}
        </div>
        {!selectedFormula ? (
          <div className="formula-list">
            {filteredFormulas.map(f => (
              <div key={f.id} className="formula-item" onClick={() => selectFormula(f)}>
                <div className="formula-name">{f.name}</div>
                <div className="formula-expr">{f.formula}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="formula-calc">
            <button className="back-to-list" onClick={() => setSelectedFormula(null)}>← 返回列表</button>
            <div className="formula-header">
              <h3>{selectedFormula.name}</h3>
              <div className="formula-display">{selectedFormula.formula}</div>
              <p className="formula-desc">{selectedFormula.description}</p>
            </div>
            <div className="variables-input">
              {selectedFormula.variables.map(v => (
                <div key={v.name} className="var-item">
                  <label>{v.label}</label>
                  <input type="number" value={variables[v.name] || ''} onChange={e => updateVariable(v.name, e.target.value)} />
                </div>
              ))}
            </div>
            {result !== null && (
              <div className="result-area">
                <div className="result-label">计算结果</div>
                <div className="result-value">{formatResult(result)}{selectedFormula.unit && <span className="unit">{selectedFormula.unit}</span>}</div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default FormulaCalculator
