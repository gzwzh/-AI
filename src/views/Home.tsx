import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { moduleCategories, allModules } from '@/config/modules'
import ModuleCard from '@/components/ModuleCard'
import ThemeToggle from '@/components/ThemeToggle'
import LoginButton from '@/components/LoginButton'
import WindowControls from '@/components/WindowControls'
import { useAuthStore } from '@/stores/auth'
import { useHistoryStore } from '@/stores/history'
import { getFeedbackUrl } from '@/services/feedback'
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api'
import { getSmartResult, SmartResult } from '@/services/aiSearch'
import './Home.scss'

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

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
    setShowLangMenu(false)
  }

  const currentLanguageName = useMemo(() => {
    return languages.find(l => l.code === i18n.language)?.name || 'English'
  }, [i18n.language])

  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const toggleHistory = useHistoryStore((state) => state.toggleSidebar)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // 智能语义结果
  const smartResult = useMemo(() => {
    return getSmartResult(searchQuery)
  }, [searchQuery])

  // 搜索过滤后的模块
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return null
    const query = searchQuery.toLowerCase()
    return allModules.filter(m => 
      t(`modules.items.${m.id}`).toLowerCase().includes(query) || 
      m.id.toLowerCase().includes(query)
    )
  }, [searchQuery, t])

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
          <button className="custom-button" onClick={async () => {
            try {
              const url = `${API_BASE_URL}${API_ENDPOINTS.GET_CUSTOM_URL}`;
              const response = await fetch(url, {
                method: 'POST'
              });
              const result = await response.json();
              if (result.code === 1) {
                window.open(result.data.url, '_blank');
              } else {
                console.error(`${t('common.software_custom')}${t('tool.relative.error_calc').replace('计算', '获取')}${t('common.error').replace('错误', '失败')}:`, result.msg);
              }
            } catch (error) {
              console.error(`${t('common.software_custom')}${t('tool.relative.error_calc').replace('计算', '获取')}${t('common.error').replace('错误', '失败')}:`, error);
            }
          }}>
            {t('common.software_custom')}
          </button>
          <button className="custom-button" onClick={async () => {
            const url = await getFeedbackUrl('10006');
            if (url) {
              window.open(url, '_blank');
            }
          }}>
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
                  <div className="language-menu-header">
                    {t('common.language_switch')}
                  </div>
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
              <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
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
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
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
                  <path d="M18 6L6 18M6 6l12 12"/>
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
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
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
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M15 8l-8 8M7 8l8 8"/>
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
