import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'
import { Solar, Lunar } from 'lunar-javascript'
import './DateCalculator.scss'

export default function DateCalculator() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'diff' | 'add' | 'convert'>('diff')
  const today = new Date().toISOString().split('T')[0]
  
  const [date1, setDate1] = useState(today)
  const [date2, setDate2] = useState(today)
  const [baseDate, setBaseDate] = useState(today)
  const [years, setYears] = useState(0)
  const [months, setMonths] = useState(0)
  const [days, setDays] = useState(0)
  const [convertMode, setConvertMode] = useState<'solar2lunar' | 'lunar2solar'>('solar2lunar')
  const [solarDate, setSolarDate] = useState(today)
  const [lunarYear, setLunarYear] = useState(new Date().getFullYear())
  const [lunarMonth, setLunarMonth] = useState(new Date().getMonth() + 1)
  const [lunarDay, setLunarDay] = useState(new Date().getDate())
  const [isLeapMonth, setIsLeapMonth] = useState(false)

  const getWorkdays = (startDate: Date, endDate: Date) => {
    let count = 0
    const current = new Date(startDate)
    const end = new Date(endDate)
    if (current > end) { const temp = current.getTime(); current.setTime(end.getTime()); end.setTime(temp) }
    while (current <= end) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++
      current.setDate(current.getDate() + 1)
    }
    return count
  }

  const dateDiff = useMemo(() => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diffTime = Math.abs(d2.getTime() - d1.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return {
      totalDays: diffDays,
      years: Math.floor(diffDays / 365),
      months: Math.floor((diffDays % 365) / 30),
      days: diffDays % 30,
      weeks: Math.floor(diffDays / 7),
      hours: diffDays * 24,
      minutes: diffDays * 24 * 60,
      workdays: getWorkdays(d1, d2)
    }
  }, [date1, date2])

  const resultDate = useMemo(() => {
    const base = new Date(baseDate)
    base.setFullYear(base.getFullYear() + years)
    base.setMonth(base.getMonth() + months)
    base.setDate(base.getDate() + days)
    return base
  }, [baseDate, years, months, days])

  const solarToLunar = useMemo(() => {
    try {
      const [y, m, d] = solarDate.split('-').map(Number)
      const solar = Solar.fromYmd(y, m, d)
      const lunar = solar.getLunar()
      return {
        yearInGanZhi: lunar.getYearInGanZhi(),
        monthInChinese: lunar.getMonthInChinese(),
        dayInChinese: lunar.getDayInChinese(),
        yearShengXiao: lunar.getYearShengXiao(),
        isLeap: lunar.getMonth() < 0,
        festivals: lunar.getFestivals(),
        jieQi: lunar.getJieQi()
      }
    } catch { return null }
  }, [solarDate])

  const lunarToSolar = useMemo(() => {
    try {
      const month = isLeapMonth ? -lunarMonth : lunarMonth
      const lunar = Lunar.fromYmd(lunarYear, month, lunarDay)
      const solar = lunar.getSolar()
      return {
        dateStr: `${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日`,
        weekday: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][solar.getWeek()]
      }
    } catch { return null }
  }, [lunarYear, lunarMonth, lunarDay, isLeapMonth])

  const formatDate = (date: Date) => {
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    return {
      date: date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
      weekday: weekDays[date.getDay()]
    }
  }

  return (
    <div className="tool-page date">
      <header className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="title">日期计算</h1>
        <ThemeToggle />
      </header>
      
      <main className="tool-content">
        <div className="mode-tabs">
          <button className={mode === 'diff' ? 'active' : ''} onClick={() => setMode('diff')}>日期间隔</button>
          <button className={mode === 'add' ? 'active' : ''} onClick={() => setMode('add')}>日期加减</button>
          <button className={mode === 'convert' ? 'active' : ''} onClick={() => setMode('convert')}>阴阳互转</button>
        </div>
        
        {mode === 'diff' && (
          <div className="calc-area">
            <div className="input-row">
              <label>开始日期</label>
              <div className="date-field">
                <input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} />
                <button className="today-btn" onClick={() => setDate1(today)}>今天</button>
              </div>
            </div>
            <div className="input-row">
              <label>结束日期</label>
              <div className="date-field">
                <input type="date" value={date2} onChange={(e) => setDate2(e.target.value)} />
                <button className="today-btn" onClick={() => setDate2(today)}>今天</button>
              </div>
            </div>
            <div className="result-area">
              <div className="result-main">
                <span className="number">{dateDiff.totalDays}</span>
                <span className="unit">天</span>
              </div>
              <div className="result-grid">
                <div className="grid-item"><span className="value">{dateDiff.years}</span><span className="label">年</span></div>
                <div className="grid-item"><span className="value">{dateDiff.months}</span><span className="label">月</span></div>
                <div className="grid-item"><span className="value">{dateDiff.days}</span><span className="label">天</span></div>
                <div className="grid-item"><span className="value">{dateDiff.weeks}</span><span className="label">周</span></div>
                <div className="grid-item"><span className="value">{dateDiff.hours.toLocaleString()}</span><span className="label">小时</span></div>
                <div className="grid-item"><span className="value">{dateDiff.minutes.toLocaleString()}</span><span className="label">分钟</span></div>
              </div>
              <div className="workdays-info">
                <span className="icon">💼</span>
                <span>工作日（不含周末）：<strong>{dateDiff.workdays}</strong> 天</span>
              </div>
            </div>
          </div>
        )}
        
        {mode === 'add' && (
          <div className="calc-area">
            <div className="input-row">
              <label>基准日期</label>
              <div className="date-field">
                <input type="date" value={baseDate} onChange={(e) => setBaseDate(e.target.value)} />
                <button className="today-btn" onClick={() => setBaseDate(today)}>今天</button>
              </div>
            </div>
            <div className="adjust-inputs">
              {[{ label: '年', value: years, setValue: setYears }, { label: '月', value: months, setValue: setMonths }, { label: '天', value: days, setValue: setDays }].map((item) => (
                <div key={item.label} className="adjust-item">
                  <label>{item.label}</label>
                  <div className="number-input">
                    <button onClick={() => item.setValue(item.value - 1)}>-</button>
                    <input type="number" value={item.value} onChange={(e) => item.setValue(Number(e.target.value))} />
                    <button onClick={() => item.setValue(item.value + 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="result-area">
              <div className="result-date">
                <div className="date">{formatDate(resultDate).date}</div>
                <div className="weekday">{formatDate(resultDate).weekday}</div>
              </div>
            </div>
          </div>
        )}

        {mode === 'convert' && (
          <div className="calc-area">
            <div className="convert-tabs">
              <button className={convertMode === 'solar2lunar' ? 'active' : ''} onClick={() => setConvertMode('solar2lunar')}>阳历→阴历</button>
              <button className={convertMode === 'lunar2solar' ? 'active' : ''} onClick={() => setConvertMode('lunar2solar')}>阴历→阳历</button>
            </div>

            {convertMode === 'solar2lunar' ? (
              <>
                <div className="input-row">
                  <label>阳历日期</label>
                  <div className="date-field">
                    <input type="date" value={solarDate} onChange={(e) => setSolarDate(e.target.value)} />
                    <button className="today-btn" onClick={() => setSolarDate(today)}>今天</button>
                  </div>
                </div>
                {solarToLunar && (
                  <div className="result-area">
                    <div className="lunar-result">
                      <div className="lunar-main">
                        <span className="ganzhi">{solarToLunar.yearInGanZhi}年</span>
                        <span className="shengxiao">【{solarToLunar.yearShengXiao}】</span>
                      </div>
                      <div className="lunar-date">{solarToLunar.isLeap ? '闰' : ''}{solarToLunar.monthInChinese}月{solarToLunar.dayInChinese}</div>
                      {solarToLunar.jieQi && <div className="lunar-extra"><span className="tag jieqi">{solarToLunar.jieQi}</span></div>}
                      {solarToLunar.festivals.length > 0 && (
                        <div className="lunar-extra">
                          {solarToLunar.festivals.map((f: string) => <span key={f} className="tag festival">{f}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="input-row">
                  <label>农历年</label>
                  <div className="input-field">
                    <input type="number" value={lunarYear} onChange={(e) => setLunarYear(Number(e.target.value))} min="1900" max="2100" />
                    <span className="unit">年</span>
                  </div>
                </div>
                <div className="input-row">
                  <label>农历月</label>
                  <div className="select-field">
                    <select value={lunarMonth} onChange={(e) => setLunarMonth(Number(e.target.value))}>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => <option key={m} value={m}>{m}月</option>)}
                    </select>
                    <label className="leap-check">
                      <input type="checkbox" checked={isLeapMonth} onChange={(e) => setIsLeapMonth(e.target.checked)} />
                      <span>闰月</span>
                    </label>
                  </div>
                </div>
                <div className="input-row">
                  <label>农历日</label>
                  <div className="input-field">
                    <select value={lunarDay} onChange={(e) => setLunarDay(Number(e.target.value))}>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="result-area">
                  {lunarToSolar ? (
                    <div className="solar-result">
                      <div className="solar-date">{lunarToSolar.dateStr}</div>
                      <div className="solar-weekday">{lunarToSolar.weekday}</div>
                    </div>
                  ) : (
                    <div className="error-msg">日期无效，请检查输入</div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
