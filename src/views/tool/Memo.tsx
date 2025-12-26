import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'
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
    if (days === 0) return '今天 ' + date.toTimeString().slice(0, 5)
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  const openNewMemo = () => { setEditingMemo(null); setNewMemo({ title: '', content: '', color: colors[0] }); setShowEditor(true) }
  const openEditMemo = (memo: MemoItem) => { setEditingMemo(memo); setNewMemo({ title: memo.title, content: memo.content, color: memo.color }); setShowEditor(true) }

  const saveMemo = () => {
    if (!newMemo.title.trim() && !newMemo.content.trim()) { setShowEditor(false); return }
    const now = new Date().toISOString()
    let newMemos: MemoItem[]
    if (editingMemo) {
      newMemos = memos.map(m => m.id === editingMemo.id ? { ...m, title: newMemo.title || '无标题', content: newMemo.content, color: newMemo.color, updatedAt: now } : m)
    } else {
      newMemos = [...memos, { id: Date.now(), title: newMemo.title || '无标题', content: newMemo.content, color: newMemo.color, createdAt: now, updatedAt: now, pinned: false }]
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
    <div className="memo-page">
      {!showEditor ? (
        <div className="list-view">
          <header className="header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <h1 className="title">备忘录</h1>
            <ThemeToggle />
          </header>
          <main className="main">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="搜索备忘录..." />
            </div>
            {filteredMemos.length > 0 ? (
              <div className="memo-grid">
                {filteredMemos.map(memo => (
                  <div key={memo.id} className="memo-card" style={{ borderLeftColor: memo.color }} onClick={() => openEditMemo(memo)}>
                    <div className="memo-header">
                      <span className="memo-title">{memo.title}</span>
                      <div className="memo-actions">
                        <button className={`pin-btn ${memo.pinned ? 'pinned' : ''}`} onClick={e => { e.stopPropagation(); togglePin(memo) }}>📌</button>
                        <button className="delete-item-btn" onClick={e => { e.stopPropagation(); deleteMemo(memo.id) }}>🗑️</button>
                      </div>
                    </div>
                    <p className="memo-preview">{getPreview(memo.content)}</p>
                    <span className="memo-date">{formatDate(memo.updatedAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state"><div className="empty-icon">📝</div><p>{searchQuery ? '没有找到相关备忘录' : '暂无备忘录'}</p><p className="empty-hint">点击右下角按钮创建新备忘录</p></div>
            )}
            <button className="add-btn" onClick={openNewMemo}>+</button>
          </main>
        </div>
      ) : (
        <div className="editor-view">
          <header className="editor-header">
            <button className="back-btn" onClick={saveMemo}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div className="editor-actions">
              {editingMemo && <button className="delete-btn" onClick={() => deleteMemo(editingMemo.id)}>🗑️</button>}
              <button className="save-btn" onClick={saveMemo}>完成</button>
            </div>
          </header>
          <div className="editor-content">
            <input type="text" value={newMemo.title} onChange={e => setNewMemo({ ...newMemo, title: e.target.value })} className="title-input" placeholder="标题" />
            <div className="color-picker">
              <span className="color-label">颜色标签</span>
              <div className="color-options">
                {colors.map(color => (<button key={color} className={`color-btn ${newMemo.color === color ? 'active' : ''}`} style={{ background: color }} onClick={() => setNewMemo({ ...newMemo, color })} />))}
              </div>
            </div>
            <textarea value={newMemo.content} onChange={e => setNewMemo({ ...newMemo, content: e.target.value })} className="content-input" placeholder="写点什么..." />
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="confirm-overlay" onClick={cancelDelete}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">🗑️</div><h3>确认删除</h3><p>确定要删除这条备忘录吗？删除后无法恢复。</p>
            <div className="confirm-actions"><button className="cancel-btn" onClick={cancelDelete}>取消</button><button className="delete-confirm-btn" onClick={confirmDelete}>删除</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Memo
