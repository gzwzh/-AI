import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'
import relationship from 'relationship.js'
import './RelativeCalculator.scss'

type Gender = 'male' | 'female'

const relationLabels: Record<string, string> = {
  'f': '爸爸', 'm': '妈妈', 'h': '老公', 'w': '老婆',
  'ob': '哥哥', 'lb': '弟弟', 'os': '姐姐', 'ls': '妹妹',
  's': '儿子', 'd': '女儿'
}

const relationGender: Record<string, Gender> = {
  'f': 'male', 'm': 'female', 'h': 'male', 'w': 'female',
  'ob': 'male', 'lb': 'male', 'os': 'female', 'ls': 'female',
  's': 'male', 'd': 'female'
}

function RelativeCalculator() {
  const navigate = useNavigate()
  const [chain, setChain] = useState<string[]>([])
  const [gender, setGender] = useState<Gender>('male')
  const [isReverse, setIsReverse] = useState(false)

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
    return '我的' + chain.map(v => relationLabels[v] || v).join('的')
  }, [chain])

  const getRelationText = useMemo(() => {
    if (chain.length === 0) return ''
    return chain.map(v => relationLabels[v] || v).join('的')
  }, [chain])

  const result = useMemo(() => {
    if (chain.length === 0) return null
    if (checkSameSexRelation) return { error: '暂时不支持同性关系查询' }
    const text = getRelationText
    const sex = gender === 'male' ? 1 : 0
    try {
      const myCallResult = relationship({ text, sex, reverse: false })
      const theirCallResult = relationship({ text, sex, reverse: true })
      const myCall = Array.isArray(myCallResult) && myCallResult.length > 0 ? myCallResult[0] : '关系较远或未收录'
      const theirCall = Array.isArray(theirCallResult) && theirCallResult.length > 0 ? theirCallResult[0] : '关系较远或未收录'
      if (isReverse) return { myCall: theirCall, theirCall: myCall }
      return { myCall, theirCall }
    } catch {
      return { myCall: '计算出错', theirCall: '计算出错' }
    }
  }, [chain, gender, isReverse, checkSameSexRelation, getRelationText])

  return (
    <div className="tool-page">
      <header className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="title">亲戚称呼</h1>
        <ThemeToggle />
      </header>
      <main className="tool-content">
        <div className="gender-select">
          <span className="label">我的性别：</span>
          <button className={gender === 'male' ? 'active' : ''} onClick={() => setGender('male')}>男</button>
          <button className={gender === 'female' ? 'active' : ''} onClick={() => setGender('female')}>女</button>
        </div>
        <div className="display-area">
          <div className="chain-display">
            {chain.length === 0 ? (
              <span className="placeholder">点击下方按钮添加关系</span>
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
                    <span className="label">{isReverse ? 'TA叫我：' : '我叫TA：'}</span>
                    <span className="value">{result.myCall}</span>
                  </div>
                  <div className="result-row reverse">
                    <span className="label">{isReverse ? '我叫TA：' : 'TA叫我：'}</span>
                    <span className="value">{result.theirCall}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="relation-buttons">
          <div className="button-row">
            <button className="rel-btn spouse" onClick={() => addRelation('h')}>夫</button>
            <button className="rel-btn spouse" onClick={() => addRelation('w')}>妻</button>
            <button className="rel-btn action" onClick={removeLastRelation} disabled={chain.length === 0}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
            <button className="rel-btn action" onClick={clearChain} disabled={chain.length === 0}>C</button>
          </div>
          <div className="button-row">
            <button className="rel-btn parent" onClick={() => addRelation('f')}>父</button>
            <button className="rel-btn parent" onClick={() => addRelation('m')}>母</button>
            <button className="rel-btn sibling" onClick={() => addRelation('ob')}>兄</button>
            <button className="rel-btn sibling" onClick={() => addRelation('lb')}>弟</button>
          </div>
          <div className="button-row">
            <button className="rel-btn sibling" onClick={() => addRelation('os')}>姐</button>
            <button className="rel-btn sibling" onClick={() => addRelation('ls')}>妹</button>
            <button className="rel-btn child" onClick={() => addRelation('s')}>子</button>
            <button className="rel-btn child" onClick={() => addRelation('d')}>女</button>
          </div>
          <div className="button-row bottom-row">
            <button className={`rel-btn reverse-btn ${isReverse ? 'active' : ''}`} onClick={toggleReverse}>互查</button>
            <button className="rel-btn calc-btn">=</button>
          </div>
        </div>
        <div className="examples">
          <div className="example-title">常见称呼示例</div>
          <div className="example-list">
            <div className="example-item"><span className="path">父 → 父</span><span className="name">爷爷</span></div>
            <div className="example-item"><span className="path">母 → 母</span><span className="name">外婆</span></div>
            <div className="example-item"><span className="path">父 → 兄</span><span className="name">伯父</span></div>
            <div className="example-item"><span className="path">父 → 弟</span><span className="name">叔叔</span></div>
            <div className="example-item"><span className="path">母 → 兄/弟</span><span className="name">舅舅</span></div>
            <div className="example-item"><span className="path">父 → 姐/妹</span><span className="name">姑姑</span></div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default RelativeCalculator
