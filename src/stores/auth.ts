import { create } from 'zustand'
import { checkLogin } from '@/services/auth'
import { STORAGE_KEYS } from '@/config/api'

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

  setToken: (token: string | null) => void
  setUserInfo: (userInfo: UserInfo | null) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setIsPolling: (polling: boolean) => void
  setPollCancelFlag: (flag: boolean) => void
  initializeAuth: () => Promise<void>
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  userInfo: null,
  isLoading: false,
  error: null,
  isPolling: false,
  pollCancelFlag: false,

  setToken: (token) => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    }
    set({ token })
  },

  setUserInfo: (userInfo) => {
    if (userInfo) {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    }
    set({ userInfo })
  },

  setIsLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  setIsPolling: (polling) => set({ isPolling: polling }),

  setPollCancelFlag: (flag) => set({ pollCancelFlag: flag }),

  initializeAuth: async () => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    const userInfoStr = localStorage.getItem(STORAGE_KEYS.USER_INFO)

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
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    set({
      token: null,
      userInfo: null,
      error: null,
      isPolling: false,
      pollCancelFlag: false
    })
  }
}))
