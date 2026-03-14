import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ToolHeader from '@/components/ToolHeader'
import relationship from 'relationship.js'
import './RelativeCalculator.scss'

type Gender = 'male' | 'female'

function RelativeCalculator() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [chain, setChain] = useState<string[]>([])
  const [gender, setGender] = useState<Gender>('male')
  const [isReverse, setIsReverse] = useState(false)

  const relationLabels: Record<string, string> = useMemo(() => t('tool.relative.labels', { returnObjects: true }) as any, [t])

  const relationGender: Record<string, Gender> = {
    'f': 'male', 'm': 'female', 'h': 'male', 'w': 'female',
    'ob': 'male', 'lb': 'male', 'os': 'female', 'ls': 'female',
    's': 'male', 'd': 'female'
  }

  const checkSameSexRelation = useMemo(() => {
    if (chain.length === 0) return false
    const firstRelation = chain[0]
    if (gender === 'male' && firstRelation === 'h') return true
    if (gender === 'female' && firstRelation === 'w') return true
    if (chain.length < 2) return false
    for (let i = 0; i < chain.length - 1; i++) {
      const current = chain[i]
      const next = chain[i + 1]
      const currentGender = relationGender[current]
      if (currentGender === 'male' && next === 'h') return true
      if (currentGender === 'female' && next === 'w') return true
    }
    return false
  }, [chain, gender])

  const addRelation = (value: string) => setChain([...chain, value])
  const removeLastRelation = () => setChain(chain.slice(0, -1))
  const clearChain = () => { setChain([]); setIsReverse(false) }
  const toggleReverse = () => setIsReverse(!isReverse)

  const getChainDisplay = useMemo(() => {
    if (chain.length === 0) return ''
    return t('tool.relative.prefix') + chain.map(v => relationLabels[v] || v).join(t('tool.relative.connector'))
  }, [chain, relationLabels, t])

  const getRelationText = useMemo(() => {
    if (chain.length === 0) return ''
    return chain.map(v => relationLabels[v] || v).join(t('tool.relative.connector'))
  }, [chain, relationLabels, t])

  const result = useMemo(() => {
    if (chain.length === 0) return null
    if (checkSameSexRelation) return { error: t('tool.relative.error_same_sex') }
    const text = getRelationText
    const sex = gender === 'male' ? 1 : 0
    try {
      const myCallResult = relationship({ text, sex, reverse: false })
      const theirCallResult = relationship({ text, sex, reverse: true })
      const myCall = Array.isArray(myCallResult) && myCallResult.length > 0 ? myCallResult[0] : t('tool.relative.error_not_found')
      const theirCall = Array.isArray(theirCallResult) && theirCallResult.length > 0 ? theirCallResult[0] : t('tool.relative.error_not_found')
      if (isReverse) return { myCall: theirCall, theirCall: myCall }
      return { myCall, theirCall }
    } catch {
      return { myCall: t('tool.relative.error_calc'), theirCall: t('tool.relative.error_calc') }
    }
  }, [chain, gender, isReverse, checkSameSexRelation, getRelationText, t])

  return (
    <div className="tool-page">
      <ToolHeader title={t('tool.relative.title')} />
      <main className="tool-content">
        <div className="gender-select">
          <span className="label">{t('tool.relative.my_gender')}</span>
          <button className={gender === 'male' ? 'active' : ''} onClick={() => setGender('male')}>{t('tool.health.male')}</button>
          <button className={gender === 'female' ? 'active' : ''} onClick={() => setGender('female')}>{t('tool.health.female')}</button>
        </div>
        <div className="display-area">
          <div className="chain-display">
            {chain.length === 0 ? (
              <span className="placeholder">{t('tool.relative.placeholder')}</span>
            ) : (
              <span className="chain-text">{getChainDisplay}</span>
            )}
          </div>
          {result && (
            <div className="result-display">
              {'error' in result ? (
                <div className="error-msg">{result.error}</div>
              ) : (
                <>
                  <div className="result-row">
                    <span className="label">{isReverse ? t('tool.relative.ta_calls_me') : t('tool.relative.i_call_ta')}</span>
                    <span className="value">{result.myCall}</span>
                  </div>
                  <div className="result-row reverse">
                    <span className="label">{isReverse ? t('tool.relative.i_call_ta') : t('tool.relative.ta_calls_me')}</span>
                    <span className="value">{result.theirCall}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="relation-buttons">
          <div className="button-row">
            <button className="rel-btn spouse" onClick={() => addRelation('h')}>{t('tool.relative.buttons.h')}</button>
            <button className="rel-btn spouse" onClick={() => addRelation('w')}>{t('tool.relative.buttons.w')}</button>
            <button className="rel-btn action" onClick={removeLastRelation} disabled={chain.length === 0}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
            <button className="rel-btn action" onClick={clearChain} disabled={chain.length === 0}>C</button>
          </div>
          <div className="button-row">
            <button className="rel-btn parent" onClick={() => addRelation('f')}>{t('tool.relative.buttons.f')}</button>
            <button className="rel-btn parent" onClick={() => addRelation('m')}>{t('tool.relative.buttons.m')}</button>
            <button className="rel-btn sibling" onClick={() => addRelation('ob')}>{t('tool.relative.buttons.ob')}</button>
            <button className="rel-btn sibling" onClick={() => addRelation('lb')}>{t('tool.relative.buttons.lb')}</button>
          </div>
          <div className="button-row">
            <button className="rel-btn sibling" onClick={() => addRelation('os')}>{t('tool.relative.buttons.os')}</button>
            <button className="rel-btn sibling" onClick={() => addRelation('ls')}>{t('tool.relative.buttons.ls')}</button>
            <button className="rel-btn child" onClick={() => addRelation('s')}>{t('tool.relative.buttons.s')}</button>
            <button className="rel-btn child" onClick={() => addRelation('d')}>{t('tool.relative.buttons.d')}</button>
          </div>
          <div className="button-row bottom-row">
            <button className={`rel-btn reverse-btn ${isReverse ? 'active' : ''}`} onClick={toggleReverse}>{t('tool.relative.reverse_check')}</button>
            <button className="rel-btn calc-btn">=</button>
          </div>
        </div>
        <div className="examples">
          <div className="example-title">{t('tool.relative.example_title')}</div>
          <div className="example-list">
            <div className="example-item"><span className="path">{t('tool.relative.buttons.f')} → {t('tool.relative.buttons.f')}</span><span className="name">{t('tool.relative.examples.爷爷')}</span></div>
            <div className="example-item"><span className="path">{t('tool.relative.buttons.m')} → {t('tool.relative.buttons.m')}</span><span className="name">{t('tool.relative.examples.外婆')}</span></div>
            <div className="example-item"><span className="path">{t('tool.relative.buttons.f')} → {t('tool.relative.buttons.ob')}</span><span className="name">{t('tool.relative.examples.伯父')}</span></div>
            <div className="example-item"><span className="path">{t('tool.relative.buttons.f')} → {t('tool.relative.buttons.lb')}</span><span className="name">{t('tool.relative.examples.叔叔')}</span></div>
            <div className="example-item"><span className="path">{t('tool.relative.buttons.m')} → {t('tool.relative.buttons.ob')}/{t('tool.relative.buttons.lb')}</span><span className="name">{t('tool.relative.examples.舅舅')}</span></div>
            <div className="example-item"><span className="path">{t('tool.relative.buttons.f')} → {t('tool.relative.buttons.os')}/{t('tool.relative.buttons.ls')}</span><span className="name">{t('tool.relative.examples.姑姑')}</span></div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default RelativeCalculator
