import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ToolHeader from '@/components/ToolHeader'
import './HealthCalculator.scss'

export default function HealthCalculator() {
  const { t } = useTranslation()
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
      if (bmi < 18.5) { status = t('tool.health.status.underweight'); color = '#3498db' }
      else if (bmi < 24) { status = t('tool.health.status.normal'); color = '#2ecc71' }
      else if (bmi < 28) { status = t('tool.health.status.overweight'); color = '#f1c40f' }
      else { status = t('tool.health.status.obese'); color = '#e74c3c' }
      
      return {
        value: bmi.toFixed(1),
        status,
        color,
        label: t('tool.health.bmi_label')
      }
    } else {
      // BMR using Mifflin-St Jeor Equation
      let bmr = 10 * weight + 6.25 * height - 5 * age
      bmr = gender === 'male' ? bmr + 5 : bmr - 161
      const tdee = bmr * activity
      
      return {
        value: Math.round(bmr),
        tdee: Math.round(tdee),
        label: t('tool.health.bmr_label'),
        unit: 'kcal/day'
      }
    }
  }, [type, gender, height, weight, age, activity, t])

  return (
    <div className="tool-page health">
      <ToolHeader title={t('tool.health.title')} />
      
      <main className="tool-content">
        <div className="tabs">
          <button className={type === 'bmi' ? 'active' : ''} onClick={() => setType('bmi')}>{t('tool.health.bmi_label')}</button>
          <button className={type === 'bmr' ? 'active' : ''} onClick={() => setType('bmr')}>{t('tool.health.bmr_label')}</button>
        </div>

        <div className="input-section">
          <div className="input-group">
            <label>{t('tool.health.gender')}</label>
            <div className="gender-toggle">
              <button className={gender === 'male' ? 'active' : ''} onClick={() => setGender('male')}>{t('tool.health.male')}</button>
              <button className={gender === 'female' ? 'active' : ''} onClick={() => setGender('female')}>{t('tool.health.female')}</button>
            </div>
          </div>

          <div className="input-row">
            <div className="input-item">
              <label>{t('tool.health.height')}</label>
              <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} />
            </div>
            <div className="input-item">
              <label>{t('tool.health.weight')}</label>
              <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} />
            </div>
          </div>

          {type === 'bmr' && (
            <>
              <div className="input-group">
                <label>{t('tool.health.age')}</label>
                <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} />
              </div>
              <div className="input-group">
                <label>{t('tool.health.activity_level')}</label>
                <select value={activity} onChange={e => setActivity(Number(e.target.value))}>
                  <option value={1.2}>{t('tool.health.activity.sedentary')}</option>
                  <option value={1.375}>{t('tool.health.activity.light')}</option>
                  <option value={1.55}>{t('tool.health.activity.moderate')}</option>
                  <option value={1.725}>{t('tool.health.activity.active')}</option>
                  <option value={1.9}>{t('tool.health.activity.very_active')}</option>
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
          {type === 'bmi' && <div className="result-status" style={{ backgroundColor: result.color }}>{result.status}</div>}
          {type === 'bmr' && (
            <div className="tdee-section">
              <div className="tdee-label">{t('tool.health.tdee_label')}</div>
              <div className="tdee-value">{result.tdee} <span className="unit">kcal/day</span></div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
