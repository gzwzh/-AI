import React from 'react'
import { useHistoryStore, HistoryItem } from '@/stores/history'
import './HistorySidebar.scss'

const HistorySidebar: React.FC = () => {
  const { history, isOpen, setSidebarOpen, clearHistory, removeHistoryItem } = useHistoryStore()

  if (!isOpen) return null

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  const getTypeLabel = (type: HistoryItem['type']) => {
    const labels: Record<string, string> = {
      basic: '基础计算',
      scientific: '科学计算',
      converter: '单位换算',
      currency: '汇率换算',
      health: '健康计算',
      discount: '折扣小费',
      tax: '个税计算',
      tool: '工具'
    }
    return labels[type] || '记录'
  }

  return (
    <div className="history-sidebar-overlay" onClick={() => setSidebarOpen(false)}>
      <div className="history-sidebar" onClick={(e) => e.stopPropagation()}>
        <header className="sidebar-header">
          <h3>计算历史</h3>
          <div className="header-actions">
            <button className="clear-btn" onClick={clearHistory} title="清空历史">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
            <button className="close-btn" onClick={() => setSidebarOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </header>

        <div className="history-list">
          {history.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
              </svg>
              <p>暂无历史记录</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="history-item">
                <div className="item-meta">
                  <span className={`type-tag ${item.type}`}>{getTypeLabel(item.type)}</span>
                  <span className="time">{formatTime(item.timestamp)}</span>
                  <button className="delete-item" onClick={() => removeHistoryItem(item.id)}>×</button>
                </div>
                {item.title && <div className="item-title">{item.title}</div>}
                <div className="item-expression">{item.expression}</div>
                <div className="item-result">= {item.result}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default HistorySidebar
