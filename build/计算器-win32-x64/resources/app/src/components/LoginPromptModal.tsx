import { useAuthStore } from '@/stores/auth'
import {
  generateSignedNonce,
  encodeSignedNonce,
  getWebLoginUrl,
  pollToken,
  getUserInfo
} from '@/services/auth'
import './LoginPromptModal.scss'

interface LoginPromptModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginPromptModal({ isOpen, onClose }: LoginPromptModalProps) {
  const {
    setToken,
    setUserInfo,
    setIsLoading,
    setError
  } = useAuthStore()

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 1. 生成带签名的nonce
      const signedNonce = await generateSignedNonce()
      const encodedNonce = encodeSignedNonce(signedNonce)

      // 2. 获取网页端登录地址
      const webLoginUrl = await getWebLoginUrl()

      // 3. 打开浏览器登录页面
      const loginUrl = `${webLoginUrl}?client_type=desktop&client_nonce=${encodedNonce}`
      const loginWindow = window.open(loginUrl, '_blank')
      
      if (!loginWindow) {
        setError('浏览器弹窗被阻止，请检查浏览器设置')
        setIsLoading(false)
        return
      }

      // 4. 轮询获取token（1秒超时）
      try {
        const newToken = await pollToken(encodedNonce, 1)
        setToken(newToken)

        // 5. 获取用户信息
        const info = await getUserInfo(newToken)
        setUserInfo(info)
      } catch (error) {
        console.error('轮询或获取用户信息失败:', error)
        if (error instanceof Error && error.message === '登录已取消') {
          setError('登录已取消')
        } else if (error instanceof Error && error.message === '登录超时') {
          setError('登录超时，请重试')
        } else {
          setError(error instanceof Error ? error.message : '登录失败')
        }
        setToken(null)
        setUserInfo(null)
      }
    } catch (error) {
      console.error('登录流程错误:', error)
      setError(error instanceof Error ? error.message : '登录失败')
    } finally {
      setIsLoading(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="login-prompt-overlay" onClick={onClose}>
      <div className="login-prompt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="login-icon">⊙</span>
            <span>登录提醒</span>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <p className="main-text">
            您需要登录后才能使用该功能。登录后可以享受完整的服务体验。
          </p>
          <div className="info-box">
            <p>点击下方按钮将打开登录页面，请在登录页面完成登录操作。</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="login-btn" onClick={handleLogin}>
            <span className="btn-icon">⊙</span>
            <span>立即登录</span>
          </button>
          <p className="footer-text">登录后即可使用所有功能</p>
        </div>
      </div>
    </div>
  )
}
