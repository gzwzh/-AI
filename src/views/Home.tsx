import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
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
      m.name.toLowerCase().includes(query) || 
      m.id.toLowerCase().includes(query)
    )
  }, [searchQuery])

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
          <img src="计算器.png" alt="全能计算器图标" className="title-icon" />
          <h1 className="title">全能计算器</h1>
          <div className="title-divider"></div>
          <span className="title-subtext">鲲穹AI旗下产品</span>
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
                console.error('获取需求定制页面链接失败:', result.msg);
              }
            } catch (error) {
              console.error('获取需求定制页面链接失败:', error);
            }
          }}>
            软件定制
          </button>
          <button className="custom-button" onClick={async () => {
            const url = await getFeedbackUrl('10006');
            if (url) {
              window.open(url, '_blank');
            }
          }}>
            问题反馈
          </button>
          <button className="history-trigger" onClick={toggleHistory} title="计算历史">
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
              placeholder="试试 AI 搜索，如：100美元、25的40%、100cm to m..." 
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
            <span className="tip-label">智能推荐:</span>
            <button className="tip-item" onClick={() => setSearchQuery('100天后')}>100天后是哪天？</button>
            <button className="tip-item" onClick={() => setSearchQuery('工资15000扣多少税')}>工资1.5w扣多少税？</button>
            <button className="tip-item" onClick={() => setSearchQuery('1234.56转大写')}>金额转大写</button>
            <button className="tip-item" onClick={() => setSearchQuery('100cm to m')}>100cm to m</button>
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
              <span className="smart-tag">AI 智能解析</span>
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
            <h2 className="category-title">搜索结果 ({filteredModules.length})</h2>
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
                <p>未找到相关功能，换个关键词试试吧</p>
              </div>
            )}
          </section>
        ) : (
          moduleCategories.map((category) => (
            <section key={category.id} className="category">
              <h2 className="category-title">{category.name}</h2>
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
        <img src="icon.ico" alt="图标" className="footer-icon" />
        <span className="footer-text">鲲穹AI旗下产品</span>
      </footer>
    </div>
  )
}
