import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth'
import {
  generateSignedNonce,
  encodeSignedNonce,
  getWebLoginUrl,
  pollToken,
  getUserInfo,
  logout
} from '@/services/auth'
import Toast from './Toast'
import './LoginButton.scss'

export default function LoginButton() {
  const { t } = useTranslation()
  const {
    token,
    userInfo,
    isLoading,
    error,
    setToken,
    setUserInfo,
    setIsLoading,
    setError,
    clearAuth
  } = useAuthStore()

  const [menuOpen, setMenuOpen] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const cancelFlagRef = useRef(false)

  const showToast = (message: string) => {
    setToastMessage(message)
    setToastVisible(true)
  }

  const handleCancelLogin = () => {
    cancelFlagRef.current = true
    setShowCancelDialog(false)
    setIsLoading(false)
    showToast(t('auth.login_cancelled'))
  }

  const handleLogin = async () => {
    console.log('Login button clicked');
    try {
      setIsLoading(true)
      setError(null)
      cancelFlagRef.current = false

      console.log('=== 开始登录流程 ===')

      // 1. 生成带签名的nonce
      const signedNonce = generateSignedNonce()
      console.log('签名的 nonce:', signedNonce)
      
      const encodedNonce = encodeSignedNonce(signedNonce)
      console.log('编码后的 nonce:', encodedNonce)

      // 2. 获取网页端登录地址
      const webLoginUrl = await getWebLoginUrl()
      console.log('网页端登录地址:', webLoginUrl)

      // 3. 构建完整登录URL并打开浏览器
      const loginUrl = `${webLoginUrl}?client_type=desktop&client_nonce=${encodedNonce}`
      console.log('完整登录 URL:', loginUrl)
      
      // 打开登录页面
      window.open(loginUrl, '_blank')
      
      // 显示取消登录对话框
      setShowCancelDialog(true)

      // 4. 轮询获取token，传入取消检测函数
      try {
        const newToken = await pollToken(encodedNonce, 300, () => cancelFlagRef.current)
        setShowCancelDialog(false)
        
        console.log('获取到 token:', newToken)
        setToken(newToken)

        // 5. 获取用户信息
        const info = await getUserInfo(newToken)
        console.log('用户信息:', info)
        setUserInfo(info)
        
        console.log('=== 登录成功 ===')
      } catch (error) {
        setShowCancelDialog(false)
        console.error('登录失败:', error)
        
        // 如果是用户主动取消
        if (cancelFlagRef.current) {
          console.log('用户取消了登录')
          // Toast 已在 handleCancelLogin 中显示
        } else if (error instanceof Error && error.message === '登录已取消') {
          showToast(t('auth.login_cancelled'))
        } else if (error instanceof Error) {
          setError(error.message)
        } else {
          setError(t('auth.login_failed'))
        }
        setToken(null)
        setUserInfo(null)
      }
    } catch (error) {
      console.error('登录流程错误:', error)
      setError(error instanceof Error ? error.message : t('auth.login_failed'))
      setShowCancelDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      if (token) {
        await logout(token)
      }
      clearAuth()
    } catch (error) {
      console.error('退出登录失败:', error)
      clearAuth()
    } finally {
      setIsLoading(false)
    }
  }

  // 已登录状态
  if (token && userInfo) {
    return (
      <div className="login-button-container">
        <button
          className="login-button logged-in"
          onClick={() => setMenuOpen((open) => !open)}
          disabled={isLoading}
          title={t('auth.click_to_logout')}
        >
          <div className="user-avatar">
            <img src={userInfo.avatar} alt={userInfo.nickname} />
          </div>
          <span className="user-name">{userInfo.nickname}</span>
        </button>
        {menuOpen && (
          <div className="login-menu">
            <div className="login-menu-header">
              <div className="login-menu-avatar">
                <img src={userInfo.avatar} alt={userInfo.nickname} />
              </div>
              <div>
                <div className="login-menu-name">{userInfo.nickname}</div>
                <div className="login-menu-status">{t('auth.logged_in')}</div>
              </div>
            </div>
            <div className="login-menu-divider" />
            <div
              className="login-menu-logout"
              onClick={() => {
                setMenuOpen(false)
                handleLogout()
              }}
            >
              <span className="login-menu-logout-icon">↩</span>
              <span>{t('auth.logout')}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 未登录状态
  return (
    <div className="login-button-container">
      <button
        className="login-button"
        onClick={handleLogin}
        disabled={isLoading}
        title={t('auth.click_to_login')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="login-text">{isLoading ? t('auth.logging_in') : t('auth.login_register')}</span>
      </button>
      {error && <div className="login-error-text">{error}</div>}
      
      {/* 取消登录对话框 */}
      {showCancelDialog && (
        <div className="toast-overlay">
          <div className="toast-container">
            <div className="toast-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div className="toast-message">{t('auth.complete_login_in_browser')}</div>
            <button className="toast-close cancel-btn" onClick={handleCancelLogin}>{t('auth.cancel_login')}</button>
          </div>
        </div>
      )}
      
      <Toast 
        message={toastMessage} 
        visible={toastVisible} 
        onClose={() => setToastVisible(false)} 
      />
    </div>
  )
}
