import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface HistoryItem {
  id: string
  expression: string
  result: string
  timestamp: number
  type: 'basic' | 'scientific' | 'converter' | 'tool' | 'health' | 'discount' | 'currency' | 'tax'
  title?: string // 可选标题，用于非数学计算类记录
}

interface HistoryState {
  history: HistoryItem[]
  isOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  addHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void
  clearHistory: () => void
  removeHistoryItem: (id: string) => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],
      isOpen: false,
      toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
      setSidebarOpen: (open) => set({ isOpen: open }),
      addHistory: (item) => set((state) => ({
        history: [
          {
            ...item,
            id: Math.random().toString(36).substring(2, 9),
            timestamp: Date.now(),
          },
          ...state.history,
        ].slice(0, 100), // Keep last 100 items
      })),
      clearHistory: () => set({ history: [] }),
      removeHistoryItem: (id) => set((state) => ({
        history: state.history.filter((item) => item.id !== id),
      })),
    }),
    {
      name: 'calculator-history',
    }
  )
)
