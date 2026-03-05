import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ToolHeader from '@/components/ToolHeader'
import './HealthCalculator.scss'

export default function HealthCalculator() {
  const navigate = useNavigate()
  const [type, setType] = useState<'bmi' | 'bmr'>('bmi')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [height, setHeight] = useState<number>(175)
  const [weight, setWeight] = useState<number>(70)
  const [age, setAge] = useState<number>(25)
  const [activity, setActivity] = useState<number>(1.2) // Sedentary

  const result = useMemo(() => {
    if (type === 'bmi') {
      const h = height / 100
      const bmi = weight / (h * h)
      let status = ''
      let color = ''
      if (bmi < 18.5) { status = '偏瘦'; color = '#3498db' }
      else if (bmi < 24) { status = '正常'; color = '#2ecc71' }
      else if (bmi < 28) { status = '超重'; color = '#f1c40f' }
      else { status = '肥胖'; color = '#e74c3c' }
      
      return {
        value: bmi.toFixed(1),
        status,
        color,
        label: 'BMI 指数'
      }
    } else {
      // BMR using Mifflin-St Jeor Equation
      let bmr = 10 * weight + 6.25 * height - 5 * age
      bmr = gender === 'male' ? bmr + 5 : bmr - 161
      const tdee = bmr * activity
      
      return {
        value: Math.round(bmr),
        tdee: Math.round(tdee),
        label: '基础代谢率 (BMR)',
        unit: 'kcal/day'
      }
    }
  }, [type, gender, height, weight, age, activity])

  return (
    <div className="tool-page health">
      <ToolHeader title="健康计算" />
      
      <main className="tool-content">
        <div className="tabs">
          <button className={type === 'bmi' ? 'active' : ''} onClick={() => setType('bmi')}>BMI 指数</button>
          <button className={type === 'bmr' ? 'active' : ''} onClick={() => setType('bmr')}>基础代谢 (BMR)</button>
        </div>

        <div className="input-section">
          <div className="input-group">
            <label>性别</label>
            <div className="gender-toggle">
              <button className={gender === 'male' ? 'active' : ''} onClick={() => setGender('male')}>男</button>
              <button className={gender === 'female' ? 'active' : ''} onClick={() => setGender('female')}>女</button>
            </div>
          </div>

          <div className="input-row">
            <div className="input-item">
              <label>身高 (cm)</label>
              <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} />
            </div>
            <div className="input-item">
              <label>体重 (kg)</label>
              <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} />
            </div>
          </div>

          {type === 'bmr' && (
            <>
              <div className="input-group">
                <label>年龄</label>
                <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} />
              </div>
              <div className="input-group">
                <label>活动强度</label>
                <select value={activity} onChange={e => setActivity(Number(e.target.value))}>
                  <option value={1.2}>极少活动（久坐）</option>
                  <option value={1.375}>轻微活动（每周1-3次）</option>
                  <option value={1.55}>中度活动（每周3-5次）</option>
                  <option value={1.725}>高度活动（每周6-7次）</option>
                  <option value={1.9}>极高强度（每天重体力活）</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="result-card">
          <div className="result-header">{result.label}</div>
          <div className="result-value" style={{ color: result.color || 'var(--primary-color)' }}>
            {result.value} <span className="unit">{result.unit || ''}</span>
          </div>
          {type === 'bmi' ? (
            <div className="bmi-status">
              您的体重状态：<span style={{ color: result.color }}>{result.status}</span>
            </div>
          ) : (
            <div className="bmr-info">
              每日总消耗 (TDEE) 约为 <strong>{result.tdee}</strong> kcal
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
