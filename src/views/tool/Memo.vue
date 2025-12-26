<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()

interface MemoItem {
  id: number
  title: string
  content: string
  color: string
  createdAt: string
  updatedAt: string
  pinned: boolean
}

const memos = ref<MemoItem[]>([])
const showEditor = ref(false)
const editingMemo = ref<MemoItem | null>(null)
const searchQuery = ref('')
const showDeleteConfirm = ref(false)
const deleteTargetId = ref<number | null>(null)

const colors = ['#4a90d9', '#27ae60', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e91e63', '#607d8b']

const newMemo = ref({
  title: '',
  content: '',
  color: colors[0]
})

const filteredMemos = computed(() => {
  let result = [...memos.value]
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(m => m.title.toLowerCase().includes(query) || m.content.toLowerCase().includes(query))
  }
  // 置顶的排前面，然后按更新时间排序
  return result.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
})

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

const openNewMemo = () => {
  editingMemo.value = null
  newMemo.value = { title: '', content: '', color: colors[0] }
  showEditor.value = true
}

const openEditMemo = (memo: MemoItem) => {
  editingMemo.value = memo
  newMemo.value = { title: memo.title, content: memo.content, color: memo.color }
  showEditor.value = true
}

const saveMemo = () => {
  if (!newMemo.value.title.trim() && !newMemo.value.content.trim()) {
    showEditor.value = false
    return
  }
  
  const now = new Date().toISOString()
  
  if (editingMemo.value) {
    const index = memos.value.findIndex(m => m.id === editingMemo.value!.id)
    if (index !== -1) {
      memos.value[index] = {
        ...memos.value[index],
        title: newMemo.value.title || '无标题',
        content: newMemo.value.content,
        color: newMemo.value.color,
        updatedAt: now
      }
    }
  } else {
    memos.value.push({
      id: Date.now(),
      title: newMemo.value.title || '无标题',
      content: newMemo.value.content,
      color: newMemo.value.color,
      createdAt: now,
      updatedAt: now,
      pinned: false
    })
  }
  
  saveToStorage()
  showEditor.value = false
}

const deleteMemo = (id: number) => {
  deleteTargetId.value = id
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (deleteTargetId.value) {
    memos.value = memos.value.filter(m => m.id !== deleteTargetId.value)
    saveToStorage()
    showEditor.value = false
  }
  showDeleteConfirm.value = false
  deleteTargetId.value = null
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  deleteTargetId.value = null
}

const togglePin = (memo: MemoItem) => {
  memo.pinned = !memo.pinned
  saveToStorage()
}

const saveToStorage = () => {
  localStorage.setItem('memos', JSON.stringify(memos.value))
}

const loadFromStorage = () => {
  const data = localStorage.getItem('memos')
  if (data) memos.value = JSON.parse(data)
}

const getPreview = (content: string) => {
  return content.length > 50 ? content.slice(0, 50) + '...' : content
}

onMounted(() => loadFromStorage())
</script>

<template>
  <div class="memo-page">
    <!-- 列表页面 -->
    <div class="list-view" v-if="!showEditor">
      <header class="header">
        <button class="back-btn" @click="router.back()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="title">备忘录</h1>
        <ThemeToggle />
      </header>

      <main class="main">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input type="text" v-model="searchQuery" placeholder="搜索备忘录...">
        </div>

        <div class="memo-grid" v-if="filteredMemos.length > 0">
          <div v-for="memo in filteredMemos" :key="memo.id" 
            class="memo-card" :style="{ borderLeftColor: memo.color }"
            @click="openEditMemo(memo)">
            <div class="memo-header">
              <span class="memo-title">{{ memo.title }}</span>
              <div class="memo-actions">
                <button class="pin-btn" :class="{ pinned: memo.pinned }" @click.stop="togglePin(memo)">📌</button>
                <button class="delete-item-btn" @click.stop="deleteMemo(memo.id)" title="删除">🗑️</button>
              </div>
            </div>
            <p class="memo-preview">{{ getPreview(memo.content) }}</p>
            <span class="memo-date">{{ formatDate(memo.updatedAt) }}</span>
          </div>
        </div>

        <div class="empty-state" v-else>
          <div class="empty-icon">📝</div>
          <p>{{ searchQuery ? '没有找到相关备忘录' : '暂无备忘录' }}</p>
          <p class="empty-hint">点击右下角按钮创建新备忘录</p>
        </div>

        <button class="add-btn" @click="openNewMemo">+</button>
      </main>
    </div>

    <!-- 编辑页面 -->
    <div class="editor-view" v-else>
      <header class="editor-header">
        <button class="back-btn" @click="saveMemo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="editor-actions">
          <button v-if="editingMemo" class="delete-btn" @click="deleteMemo(editingMemo.id)">🗑️</button>
          <button class="save-btn" @click="saveMemo">完成</button>
        </div>
      </header>

      <div class="editor-content">
        <input type="text" v-model="newMemo.title" class="title-input" placeholder="标题">
        
        <div class="color-picker">
          <span class="color-label">颜色标签</span>
          <div class="color-options">
            <button v-for="color in colors" :key="color" 
              :class="['color-btn', { active: newMemo.color === color }]"
              :style="{ background: color }"
              @click="newMemo.color = color">
            </button>
          </div>
        </div>

        <textarea v-model="newMemo.content" class="content-input" placeholder="写点什么..."></textarea>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div class="confirm-overlay" v-if="showDeleteConfirm" @click.self="cancelDelete">
      <div class="confirm-modal">
        <div class="confirm-icon">🗑️</div>
        <h3>确认删除</h3>
        <p>确定要删除这条备忘录吗？删除后无法恢复。</p>
        <div class="confirm-actions">
          <button class="cancel-btn" @click="cancelDelete">取消</button>
          <button class="delete-confirm-btn" @click="confirmDelete">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.memo-page { height: 100vh; background: var(--bg); display: flex; flex-direction: column; overflow: hidden; }
.list-view { height: 100%; display: flex; flex-direction: column; overflow: hidden; }

.header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.back-btn {
  width: 36px; height: 36px; border: none; border-radius: 50%;
  background: var(--card-bg); color: var(--text); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  svg { width: 18px; height: 18px; }
  &:hover { background: var(--hover); }
}
.title { font-size: 20px; font-weight: 600; color: var(--text); }

.main { flex: 1; max-width: 600px; margin: 0 auto; padding: 12px; width: 100%; overflow: auto; position: relative; }

.search-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 14px; background: var(--card-bg); border-radius: 10px;
  margin-bottom: 12px; box-shadow: 0 2px 10px var(--shadow);
  .search-icon { font-size: 16px; }
  input {
    flex: 1; background: none; border: none; color: var(--text);
    font-size: 15px; outline: none;
    &::placeholder { color: var(--text-secondary); }
  }
}

.memo-grid { display: flex; flex-direction: column; gap: 10px; }

.memo-card {
  background: var(--card-bg); border-radius: 10px; padding: 14px;
  border-left: 4px solid; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 10px var(--shadow);
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px var(--shadow); }
}
.memo-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
.memo-title { font-size: 16px; font-weight: 600; color: var(--text); flex: 1; }
.memo-actions { display: flex; gap: 4px; align-items: center; }
.pin-btn {
  background: none; border: none; font-size: 16px; cursor: pointer;
  opacity: 0.3; transition: opacity 0.2s; padding: 4px;
  &.pinned { opacity: 1; }
  &:hover { opacity: 0.8; }
}
.delete-item-btn {
  background: none; border: none; font-size: 14px; cursor: pointer;
  opacity: 0.3; transition: all 0.2s; padding: 4px;
  border-radius: 4px;
  &:hover { opacity: 1; background: rgba(231, 76, 60, 0.1); }
}
.memo-preview { font-size: 15px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 8px; }
.memo-date { font-size: 13px; color: var(--text-secondary); opacity: 0.7; }

.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
.empty-icon { font-size: 56px; margin-bottom: 12px; opacity: 0.6; }
.empty-hint { font-size: 12px; margin-top: 6px; opacity: 0.7; }

.add-btn {
  position: fixed; bottom: 24px; right: 24px; width: 52px; height: 52px;
  border: none; border-radius: 50%; background: var(--primary-color); color: white;
  font-size: 28px; cursor: pointer; box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
  transition: transform 0.2s;
  &:hover { transform: scale(1.1); }
}

/* 编辑页面 */
.editor-view { height: 100%; display: flex; flex-direction: column; overflow: hidden; }
.editor-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.editor-actions { display: flex; gap: 10px; }
.delete-btn {
  width: 36px; height: 36px; border: none; border-radius: 50%;
  background: var(--card-bg); font-size: 16px; cursor: pointer;
  &:hover { background: #fee; }
}
.save-btn {
  padding: 10px 18px; border: none; border-radius: 8px;
  background: var(--primary-color); color: white; font-size: 15px;
  cursor: pointer; font-weight: 500;
  &:hover { opacity: 0.9; }
}

.editor-content {
  flex: 1; display: flex; flex-direction: column;
  max-width: 600px; margin: 0 auto; width: 100%; padding: 16px; overflow: hidden;
}
.title-input {
  background: none; border: none; font-size: 22px; font-weight: 600;
  color: var(--text); outline: none; margin-bottom: 12px; flex-shrink: 0;
  &::placeholder { color: var(--text-secondary); }
}

.color-picker { margin-bottom: 12px; flex-shrink: 0; }
.color-label { font-size: 14px; color: var(--text-secondary); display: block; margin-bottom: 8px; }
.color-options { display: flex; gap: 8px; }
.color-btn {
  width: 28px; height: 28px; border: 2px solid transparent; border-radius: 50%;
  cursor: pointer; transition: transform 0.2s;
  &.active { border-color: var(--text); transform: scale(1.1); }
  &:hover { transform: scale(1.1); }
}

.content-input {
  flex: 1; background: var(--card-bg); border: none; border-radius: 10px;
  padding: 14px; font-size: 16px; color: var(--text); outline: none;
  resize: none; line-height: 1.5; min-height: 0;
  &::placeholder { color: var(--text-secondary); }
}

/* 删除确认弹窗 */
.confirm-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); display: flex; align-items: center;
  justify-content: center; z-index: 1000;
}
.confirm-modal {
  background: var(--card-bg); border-radius: 20px; padding: 30px;
  width: 90%; max-width: 320px; text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.confirm-icon { font-size: 48px; margin-bottom: 16px; }
.confirm-modal h3 { font-size: 20px; color: var(--text); margin-bottom: 10px; }
.confirm-modal p { font-size: 15px; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.5; }
.confirm-actions { display: flex; gap: 12px; }
.cancel-btn {
  flex: 1; padding: 14px; border: 1px solid var(--border); border-radius: 10px;
  background: var(--bg); color: var(--text); font-size: 16px; cursor: pointer;
  &:hover { background: var(--hover); }
}
.delete-confirm-btn {
  flex: 1; padding: 14px; border: none; border-radius: 10px;
  background: #e74c3c; color: white; font-size: 16px; cursor: pointer;
  &:hover { background: #c0392b; }
}
</style>
