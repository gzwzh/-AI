import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { moduleCategories, allModules, ModuleItem } from '@/config/modules'
import ModuleCard from '@/components/ModuleCard'
import ThemeToggle from '@/components/ThemeToggle'
import LoginButton from '@/components/LoginButton'
import WindowControls from '@/components/WindowControls'
import { useAuthStore } from '@/stores/auth'
import { useHistoryStore } from '@/stores/history'
import { getFeedbackUrl } from '@/services/feedback'
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api'
import { getSmartResult, SmartResult } from '@/services/aiSearch'
import { openExternalUrl } from '@/utils/externalLink'
import './Home.scss'

const moduleKeywords: Record<string, string[]> = {
  basic: ['基础计算', '普通计算', '四则运算'],
  scientific: ['科学计算', '函数计算', '三角函数', '幂函数', '对数'],
  fraction: ['分数', '分式'],
  currency: ['汇率', '货币', '美元', '人民币', '欧元', '换汇'],
  relative: ['亲戚', '称呼', '关系'],
  mortgage: ['房贷', '贷款', '月供', '按揭'],
  tax: ['个税', '工资税', '薪资税', '纳税', '扣税'],
  date: ['日期', '几天后', '几天前', '星期几', '多久', '天后', '天前'],
  radix: ['进制', '二进制', '十六进制', '十进制'],
  uppercase: ['大写金额', '金额大写', '人民币大写'],
  finance: ['理财', '利息', '收益', '复利', '定投'],
  formula: ['公式', '万能公式', '几何公式', '物理公式'],
  discount: ['折扣', '满减', '小费', '优惠'],
  account: ['记账', '账本', '收支'],
  memo: ['备忘录', '便签', '笔记'],
  health: ['健康', 'bmi', '体脂', '体重', '热量'],
  graph: ['图像', '绘图', '函数图像', '坐标'],
  length: ['长度', '厘米', '米', '公里', '英寸'],
  area: ['面积', '平方米', '平方'],
  volume: ['体积', '立方', '升', '毫升'],
  temperature: ['温度', '摄氏', '华氏'],
  speed: ['速度', '时速', '米每秒'],
  time: ['时间', '小时', '分钟', '秒'],
  weight: ['重量', '体重', '公斤', '千克', '斤'],
  power: ['功率', '瓦', '千瓦'],
  heat: ['热量', '焦耳', '卡路里'],
  force: ['力', '牛顿'],
  pressure: ['压力', '压强', '帕'],
  capacity: ['容量', '容积'],
  data: ['数据', '存储', '字节', 'mb', 'gb']
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[？?！!，,。.\s]/g, '')
}

export default function Home() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const languages = [
    { code: 'zh-CN', name: '简体中文' },
    { code: 'en-US', name: 'English' },
    { code: 'zh-TW', name: '繁體中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'pt-BR', name: 'Português (Brasil)' },
    { code: 'ru', name: 'Русский' },
    { code: 'ar', name: 'العربية' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'ms', name: 'Bahasa Melayu' },
    { code: 'th', name: 'ไทย' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'pl', name: 'Polski' },
    { code: 'uk', name: 'Українська' },
    { code: 'fa', name: 'فارسی' },
    { code: 'ur', name: 'اردو' },
    { code: 'he', name: 'עברית' },
    { code: 'sw', name: 'Kiswahili' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'tl', name: 'Tagalog' }
  ]

  const [showLangMenu, setShowLangMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const toggleHistory = useHistoryStore((state) => state.toggleSidebar)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
    setShowLangMenu(false)
  }

  const currentLanguageName = useMemo(() => {
    return languages.find((item) => item.code === i18n.language)?.name || 'English'
  }, [i18n.language])

  const smartResult = useMemo(() => {
    return getSmartResult(searchQuery)
  }, [searchQuery])

  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return null

    const query = searchQuery.toLowerCase().trim()
    const normalizedQuery = normalizeSearchText(query)
    const matched = new Map<string, ModuleItem>()

    allModules.forEach((module) => {
      const name = t(`modules.items.${module.id}`).toLowerCase()
      const normalizedName = normalizeSearchText(name)
      const keywords = moduleKeywords[module.id] || []
      const keywordMatched = keywords.some((keyword) => {
        const normalizedKeyword = normalizeSearchText(keyword)
        return normalizedKeyword.includes(normalizedQuery) || normalizedQuery.includes(normalizedKeyword)
      })

      if (
        name.includes(query) ||
        query.includes(name) ||
        normalizedName.includes(normalizedQuery) ||
        normalizedQuery.includes(normalizedName) ||
        module.id.toLowerCase().includes(query) ||
        keywordMatched
      ) {
        matched.set(module.id, module)
      }
    })

    if (smartResult?.action?.route) {
      const smartModule = allModules.find((module) => module.route === smartResult.action?.route)
      if (smartModule) {
        matched.set(smartModule.id, smartModule)
      }
    }

    return Array.from(matched.values())
  }, [searchQuery, smartResult, t])

  const handleAction = (result: SmartResult) => {
    if (result.action) {
      if (result.action.route) {
        navigate(result.action.route, { state: result.action.params })
      } else if (result.action.params?.copy) {
        navigator.clipboard.writeText(result.action.params.copy)
      }
    }
  }

  return (
    <div className="home">
      <header className="header">
        <div className="title-container">
          <img src="计算器.png" alt={t('common.app_icon_alt')} className="title-icon" />
          <h1 className="title">{t('common.app_name')}</h1>
          <div className="title-divider"></div>
          <span className="title-subtext">{t('common.subtext')}</span>
        </div>

        <div className="header-actions">
          <button
            className="custom-button"
            onClick={async () => {
              try {
                const url = `${API_BASE_URL}${API_ENDPOINTS.GET_CUSTOM_URL}`
                const response = await fetch(url, { method: 'POST' })
                const result = await response.json()
                if (result.code === 1) {
                  await openExternalUrl(result.data.url)
                } else {
                  console.error('获取软件定制链接失败:', result.msg)
                }
              } catch (error) {
                console.error('获取软件定制链接失败:', error)
              }
            }}
          >
            {t('common.software_custom')}
          </button>
          <button
            className="custom-button"
            onClick={async () => {
              const url = await getFeedbackUrl('10006')
              if (url) {
                await openExternalUrl(url)
              }
            }}
          >
            {t('common.feedback')}
          </button>
          <div className="language-selector-container">
            <button
              className={`custom-button language-btn ${showLangMenu ? 'active' : ''}`}
              onClick={() => setShowLangMenu(!showLangMenu)}
              title={t('common.language_switch')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M5 8l6 6M4 14l6-6M2 5h12M7 2h1M22 22l-5-10-5 10M12.8 18h8.4" />
              </svg>
              <span>{currentLanguageName}</span>
              <svg className={`chevron-icon ${showLangMenu ? 'up' : 'down'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {showLangMenu && (
              <>
                <div className="language-menu-overlay" onClick={() => setShowLangMenu(false)} />
                <div className="language-menu">
                  <div className="language-menu-header">{t('common.language_switch')}</div>
                  <div className="language-grid">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        className={`language-item ${i18n.language === lang.code ? 'selected' : ''}`}
                        onClick={() => changeLanguage(lang.code)}
                      >
                        <span className="lang-name">{lang.name}</span>
                        {i18n.language === lang.code && (
                          <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="12" height="12">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <button className="history-trigger" onClick={toggleHistory} title={t('common.history')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
          </button>
          <LoginButton />
          <ThemeToggle />
          <WindowControls />
        </div>
      </header>

      <div className="search-section">
        <div className="search-container">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder={t('home.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="search-tips">
            <span className="tip-label">{t('home.smart_tips_label')}</span>
            <button className="tip-item" onClick={() => setSearchQuery(t('home.tips.date'))}>{t('home.tips.date')}</button>
            <button className="tip-item" onClick={() => setSearchQuery(t('home.tips.tax'))}>{t('home.tips.tax')}</button>
            <button className="tip-item" onClick={() => setSearchQuery(t('home.tips.uppercase'))}>{t('home.tips.uppercase')}</button>
            <button className="tip-item" onClick={() => setSearchQuery(t('home.tips.unit'))}>{t('home.tips.unit')}</button>
          </div>
        </div>
      </div>

      <main className="main">
        {smartResult && (
          <div className="smart-result-card" onClick={() => handleAction(smartResult)} style={{ cursor: 'pointer' }}>
            <div className="smart-header">
              <div className="smart-title">
                <svg className="smart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                {smartResult.title}
              </div>
              <span className="smart-tag">{t('home.smart_tag')}</span>
            </div>
            <div className="smart-content">{smartResult.content}</div>
            {smartResult.action && (
              <button className="smart-action-btn" onClick={() => handleAction(smartResult)}>
                {smartResult.action.label}
              </button>
            )}
          </div>
        )}

        {filteredModules ? (
          <section className="category search-results">
            <h2 className="category-title">{t('home.search_results_title')} ({filteredModules.length})</h2>
            {filteredModules.length > 0 ? (
              <div className="module-grid">
                {filteredModules.map((module) => (
                  <ModuleCard key={module.id} module={module} />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                  <path d="M15 8l-8 8M7 8l8 8" />
                </svg>
                <p>{t('home.no_results_text')}</p>
              </div>
            )}
          </section>
        ) : (
          moduleCategories.map((category) => (
            <section key={category.id} className="category">
              <h2 className="category-title">{t(`modules.categories.${category.id}`)}</h2>
              <div className="module-grid">
                {category.modules.map((module) => (
                  <ModuleCard key={module.id} module={module} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <footer className="footer">
        <img src="icon.ico" alt={t('common.icon_alt')} className="footer-icon" />
        <span className="footer-text">{t('common.subtext')}</span>
      </footer>
    </div>
  )
}
