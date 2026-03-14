import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ToolHeader from '@/components/ToolHeader'
import './Memo.scss'

interface MemoItem {
  id: number
  title: string
  content: string
  color: string
  createdAt: string
  updatedAt: string
  pinned: boolean
}

const colors = ['#4a90d9', '#27ae60', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e91e63', '#607d8b']

function Memo() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [memos, setMemos] = useState<MemoItem[]>([])
  const [showEditor, setShowEditor] = useState(false)
  const [editingMemo, setEditingMemo] = useState<MemoItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [newMemo, setNewMemo] = useState({ title: '', content: '', color: colors[0] })

  useEffect(() => {
    const data = localStorage.getItem('memos')
    if (data) setMemos(JSON.parse(data))
  }, [])

  const saveToStorage = (newMemos: MemoItem[]) => localStorage.setItem('memos', JSON.stringify(newMemos))

  const filteredMemos = useMemo(() => {
    let result = [...memos]
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(m => m.title.toLowerCase().includes(query) || m.content.toLowerCase().includes(query))
    }
    return result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [memos, searchQuery])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return t('common.today') + ' ' + date.toTimeString().slice(0, 5)
    if (days === 1) return t('common.yesterday')
    if (days < 7) return `${days}${t('common.days_ago')}`
    return `${date.getMonth() + 1}${t('common.month_unit')}${date.getDate()}${t('common.day_unit')}`
  }

  const openNewMemo = () => { setEditingMemo(null); setNewMemo({ title: '', content: '', color: colors[0] }); setShowEditor(true) }
  const openEditMemo = (memo: MemoItem) => { setEditingMemo(memo); setNewMemo({ title: memo.title, content: memo.content, color: memo.color }); setShowEditor(true) }

  const saveMemo = () => {
    if (!newMemo.title.trim() && !newMemo.content.trim()) { setShowEditor(false); return }
    const now = new Date().toISOString()
    let newMemos: MemoItem[]
    if (editingMemo) {
      newMemos = memos.map(m => m.id === editingMemo.id ? { ...m, title: newMemo.title || t('tool.memo.no_title'), content: newMemo.content, color: newMemo.color, updatedAt: now } : m)
    } else {
      newMemos = [...memos, { id: Date.now(), title: newMemo.title || t('tool.memo.no_title'), content: newMemo.content, color: newMemo.color, createdAt: now, updatedAt: now, pinned: false }]
    }
    setMemos(newMemos); saveToStorage(newMemos); setShowEditor(false)
  }

  const deleteMemo = (id: number) => { setDeleteTargetId(id); setShowDeleteConfirm(true) }
  const confirmDelete = () => {
    if (deleteTargetId) { const newMemos = memos.filter(m => m.id !== deleteTargetId); setMemos(newMemos); saveToStorage(newMemos); setShowEditor(false) }
    setShowDeleteConfirm(false); setDeleteTargetId(null)
  }
  const cancelDelete = () => { setShowDeleteConfirm(false); setDeleteTargetId(null) }
  const togglePin = (memo: MemoItem) => {
    const newMemos = memos.map(m => m.id === memo.id ? { ...m, pinned: !m.pinned } : m)
    setMemos(newMemos); saveToStorage(newMemos)
  }
  const getPreview = (content: string) => content.length > 50 ? content.slice(0, 50) + '...' : content

  return (
    <div className="tool-page memo">
      {!showEditor ? (
        <div className="list-view">
          <ToolHeader title={t('tool.memo.title')} />
          <main className="tool-content">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('tool.memo.search_placeholder')} />
            </div>
            {filteredMemos.length > 0 ? (
              <div className="memo-grid">
                {filteredMemos.map(memo => (
                  <div key={memo.id} className="memo-card" style={{ borderLeftColor: memo.color }} onClick={() => openEditMemo(memo)}>
                    <div className="memo-header">
                      <span className="memo-title">{memo.title || t('tool.memo.no_title')}</span>
                      {memo.pinned && <span className="pin-icon">📌</span>}
                    </div>
                    <div className="memo-preview">{getPreview(memo.content)}</div>
                    <div className="memo-footer">
                      <span className="memo-date">{formatDate(memo.updatedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <p>{t('tool.memo.no_memos')}</p>
              </div>
            )}
            <button className="add-btn" onClick={openNewMemo}>+</button>
          </main>
        </div>
      ) : (
        <div className="editor-view">
          <ToolHeader 
            title={editingMemo ? t('common.save') : t('tool.memo.title')} 
            onBack={saveMemo}
          />
          <main className="tool-content">
            <div className="editor-header">
              <input 
                type="text" 
                className="title-input" 
                value={newMemo.title} 
                onChange={e => setNewMemo({ ...newMemo, title: e.target.value })} 
                placeholder={t('tool.memo.title_label')} 
              />
              <div className="color-picker">
                {colors.map(c => (
                  <div 
                    key={c} 
                    className={`color-item ${newMemo.color === c ? 'active' : ''}`} 
                    style={{ backgroundColor: c }}
                    onClick={() => setNewMemo({ ...newMemo, color: c })}
                  />
                ))}
              </div>
            </div>
            <textarea 
              className="content-input" 
              value={newMemo.content} 
              onChange={e => setNewMemo({ ...newMemo, content: e.target.value })} 
              placeholder={t('tool.memo.content_placeholder')}
            />
            <div className="editor-footer">
              <span className="date-info">
                {editingMemo ? `${t('common.save')}: ${formatDate(editingMemo.updatedAt)}` : formatDate(new Date().toISOString())}
              </span>
              <div className="actions">
                {editingMemo && (
                  <button className="pin-btn" onClick={() => togglePin(editingMemo)}>
                    {editingMemo.pinned ? t('tool.memo.unpin') : t('tool.memo.pin')}
                  </button>
                )}
                <button className="delete-btn" onClick={() => editingMemo && deleteMemo(editingMemo.id)}>
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </main>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="confirm-overlay" onClick={cancelDelete}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">🗑️</div>
            <h3>{t('common.confirm_delete')}</h3>
            <p>{t('tool.memo.delete_confirm_text')}</p>
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={cancelDelete}>{t('common.cancel')}</button>
              <button className="delete-confirm-btn" onClick={confirmDelete}>{t('common.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Memo
