import { create } from 'zustand'
import { checkLogin } from '@/services/auth'

interface UserInfo {
  avatar: string
  nickname: string
}

interface AuthState {
  token: string | null
  userInfo: UserInfo | null
  isLoading: boolean
  error: string | null
  isPolling: boolean
  pollCancelFlag: boolean

  // 设置token
  setToken: (token: string | null) => void
  // 设置用户信息
  setUserInfo: (userInfo: UserInfo | null) => void
  // 设置加载状态
  setIsLoading: (loading: boolean) => void
  // 设置错误信息
  setError: (error: string | null) => void
  // 设置轮询状态
  setIsPolling: (polling: boolean) => void
  // 设置取消轮询标志
  setPollCancelFlag: (flag: boolean) => void
  // 初始化登录状态（从本地存储恢复）
  initializeAuth: () => Promise<void>
  // 清除所有状态
  clearAuth: () => void
}

const STORAGE_KEY = 'auth_token'
const USER_INFO_KEY = 'user_info'

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  userInfo: null,
  isLoading: false,
  error: null,
  isPolling: false,
  pollCancelFlag: false,

  setToken: (token) => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    set({ token })
  },

  setUserInfo: (userInfo) => {
    if (userInfo) {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
    } else {
      localStorage.removeItem(USER_INFO_KEY)
    }
    set({ userInfo })
  },

  setIsLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  setIsPolling: (polling) => set({ isPolling: polling }),

  setPollCancelFlag: (flag) => set({ pollCancelFlag: flag }),

  initializeAuth: async () => {
    const token = localStorage.getItem(STORAGE_KEY)
    const userInfoStr = localStorage.getItem(USER_INFO_KEY)

    if (token) {
      set({ token })
      // 验证token是否有效
      const isValid = await checkLogin(token)
      if (!isValid) {
        get().clearAuth()
      } else if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr)
          set({ userInfo })
        } catch (error) {
          console.error('解析用户信息失败：', error)
        }
      }
    }
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(USER_INFO_KEY)
    set({
      token: null,
      userInfo: null,
      error: null,
      isPolling: false,
      pollCancelFlag: false
    })
  }
}))
