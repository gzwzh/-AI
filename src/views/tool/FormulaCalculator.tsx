import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ToolHeader from '@/components/ToolHeader'
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
  { id: 'circle_area', name: 'circle_area', category: '几何', formula: 'S = πr²', description: 'circle_area.description',
    variables: [{ name: 'r', label: 'r', default: 1 }], calculate: (v) => Math.PI * v.r * v.r, unit: '' },
  { id: 'circle_perimeter', name: 'circle_perimeter', category: '几何', formula: 'C = 2πr', description: 'circle_perimeter.description',
    variables: [{ name: 'r', label: 'r', default: 1 }], calculate: (v) => 2 * Math.PI * v.r, unit: '' },
  { id: 'sphere_volume', name: 'sphere_volume', category: '几何', formula: 'V = 4/3πr³', description: 'sphere_volume.description',
    variables: [{ name: 'r', label: 'r', default: 1 }], calculate: (v) => (4 / 3) * Math.PI * Math.pow(v.r, 3), unit: '' },
  { id: 'triangle_area', name: 'triangle_area', category: '几何', formula: 'S = ½ah', description: 'triangle_area.description',
    variables: [{ name: 'a', label: 'a', default: 1 }, { name: 'h', label: 'h', default: 1 }], calculate: (v) => 0.5 * v.a * v.h, unit: '' },
  { id: 'trapezoid_area', name: 'trapezoid_area', category: '几何', formula: 'S = ½(a+b)h', description: 'trapezoid_area.description',
    variables: [{ name: 'a', label: 'a', default: 1 }, { name: 'b', label: 'b', default: 2 }, { name: 'h', label: 'h', default: 1 }],
    calculate: (v) => 0.5 * (v.a + v.b) * v.h, unit: '' },
  { id: 'cylinder_volume', name: 'cylinder_volume', category: '几何', formula: 'V = πr²h', description: 'cylinder_volume.description',
    variables: [{ name: 'r', label: 'r', default: 1 }, { name: 'h', label: 'h', default: 1 }], calculate: (v) => Math.PI * v.r * v.r * v.h, unit: '' },
  { id: 'cone_volume', name: 'cone_volume', category: '几何', formula: 'V = ⅓πr²h', description: 'cone_volume.description',
    variables: [{ name: 'r', label: 'r', default: 1 }, { name: 'h', label: 'h', default: 1 }], calculate: (v) => (1 / 3) * Math.PI * v.r * v.r * v.h, unit: '' },
  { id: 'speed', name: 'speed', category: '物理', formula: 'v = s/t', description: 'speed.description',
    variables: [{ name: 's', label: 's', default: 100 }, { name: 't', label: 't', default: 10 }], calculate: (v) => v.s / v.t, unit: '' },
  { id: 'acceleration', name: 'acceleration', category: '物理', formula: 'a = (v-v₀)/t', description: 'acceleration.description',
    variables: [{ name: 'v0', label: 'v0', default: 0 }, { name: 'v', label: 'v', default: 10 }, { name: 't', label: 't', default: 5 }],
    calculate: (v) => (v.v - v.v0) / v.t, unit: 'm/s²' },
  { id: 'force', name: 'force', category: '物理', formula: 'F = ma', description: 'force.description',
    variables: [{ name: 'm', label: 'm', default: 1 }, { name: 'a', label: 'a', default: 10 }], calculate: (v) => v.m * v.a, unit: 'N' },
  { id: 'kinetic_energy', name: 'kinetic_energy', category: '物理', formula: 'Ek = ½mv²', description: 'kinetic_energy.description',
    variables: [{ name: 'm', label: 'm', default: 1 }, { name: 'v', label: 'v', default: 10 }], calculate: (v) => 0.5 * v.m * v.v * v.v, unit: 'J' },
  { id: 'potential_energy', name: 'potential_energy', category: '物理', formula: 'Ep = mgh', description: 'potential_energy.description',
    variables: [{ name: 'm', label: 'm', default: 1 }, { name: 'g', label: 'g', default: 9.8 }, { name: 'h', label: 'h', default: 10 }],
    calculate: (v) => v.m * v.g * v.h, unit: 'J' },
  { id: 'ohm_law', name: 'ohm_law', category: '物理', formula: 'I = U/R', description: 'ohm_law.description',
    variables: [{ name: 'U', label: 'U', default: 220 }, { name: 'R', label: 'R', default: 100 }], calculate: (v) => v.U / v.R, unit: 'A' },
  { id: 'power_electric', name: 'power_electric', category: '物理', formula: 'P = UI', description: 'power_electric.description',
    variables: [{ name: 'U', label: 'U', default: 220 }, { name: 'I', label: 'I', default: 1 }], calculate: (v) => v.U * v.I, unit: 'W' },
  { id: 'pythagorean', name: 'pythagorean', category: '数学', formula: 'c = √(a²+b²)', description: 'pythagorean.description',
    variables: [{ name: 'a', label: 'a', default: 3 }, { name: 'b', label: 'b', default: 4 }], calculate: (v) => Math.sqrt(v.a * v.a + v.b * v.b), unit: '' },
  { id: 'quadratic', name: 'quadratic', category: '数学', formula: 'x = (-b±√Δ)/2a', description: 'quadratic.description',
    variables: [{ name: 'a', label: 'a', default: 1 }, { name: 'b', label: 'b', default: -5 }, { name: 'c', label: 'c', default: 6 }],
    calculate: (v) => v.b * v.b - 4 * v.a * v.c, unit: '(Δ值)' },
  { id: 'compound_interest', name: 'compound_interest', category: '金融', formula: 'A = P(1+r)ⁿ', description: 'compound_interest.description',
    variables: [{ name: 'P', label: 'P', default: 10000 }, { name: 'r', label: 'r', default: 5 }, { name: 'n', label: 'n', default: 10 }],
    calculate: (v) => v.P * Math.pow(1 + v.r / 100, v.n), unit: '元' },
  { id: 'bmi', name: 'bmi', category: '健康', formula: 'BMI = 体重/身高²', description: 'bmi.description',
    variables: [{ name: 'weight', label: 'weight', default: 65 }, { name: 'height', label: 'height', default: 1.7 }],
    calculate: (v) => v.weight / (v.height * v.height), unit: '' },
]

const categoryList = ['全部', '几何', '物理', '数学', '金融', '健康']

function FormulaCalculator() {
  const { t } = useTranslation()
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
    <div className="tool-page formula">
      <ToolHeader title={t('tool.formula.title')} />
      
      <main className="tool-content">
        <div className="category-tabs">
          {categoryList.map(cat => (
            <button 
              key={cat} 
              className={selectedCategory === cat ? 'active' : ''} 
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === '全部' ? t('tool.formula.all') : t(`tool.formula.categories.${cat}`)}
            </button>
          ))}
        </div>

        <div className="formula-list">
          {!selectedFormula ? (
            <div className="formula-grid">
              {filteredFormulas.map(f => (
                <div key={f.id} className="formula-card" onClick={() => selectFormula(f)}>
                  <div className="formula-name">{t(`tool.formula.items.${f.id}.name`)}</div>
                  <div className="formula-desc">{t(`tool.formula.items.${f.id}.description`)}</div>
                  <div className="formula-math">{f.formula}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="formula-editor">
              <button className="back-to-list" onClick={() => setSelectedFormula(null)}>
                ← {t('tool.formula.select_formula')}
              </button>
              
              <div className="editor-layout">
                <div className="input-panel">
                  <h3>{t('tool.formula.variables_label')}</h3>
                  {selectedFormula.variables.map(v => (
                    <div key={v.name} className="input-row">
                      <label>{t(`tool.formula.items.${selectedFormula.id}.variables.${v.name}`)} ({v.name})</label>
                      <input 
                        type="number" 
                        value={variables[v.name]}
                        onChange={e => updateVariable(v.name, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="result-panel">
                  <div className="formula-info">
                    <h2>{t(`tool.formula.items.${selectedFormula.id}.name`)}</h2>
                    <div className="math-display">{selectedFormula.formula}</div>
                  </div>
                  
                  <div className="result-display">
                    <div className="label">{t('tool.formula.result_title')}</div>
                    <div className="value">
                      {result !== null ? formatResult(result) : '--'} 
                      <span className="unit">{selectedFormula.unit}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default FormulaCalculator
